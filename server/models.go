package main

// ======================================================================= //

type Message struct {
	ToHost      bool         `json:"toHost"`
	RoomInfo    *RoomInfo    `json:"roomInfo,omitempty"`
	Type        MessageType  `json:"type"`
	ChatContent string       `json:"chatContent,omitempty"`
	GameContent *GameContent `json:"gameContent,omitempty"`
}

type GameContent struct {
	State   GameState `json:"state"`
	Role    Role      `json:"role"`
	Content string    `json:"content"`
}

type RoomInfo struct {
	Capacity   int        `json:"capacity"`
	PlayerNum  int        `json:"playerNum"`
	RoomStatus RoomStatus `json:"roomStatus"`
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
	TO_START   RoomStatus = "TO_START"
	WAIT_READY RoomStatus = "WAIT_READY"
	LOBBY      RoomStatus = "LOBBY"
	TERMINATE  RoomStatus = "TERMINATE"
)

type GameState string

const (
	ASSIGN_ROLE GameState = "ASSIGN_ROLE"
)
