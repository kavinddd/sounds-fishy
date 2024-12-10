import { useState } from "react";
import Chatbox from "./Chatbox";
import useSocket from "../../hooks/useSocket";
import { Message } from "./types";
import { useToast } from "@/hooks/use-toast";
import { SendHorizonal } from "lucide-react";

const SERVER_URL = "http://localhost:8080";
const SOCKET_PATH = "start";

function AppPage() {
  const [message, setMessage] = useState("");
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [chats, setChats] = useState<string[]>([]);

  const { toast } = useToast();

  const { isConnected, sendMessage, connect, disconnect } = useSocket<Message>({
    path: `${SERVER_URL}/${SOCKET_PATH}/${roomCode}`,
    onMessage: (msg) => {
      console.log(msg);
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
      toast({
        title: "Disconnect the room",
        duration: 1200,
      });
      setChats([]);
    },
    onError: () => setChats([]),
  });

  function handleMessageChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
  }

  function handleRoomCodeChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setRoomCode(e.target.value);
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

  return (
    <>
      <label htmlFor="roomCode">Room Code</label>
      <input
        type="text"
        id="roomCode"
        name="roomCode"
        disabled={isConnected}
        onChange={handleRoomCodeChanged}
      />

      {isConnected ? (
        <button disabled={!isConnected} onClick={disconnect}>
          Disconnect
        </button>
      ) : (
        <button disabled={isConnected} onClick={connect}>
          Connect
        </button>
      )}

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
    </>
  );
}

export default AppPage;
