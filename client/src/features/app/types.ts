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
export type RoomStatus = "In-Game" | "Wait-Ready";
export type GameState = "";
export type Role = "Player" | "Red-Fish" | "Blue-Fish";
