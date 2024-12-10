function Chatbox({ messages }: { messages: string[] }) {
  return (
    <div className="border-[1px] border-solid border-gray-500 bg-gray-100 px-1 text-sm">
      {messages?.map((msg, idx) => <Chat key={idx}>{msg}</Chat>)}
    </div>
  );
}

function Chat({ children }: { children: string }) {
  return <p>{children}</p>;
}

export default Chatbox;
