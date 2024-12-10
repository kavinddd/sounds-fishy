package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

func routes(router *chi.Mux) {
	router.Use(cors)

	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
	})

	router.Get("/start/{roomCode}", handleConnectRoom)
}

func handleConnectRoom(w http.ResponseWriter, r *http.Request) {

	// TODO: validate the room code
	roomCode := chi.URLParam(r, "roomCode")

	upgrader := websocket.Upgrader{
		CheckOrigin:     func(r *http.Request) bool { return true },
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	defer conn.Close()

	if err != nil {
		log.Println(err)
	}

	client := &Client{conn: conn}

	room := getOrCreateRoom(roomCode)

	client.room = room

	room.register <- client
	go sendMessages(client)

	// send message to the current client if there is a broadcast
	// required goroutine to run parallel with under for inf loop
	// so we have two inf. loop
	// 1. read messgae (this gorutine)
	// 2. send message (another goroutine)

	// read message if any
	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		fmt.Println("Message received : ", msg)

		if err != nil {
			log.Println("Error reading message: ", err)
			break
		}

		room.broadcast <- &msg
	}

	room.unregister <- client
}
