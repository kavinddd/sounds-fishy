package main

import (
	"fmt"
	"log"
	"sync"
)

var rooms = make(map[string]*Room)
var roomLock sync.Mutex

type Room struct {
	roomCode   string
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
}

func (r *Room) run() {
	for {
		select {

		case client := <-r.register:
			log.Println("Register")
			r.clients[client] = true
			r.broadcast <- NewChatMsg("Welcome to the room")

			fmt.Println(r.clients)

		case client := <-r.unregister:
			log.Println("Unregister")
			delete(r.clients, client)
			r.broadcast <- NewChatMsg("Someone left the room")
			fmt.Println(r.clients)
			client.conn.Close()

		case msg := <-r.broadcast:
			log.Println("Broadcast: ", msg)

			for client := range r.clients {

				err := client.conn.WriteJSON(msg)

				if err != nil {
					log.Println("Error broadcasting message: ", err)
				}
			}

		}

	}
}

func getOrCreateRoom(roomCode string) *Room {
	// lock rooms map to ensure rooms map is accessed by a single coroutine at tatime
	roomLock.Lock()
	room, exists := rooms[roomCode]
	if !exists {
		room = &Room{
			roomCode:   roomCode,
			clients:    make(map[*Client]bool),
			register:   make(chan *Client),
			unregister: make(chan *Client),
			broadcast:  make(chan *Message),
		}

		rooms[roomCode] = room

		go room.run()
	}
	roomLock.Unlock()

	return room
}

func isRoomCodeValid(roomCode string) bool {

	return true
}

func generateRoomcode() string {
	return ""
}
