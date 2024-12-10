package main

// ======================================================================= //

type Message struct {
	Type        MessageType  `json:"type"`
	RoomStatus  RoomStatus   `json:"roomStatus"`
	ChatContent string       `json:"chatContent,omitempty"`
	GameContent *GameContent `json:"gameContent,omitempty"`
}

func NewChatMsg(chatMsg string) *Message {
	return &Message{
		Type:        CHAT,
		RoomStatus:  LOBBY,
		ChatContent: chatMsg,
		GameContent: nil,
	}
}

type GameContent struct {
	State   GameState `json:"state"`
	Role    Role      `json:"role"`
	Content string    `json:"content"`
}

// ======================================================================= //

type MessageType string

const (
	CHAT MessageType = "CHAT"
	GAME MessageType = "GAME"
)

type RoomStatus string

const (
	IN_GAME    RoomStatus = "IN_GAME"
	WAIT_READY RoomStatus = "WAIT_READY"
	LOBBY      RoomStatus = "LOBBY"
)

type Role string

const (
	PLAYER    Role = "PLYAER"
	RED_FISH  Role = "RED_FISH"
	BLUE_FISH Role = "BLUE_FISH"
)

type GameState string

const (
	ASSIGN_ROLE GameState = "ASSIGN_ROLE"
)
