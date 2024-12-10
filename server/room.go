package main

import (
	"fmt"
	"log"
	"sync"
	"time"
)

var rooms = make(map[string]*Room)
var roomsLocker sync.Mutex

type MessageAndSender struct {
	Message *Message
	Client  *Client
}

type Room struct {
	status         RoomStatus
	roomCode       string
	host           *Client
	clientsReady   map[*Client]bool
	clients        map[*Client]bool
	register       chan *Client
	unregister     chan *Client
	broadcast      chan *Message
	gameController chan *MessageAndSender
}

func (r *Room) GetRoomInfo() *RoomInfo {
	return &RoomInfo{
		Capacity:   8,
		PlayerNum:  len(r.clients),
		RoomStatus: r.status,
	}
}

func (r *Room) IsHost(c *Client) bool {
	return c == r.host
}

func (r *Room) Terminate() {
	r.status = TERMINATE
	r.broadcast <- r.NewChatMsg(nil, "Host is left the room, until next time!")
	msg := r.NewGameMsg()
	for client := range r.clients {
		defer client.conn.Close()
		client.conn.WriteJSON(msg)
	}
}

/* create a ChatMessage with injected room infos */
func (r *Room) NewChatMsg(c *Client, msg string) *Message {
	return &Message{
		ToHost:      r.IsHost(c),
		RoomInfo:    r.GetRoomInfo(),
		Type:        CHAT,
		ChatContent: msg,
		GameContent: nil,
	}
}

func (r *Room) NewGameMsg() *Message {
	return &Message{
		ToHost:   false,
		RoomInfo: r.GetRoomInfo(),
		Type:     GAME,
		GameContent: &GameContent{
			State:   "",
			Role:    "",
			Content: "",
		},
	}

}

func (r *Room) ready(c *Client) {
	b, exist := r.clientsReady[c]

	if exist && b {
		log.Printf("%s is already ready", c.Name)
		return
	}

	r.clientsReady[c] = true

}

func (r *Room) run() {
	for {
		select {

		case client := <-r.register:
			// if its the first guy, make him host
			r.clients[client] = true
			if len(r.clients) == 1 {
				r.host = client
				r.broadcast <- r.NewChatMsg(client, "You are the host!")
				r.broadcast <- r.NewChatMsg(client, fmt.Sprintf("Let's invite your friend with the room code: %s", r.roomCode))
			}

			r.broadcast <- r.NewChatMsg(client, "Welcome to the room")

			fmt.Println(r.clients)

		case client := <-r.unregister:
			delete(r.clients, client)
			r.broadcast <- r.NewChatMsg(client, "Someone left the room")

			client.conn.Close()

			if r.IsHost(client) || len(r.clients) == 0 {
				r.Terminate()
			}

		case msg := <-r.broadcast:
			log.Println("Broadcast: ", msg)

			for client := range r.clients {

				err := client.conn.WriteJSON(msg)

				if err != nil {
					log.Println("Error broadcasting message: ", err)
				}
			}

		case msgAndSender := <-r.gameController:
			msg := msgAndSender.Message
			client := msgAndSender.Client
			room := client.room

			if msg.RoomInfo.RoomStatus == TO_START {
				if !room.IsHost(client) {
					log.Printf("Client -%s- which is not the host tried to start the game", client.Name)
					client.conn.Close()
					return
				}
				room.status = WAIT_READY
				waitReadyMsg := room.NewGameMsg()
				room.broadcast <- waitReadyMsg

				go func() {
					time.Sleep(3 * time.Second)
					if room.status != WAIT_READY {
						return
					}
					room.status = LOBBY
					failToStartMsg := room.NewGameMsg()
					room.broadcast <- failToStartMsg
					log.Printf("There is some client is not yet ready, please try again")
				}()

			}

			if msg.RoomInfo.RoomStatus == WAIT_READY {
				room.ready(client)

				if len(room.clientsReady) == len(room.clients) {
					room.status = IN_GAME
					gameStartMsg := room.NewGameMsg()
					gameStartMsg.GameContent.State = ASSIGN_ROLE

					for c := range r.clients {
						c.conn.WriteJSON(gameStartMsg)
					}
				}

				return
			}

		}

	}
}

func getOrCreateRoom(roomCode string) *Room {

	// lock rooms map to ensure rooms map is accessed by a single coroutine at a time
	roomsLocker.Lock()
	room, exists := rooms[roomCode]
	if !exists {
		room = &Room{
			roomCode:       roomCode,
			clients:        make(map[*Client]bool),
			register:       make(chan *Client),
			unregister:     make(chan *Client),
			broadcast:      make(chan *Message),
			gameController: make(chan *MessageAndSender),
		}

		rooms[roomCode] = room

		go room.run()
	}
	roomsLocker.Unlock()

	return room
}

func isRoomCodeValid(roomCode string) bool {

	return true
}

func generateRoomcode() string {
	return ""
}
