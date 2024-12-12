import { useState } from "react";
import Chatbox from "./Chatbox";
import useSocket from "../../hooks/useSocket";
import { Message } from "./types";
import { useToast } from "@/hooks/use-toast";
import { SendHorizonal } from "lucide-react";
import ConnectForm from "./ConnectForm";
import { GameRoomProvider, useGameRoom } from "./useGameRoom";

const SERVER_URL = "http://localhost:8080";
const SOCKET_PATH = "start";

function AppPage() {
  const [message, setMessage] = useState("");
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<string[]>([]);

  const { toast } = useToast();
  const { roomCode, name} = useGameRoom()

  const { isConnected, sendMessage, connect, disconnect } = useSocket<Message>({
    onMessage: (msg) => {
      console.log(msg);
      if (msg.roomStatus === "TERMINATE") {
        toast({
          title: "Party is disbanded",
          duration: 1200,
        });
        return;
      }

      if (msg.type === "CHAT") {
        setChats((prevChats) => [...prevChats, msg.chatContent]);
        return;
      }
    },
    onOpen: () =>
      toast({
        title: "Joined room",
        duration: 1200,
      }),
    onClose: () => {
      console.log("Connection closed");
      toast({
        title: "Disconnect the room",
        duration: 1200,
      });
      setChats([]);
    },
    onError: () => {
      console.log("Error websocket");
      toast({
        variant: "destructive",
        title: "Error",
        duration: 1200,
      });
      setChats([]);
    },
  });

  function handleMessageChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
  }

  function handleSendMsg() {
    if (!message) return;

    const msg: Message = {
      type: "CHAT",
      chatContent: message,
    };

    sendMessage(msg);
    setMessage("");
  
  }



  return <GameRoomProvider>
    
      {!isConnected && <ConnectForm />}

      {isConnected && (
        <>
          <div>
            <label htmlFor="message">Message</label>
            <input
              type="text"
              id="message"
              name="message"
              onChange={handleMessageChanged}
            />
            <button
              disabled={!isConnected || message == ""}
              onClick={handleSendMsg}
            >
              <SendHorizonal
                size={14}
                className="text-sky-600 hover:opacity-80"
              />
            </button>
          </div>

          <div className="">
            <Chatbox messages={chats} />
          </div>
        </>
      )}
</GameRoomProvider>
  );
}

export default AppPage;
