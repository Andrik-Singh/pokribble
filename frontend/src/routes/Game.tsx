import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import useWebSocket from "react-use-websocket";
import StartedGame from "../components/StartedGame";
import LobbyGame from "../components/lobby/LobbyGame";
import ScoreBoard from "../components/ScoreBoard";
import type { IncomingWebSocketMessage, RoomResponse } from "../types";
import {  useSocketFunction } from "../zustand/sockets";
import { useAvatarChange } from "../zustand/avatar";
import { random151Pokemon, STORAGE_KEY } from "../utils/randomNumbers";
import Canvas404 from "./NotFound";
import { API_URL, WS_URL } from "../utils/config";
import { handleWsMessage } from "../utils/wsHandlers";

const backendUrl = API_URL + "/api";
const Game = () => {
  const { roomContent, setRoomContent} =
    useSocketFunction();
  const setAvatar = useAvatarChange((s) => s.setAvatar);
  const avatar = useAvatarChange((s) => s.avatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState({
    id: localStorage.getItem("pokribble-user-id"),
    name: localStorage.getItem("pokribble-user-name"),
  });
  const { gameId } = useParams();

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      const randomAvatar = random151Pokemon();
      setAvatar(randomAvatar);
      window.localStorage.setItem(STORAGE_KEY, randomAvatar);
      return;
    }
    setAvatar(window.localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);
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
        }
        if (data.userName) {
          localStorage.setItem("pokribble-user-name", data.userName);
        }
        setUser({
          id: data.userId,
          name: data.userName,
        });
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
  const wsUrl = useMemo(() => {
    if (!user.id || !gameId) return null;
    const params = new URLSearchParams({
      userId: user.id,
      userName: user.name ?? "",
      avatar: avatar ?? "",
    });
    return `${WS_URL}/api/ws/${gameId}?${params.toString()}`;
  }, [user, gameId, avatar]);
  const { sendJsonMessage } = useWebSocket<IncomingWebSocketMessage>(wsUrl, {
    share: true,
    reconnectAttempts: 10,
    reconnectInterval: 1000,
    heartbeat: {
      message: "ping",
      returnMessage: "pong",
      timeout: 60000,
      interval: 25000,
    },
    onMessage: (e) => {
      let data;
      try {
        data = JSON.parse(e.data) as IncomingWebSocketMessage;
      } catch (err) {
        console.error(err);
        setError("Received invalid data from server");
        return;
      }
      handleWsMessage(data, setError);
    },
  });

  if (loading) return <div>Loading</div>;
  if (error)
    return (
      <div>
        <Canvas404 />
      </div>
    );
  if (!roomContent) return <div>Initializing</div>;
  return (
    <div>
      {roomContent.gameEnded ? (
        <ScoreBoard sendJsonMessage={sendJsonMessage} />
      ) : roomContent.started ? (
        <StartedGame
          currentUserId={user.id}
          sendJsonMessage={sendJsonMessage}
        />
      ) : (
        <LobbyGame sendJsonMessage={sendJsonMessage} />
      )}
    </div>
  );
};

export default Game;
