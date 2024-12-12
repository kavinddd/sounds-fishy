// some fields are optional
// because the difference perspective of client / server

export type Message = {
  type: MessageType;
  roomStatus?: RoomStatus;
  chatContent: string;
  gameContent?: GameContent;
};

export type GameContent = {
  state: GameState;
  role: Role;
  content?: string;
};

export type MessageType = "CHAT" | "GAME";
export type RoomStatus = "IN-GAME" | "WAIT-READY" | "TERMINATE";
export type GameState = "";
export type Role = "PLAYER" | "RED-FISH" | "BLUE-FISH";
