import { useEffect, useState } from "react";

const InputName = () => {
  const [name, setName] = useState("");
  useEffect(() => {
    const data = window.localStorage.getItem("pokribble-user-name");
    if (data) {
      setName(data);
    }
  }, []);
  useEffect(() => {
    if (!name || name.trim().length < 1) return;
    window.localStorage.setItem("pokribble-user-name", name);
  }, [name]);
  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex flex-col gap-2 w-full">
        <input
          id="input-name"
          className="bg-white w-full h-auto rounded-2xl px-4 py-2"
          type="text"
          value={name}
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InputName;
