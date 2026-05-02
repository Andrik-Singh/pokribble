import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useWebSocket from "react-use-websocket";
import StartedGame from "../components/StartedGame";
import LobbyGame from "../components/lobby/LobbyGame";
import ScoreBoard from "../components/ScoreBoard";
import type { IncomingWebSocketMessage, RoomResponse } from "../types";
import { useSettingsChange, useSocketFunction } from "../zustand/sockets";
import { useAvatarChange } from "../zustand/avatar";
import { random151Pokemon, STORAGE_KEY } from "../utils/randomNumbers";
import { toast } from "react-toastify";
import Canvas404 from "./NotFound";
import { API_URL, WS_URL } from "../utils/config";
import { useDrawingSocket } from "../zustand/drawing";

const backendUrl = API_URL + "/api";
const baseWsUrl = WS_URL + "/api/ws";
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
    ? `${baseWsUrl}/${gameId}?${new URLSearchParams({
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
  const { sendJsonMessage} =
    useWebSocket<IncomingWebSocketMessage>(wsUrl, {
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
        const data = JSON.parse(e.data) as IncomingWebSocketMessage;
        if (Array.isArray(data)) {
          useDrawingSocket.getState().setDrawingData(data);
          return;
        }
        if (data.type === "Setting_Up") {
          useSettingsChange.getState().setSettings(data.settings);
        }
        if (data.type === "Room_Update") {
          if (!data.room) {
            setError("Room not found");
            setLoading(true);
            return;
          }
          setLoading(false);
          setRoomContent(data.room);
          if(!useSettingsChange.getState().settings){
            useSettingsChange.getState().setSettings(data.room.settings);
          }
        }
        if (data.type === "Timer_Tick") {
          useSocketFunction.getState().setTimeReamining(data.timeRemaining);
        }
        if (data.type === "Hint") {
          setLastJsonMessage(data);
        }
        if (data.type === "Setting_Up") {
          setLastJsonMessage(data);
        }
        if (data.type === "Guess_Result") {
          if (data.correct) {
            toast(`You guessed the word!`);
          } else {
            toast(`You guessed the word incorrectly
            you were ${data.distance} away
          `);
          }
        }
      },
    });
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
          currentUserId={currentUserId}
          sendJsonMessage={sendJsonMessage}
        />
      ) : (
        <LobbyGame sendJsonMessage={sendJsonMessage} />
      )}
    </div>
  );
};

export default Game;
