import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useWebSocket from "react-use-websocket";
import StartedGame from "../components/StartedGame";
import LobbyGame from "../components/LobbyGame";
import ScoreBoard from "../components/ScoreBoard";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
type PokemonDescription = {
  name: string;
  image: string;
};
type Round = {
  pokemon?: PokemonDescription;
  drawerId?: string;
  currentRound: number;
};
type Settings = {
  maxPlayers: number;
  generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
  maxTime: number;
  maxRounds: number;
};
type Player = {
  playerId: string;
  score: number;
  name: string;
};
export type Room = {
  players: Player[];
  settings: Settings;
  started: boolean;
  gameEnded?: boolean;
  round: Round;
};
type RoomResponse = {
  text: string;
  userId: string;
  room: Room;
  userName: string;
};
type WebSocketMessage = {
  room?: Room;
  text?: string;
  pokemon?: string[];
};

const Game = () => {
  const [initialRoomContent, setInitialRoomContent] = useState<Room | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const { gameId } = useParams();
  const wsUrl = currentUserId
    ? `${backendUrl}/ws/${gameId}?userId=${currentUserId}&userName=${currentUserName}`
    : null;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = window.localStorage.getItem("pokribble-user-id");
        const userName = window.localStorage.getItem("pokribble-user-name");
        const res = await fetch(`${backendUrl}/loadGame`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            roomId: gameId,
            userId,
            userName,
          }),
        });
        if (!res.ok) {
          setError("A server error occurred");
          return;
        }
        const data: RoomResponse = await res.json();
        console.log(data);
        if (data.userId) {
          localStorage.setItem("pokribble-user-id", data.userId);
          setCurrentUserId(data.userId);
        }
        if (data.userName) {
          localStorage.setItem("pokribble-user-name", data.userName);
          setCurrentUserName(data.userName);
        }
        if (!data.room) {
          setError(data.text);
          setLoading(false);
          return;
        }
        setInitialRoomContent(data.room);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        setError("A server error occurred");
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
      onClose: () => {
        sendJsonMessage({
          type: "Leave_Room",
        });
      },
    },
  );
  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  const roomContent = lastJsonMessage?.room ?? initialRoomContent;
  if (!roomContent) return <div>Initializing</div>;
  return (
    <div>
      {roomContent.gameEnded ? (
        <ScoreBoard room={roomContent} sendJsonMessage={sendJsonMessage} />
      ) : roomContent.started || lastJsonMessage?.text ? (
        <StartedGame
          room={roomContent}
          currentUserId={currentUserId}
          sendJsonMessage={sendJsonMessage}
          lastJsonMessage={lastJsonMessage}
        />
      ) : (
        <LobbyGame room={roomContent} sendJsonMessage={sendJsonMessage} />
      )}
    </div>
  );
};

export default Game;
