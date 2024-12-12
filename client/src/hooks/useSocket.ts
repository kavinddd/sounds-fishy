import { useEffect, useState } from "react";

type Params<T> = {
  path: string;
  onMessage: (msg: T) => void;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  onError?: VoidFunction;
};

export default function useSocket<T>(params: Params<T>) {
  const { onMessage, onOpen, onClose, onError } = params;
  const [conn, setConn] = useState<WebSocket | null>(null);

  function connect(path: string) {
    const conn = new WebSocket(path);

    conn.onmessage = (ev: MessageEvent) => {
      const msg = JSON.parse(ev.data) as T;
      onMessage(msg);
    };

    conn.onopen = () => onOpen?.();

    conn.onclose = () => {
      setConn(null);
      onClose?.();
    };

    conn.onerror = () => {
      onError?.();
      console.error("websocket error");
    };

    setConn(conn);
  }

  function disconnect() {
    console.log("disconect ", conn);
    if (!conn) return;
    conn.close();
    setConn(null);
  }

  function sendMessage(msg: T) {
    const msgString = JSON.stringify(msg);
    conn?.send(msgString);
  }

  useEffect(() => {
    return () => {
      if (conn) {
        conn.close();
        setConn(null);
      }
    };
  }, [conn]);

  console.log("Connection: ", conn);

  return {
    isConnected: conn != null,
    connect,
    disconnect,
    sendMessage,
  };
}
