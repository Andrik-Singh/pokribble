import { useEffect, useState } from "react";

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
    <div className="flex gap-2 bg-white fixed bottom-3 left-1/2 -translate-x-1/2">
      <input
        onChange={(e) => {
          setInput(e.target.value);
        }}
        value={input}
        type="text"
        aria-label="Enter your message"
        placeholder="Guess pokemon..."
        className="border border-gray-300 rounded-md p-2 w-96"
      />
      <button
        onClick={() => {
          sendJsonMessage({ type: "Guess", guess: input, userId });
          setInput("");
        }}
        className="border border-gray-300 rounded-md p-2"
      >
        Submit
      </button>
    </div>
  );
};

export default InputBoard;
