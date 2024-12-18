import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { Role, RoomStatus } from "./types";

// =================== reducer ==========================
type GameRoomState = {
  name?: string;
  roomCode?: string;

  role?: Role;
  roomStatus?: RoomStatus;
  currentClients?: number;
};

const intialGameRoomState: GameRoomState = {};

type ReducerAction =
  | { type: "SET_NAME_ROOMCODE"; payload: GameRoomState }
  | { type: "SET_ROLE"; payload: Role | undefined }
  | { type: "SET_ROOMSTATUS"; payload: RoomStatus | undefined }
  | { type: "SET_CURRENT_CLIENTS"; payload: number | undefined };

function reducer(state: GameRoomState, action: ReducerAction): GameRoomState {
  switch (action.type) {
    case "SET_NAME_ROOMCODE":
      return {
        ...state,
        name: action.payload.name,
        roomCode: action.payload.roomCode,
      };

    default:
      return state;
  }
}

// =================== action creators ===================

interface SetNameAndRoomCodeParam {
  name?: string;
  roomCode?: string;
}

function setNameAndRoomCodeAction({
  name,
  roomCode,
}: SetNameAndRoomCodeParam): ReducerAction {
  return {
    type: "SET_NAME_ROOMCODE",
    payload: { name, roomCode },
  };
}

function setRoleAction(role?: Role): ReducerAction {
  return {
    type: "SET_ROLE",
    payload: role,
  };
}

function setRoomStatusAction(roomStatus?: RoomStatus): ReducerAction {
  return {
    type: "SET_ROOMSTATUS",
    payload: roomStatus,
  };
}

function setCurrentClientsAction(numClient?: number): ReducerAction {
  return {
    type: "SET_CURRENT_CLIENTS",
    payload: numClient,
  };
}

// =================== context ==========================

type UseGameroomContextType = {
  state: GameRoomState;
  dispatch: React.Dispatch<ReducerAction>;
};

const GameRoomContext = createContext<UseGameroomContextType | undefined>(
  undefined,
);

function GameRoomProvider({ children }: { children: ReactNode | ReactNode[] }) {
  const [state, dispatch] = useReducer(reducer, intialGameRoomState);
  const value = useMemo(() => {
    const setNameAndRoomCode = (param: SetNameAndRoomCodeParam) =>
      dispatch(setNameAndRoomCodeAction(param));
    const setRole = (role?: Role) => dispatch(setRoleAction(role));
    const setRoomStatus = (roomStatus?: RoomStatus) =>
      dispatch(setRoomStatusAction(roomStatus));
    const setCurrentClients = (numClient?: number) =>
      dispatch(setCurrentClientsAction(numClient));

    return {
      state,
      dispatch,
      setNameAndRoomCode,
      setRole,
      setRoomStatus,
      setCurrentClients,
    };
  }, [state]);

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
