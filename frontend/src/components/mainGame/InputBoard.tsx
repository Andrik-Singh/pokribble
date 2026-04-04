import React, { useEffect, useState } from "react";

const InputBoard = ({
  sendJsonMessage,
}: {
  sendJsonMessage: (msg: any) => void;
}) => {
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const userId = localStorage.getItem("pokribble-user-id");
    if (userId) {
      setUserId(userId);
    }
  }, []);
  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || !userId) return;
        sendJsonMessage({ type: "Guess", guess: input, userId });
        setInput("");
      }}
      className="flex flex-col md:flex-row gap-2 bg-transparent fixed bottom-3 left-1/2 -translate-x-1/2"
    >
      <input
        onChange={(e) => {
          setInput(e.target.value);
        }}
        value={input}
        type="text"
        aria-label="Enter your message"
        placeholder="Guess pokemon..."
        className="border bg-gray-100 border-gray-300 rounded-md p-2 w-96"
      />
      <button className="border bg-gray-100 border-gray-300 rounded-md p-2">
        Submit
      </button>
    </form>
  );
};

export default InputBoard;
