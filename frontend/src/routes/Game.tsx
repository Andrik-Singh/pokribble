import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useWebSocket from "react-use-websocket";
import StartedGame from "../components/StartedGame";
import LobbyGame from "../components/LobbyGame";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
type Settings = {
  maxPlayers: number;
  generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
  maxTime:number;
  maxRounds:number;
};
type Player = {
  playerId: string;
  score: number;
  name:string;
};
export type Room = {
  players: Player[];
  settings:Settings;
  started:boolean
};
type RoomResponse = {
  text: string;
  userId: string;
  room: Room;
  userName:string;
};
type WebSocketMessage = {
  type: string;
  room: Room;
};

const Game = () => {
  const [initialRoomContent, setInitialRoomContent] = useState<Room | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { gameId } = useParams();
  const wsUrl = currentUserId
    ? `${backendUrl}/ws/${gameId}?userId=${currentUserId}`
    : null;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = window.localStorage.getItem("pokribble-user-id");
        const userName=window.localStorage.getItem("pokribble-user-name")
        const res = await fetch(`${backendUrl}/loadGame`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            roomId: gameId,
            userId,
            userName
          }),
        });

        if (!res.ok) {
          setError("A server error occured");
          return;
        }
        const data: RoomResponse = await res.json();
        if (data.userId) {
          localStorage.setItem("pokribble-user-id", data.userId);
        }
        if(data.userName){
          localStorage.setItem("pokribble-user-name",data.userName)
        }
        setCurrentUserId(data.userId);
        if(!data.room){
          setError(data.text)
        }
        setInitialRoomContent(data.room)
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        setError("A server Error occured")
      }
    };

    if (gameId) {
      fetchData();
    }
  }, [gameId]);
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<WebSocketMessage>(
    wsUrl,
    {
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      onOpen: () => {
        sendJsonMessage({
          type: "Join_Room",
        });
      },
      onClose:()=>{
        sendJsonMessage({
          type:"Leave_Room"
        })
      }
    },
  );
  useEffect(() => {
    if (!lastJsonMessage?.room || loading || error) return;
  }, [lastJsonMessage, loading, error]);
  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  const roomContent = lastJsonMessage?.room ?? initialRoomContent;
  if(!roomContent) return <div>Initializing</div>
  return (
    <div>
      {roomContent.started ?
      <StartedGame room={roomContent}/> :
      <LobbyGame room={roomContent} sendJsonMessage={sendJsonMessage} />
    }

    </div>
  );
};

export default Game;
