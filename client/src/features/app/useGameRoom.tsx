import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { Role, RoomStatus } from "./types";

type State = {
  name?: string;
  roomCode?: string;

  role?: Role;
  roomStatus?: RoomStatus;
  currentClients?: number;
};

const intialState: State = {};

type Action =
  | { type: "SET_NAME_ROOMCODE"; payload: State }
  | { type: "SET_ROLE"; payload: Role | undefined }
  | { type: "SET_ROOMSTATUS"; payload: RoomStatus | undefined }
  | { type: "SET_CURRENT_CLIENTS"; payload: number | undefined };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "SET_NAME_ROOMCODE":
      return {
        ...state,
        name: action.payload.name,
        roomCode: action.payload.roomCode,
      };
  }
}

type Value = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const GameRoomContext = createContext<Value | undefined>(undefined);

function GameRoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, intialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <GameRoomContext.Provider value={value}>
      {children}
    </GameRoomContext.Provider>
  );
}

function useGameRoom() {
  const context = useContext(GameRoomContext);

  if (!context)
    throw new Error("GameRoomContext was used outside of its provider");

  return context;
}

export { useGameRoom, GameRoomProvider };
