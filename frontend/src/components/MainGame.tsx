import React, { useEffect, useState } from "react";
import DrawingBoard from "./DrawingBoard";
import InputBoard from "./InputBoard";
import type { Room } from "../types";
import ClientDrawingBoard from "./ClientDrawingBoard";
import SideBar from "./SideBar";

const MainGame = ({
  room,
  currentUserId,
  sendJsonMessage,
  lastJsonMessage,
}: {
  room: Room;
  currentUserId: string | null;
  sendJsonMessage: (msg: any) => void;
  lastJsonMessage: any;
}) => {
  const drawerName = room.players.find(
    (p) => p.playerId === room.round.drawerId,
  );
  const isDrawer = currentUserId === room.round.drawerId;
  const currentGuessered = room.round.correctGuesses?.includes(
    currentUserId ?? "",
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(
    room.round.timeRemaining / 1000,
  );

  // Sync with server time when it changes
  useEffect(() => {
    setTimeRemaining(room.round.timeRemaining / 1000);
  }, [room.round.timeRemaining]);

  return (
    <div>
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200 text-center z-10 flex justify-between">
        <h1>{drawerName?.name ?? "Someone"} is drawing</h1>{" "}
        {(isDrawer || currentGuessered) && room.round.pokemon && (
          <h2 className="text-indigo-600 font-bold capitalize">
            Draw: {room.round.pokemon.name}
          </h2>
        )}
        <h3>
          {timeRemaining < 0
            ? "Time's up"
            : timeRemaining + " seconds remaining"}{" "}
        </h3>
        <h3>
          Round {room.round.currentRound}/{room.settings.maxRounds}
        </h3>
      </div>
      <div className="flex w-full xl:flex-row flex-col">
        {" "}
        <SideBar room={room} />
        {isDrawer ? (
          <DrawingBoard sendJsonMessage={sendJsonMessage} />
        ) : (
          <ClientDrawingBoard lastJsonMessage={lastJsonMessage} />
        )}
      </div>
      {!isDrawer && !currentGuessered && (
        <InputBoard sendJsonMessage={sendJsonMessage} />
      )}
    </div>
  );
};

export default MainGame;
