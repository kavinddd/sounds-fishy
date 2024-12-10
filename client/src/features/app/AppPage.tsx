import { useState } from "react";
import Chatbox from "./Chatbox";
import useSocket from "../../hooks/useSocket";
import { Message } from "./types";
import { useToast } from "@/hooks/use-toast";

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
      }
    },
    onOpen: () =>
      toast({
        title: "Joined room",
        duration: 1200,
      }),
    onClose: () => setChats([]),
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
        onChange={handleRoomCodeChanged}
      />

      <button disabled={isConnected} onClick={connect}>
        Connect
      </button>
      <button disabled={!isConnected} onClick={disconnect}>
        Disconnect
      </button>

      {isConnected && (
        <>
          <div className="">
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
              Send message
            </button>
          </div>

          <Chatbox messages={chats} />
        </>
      )}
    </>
  );
}

export default AppPage;