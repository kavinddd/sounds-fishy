package main

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn *websocket.Conn
	room *Room

	Name string
	Role Role
}

// send message to client if any messages are broadcasted
func sendMessages(c *Client) {
	for msg := range c.room.broadcast {

		fmt.Println("Reading from broadcast channel: ", msg)

		for c := range c.room.clients {

			err := c.conn.WriteJSON(msg)

			if err != nil {
				log.Println("Error sending message: ", err)
			}

		}
	}

}

func NewClient(conn *websocket.Conn, name string) *Client {
	return &Client{
		conn: conn,
		room: &Room{},
		Name: name,
		Role: PLAYER,
	}
}
