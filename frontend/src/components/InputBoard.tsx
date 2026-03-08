const InputBoard = () => {
  return (
    <div className="flex gap-2 fixed bottom-3 left-1/2 -translate-x-1/2">
      <input
        type="text"
        className="border border-gray-300 rounded-md p-2 w-96"
      />
      <button className="border border-gray-300 rounded-md p-2">Submit</button>
    </div>
  );
};

export default InputBoard;
