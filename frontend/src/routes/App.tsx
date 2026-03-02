import { useNavigate } from "react-router";

const backnedUrl = import.meta.env.VITE_BACKEND_URL;
const App = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button
        className="bg-gray-400 w-auto h-auto rounded-2xl px-4 py-2"
        onClick={async () => {
          const res = await fetch(`${backnedUrl}/create-new-game`, {
            method: "POST",
            headers: {
              "Content-type":"application/json"
            },
            body:JSON.stringify({})
          });
          if (!res.ok) {
            console.error("Server error");
            return;
          }
          const data: {
            id: string;
            text: string;
          } = await res.json();
          if (data) {
            navigate(`/game/${data.id}`);
          }
          console.log(data);
        }}
      >
        Create a new game
      </button>
    </div>
  );
};

export default App;
