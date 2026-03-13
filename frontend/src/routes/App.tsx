import { useState } from "react";
import { useNavigate } from "react-router";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  return (
    <div>
      <button
        disabled={loading}
        className="bg-gray-400 w-auto h-auto rounded-2xl px-4 py-2 cursor-pointer"
        onClick={async () => {
          try {
            setLoading(true);
            const res = await fetch(`${backendUrl}/create-new-game`, {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({}),
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
            setLoading(false);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Create a new game
      </button>
    </div>
  );
};

export default App;
