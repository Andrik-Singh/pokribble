import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useWebSocket from "react-use-websocket";
import StartedGame from "../components/StartedGame";
import LobbyGame from "../components/LobbyGame";
import ScoreBoard from "../components/ScoreBoard";
import type { IncomingWebSocketMessage, Room, RoomResponse } from "../types";
import { useSocketFunction } from "../zustand/sockets";
import { useAvatarChange } from "../zustand/avatar";
import { random151Pokemon, STORAGE_KEY } from "../utils/randomNumbers";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Game = () => {
  const { roomContent, setRoomContent, setLastJsonMessage } =
    useSocketFunction();
  const setAvatar = useAvatarChange((s) => s.setAvatar);
  const avatar = useAvatarChange((s) => s.avatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const { gameId } = useParams();
  const wsUrl = currentUserId
    ? `${backendUrl}/ws/${gameId}?${new URLSearchParams({
        userId: currentUserId,
        userName: currentUserName ?? "",
        avatar: avatar ?? random151Pokemon(),
      }).toString()}`
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
        setRoomContent(data.room);
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
  const { sendJsonMessage, lastJsonMessage } =
    useWebSocket<IncomingWebSocketMessage>(wsUrl, {
      reconnectAttempts: 10,
      reconnectInterval: 1000,
    });
  useEffect(() => {
    if (!lastJsonMessage) return;
    if (Array.isArray(lastJsonMessage)) {
      setLastJsonMessage(lastJsonMessage);
      return;
    }
    if (lastJsonMessage.type === "Room_Update") {
      setRoomContent(lastJsonMessage.room);
    }
    if (lastJsonMessage.type === "Hint") {
      setLastJsonMessage(lastJsonMessage);
    }
    if (lastJsonMessage.type === "Setting_Up") {
      setLastJsonMessage(lastJsonMessage);
    }
    if (lastJsonMessage.type === "Guess_Result") {
      if (lastJsonMessage.correct) {
        toast(`You guessed the word!`);
      } else {
        toast(`You guessed the word incorrectly
            you were ${lastJsonMessage.distance} away
          `);
      }
    }
    setLastJsonMessage(lastJsonMessage);
  }, [lastJsonMessage]);
  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      const randomAvatar = random151Pokemon();
      setAvatar(randomAvatar);
      window.localStorage.setItem(STORAGE_KEY, randomAvatar);
      return;
    }
    setAvatar(window.localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);
  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  if (!roomContent) return <div>Initializing</div>;
  return (
    <div>
      {roomContent.gameEnded ? (
        <ScoreBoard sendJsonMessage={sendJsonMessage} />
      ) : roomContent.started ? (
        <StartedGame
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
