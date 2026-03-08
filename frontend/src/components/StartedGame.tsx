import { useEffect, useState } from "react";
import type { Room } from "../routes/Game";
import DrawingBoard from "./DrawingBoard";
import InputBoard from "./InputBoard";
import ChoosingPokemon from "./ChoosingPokemon";

type WebSocketMessage = {
  room?: Room;
  text?: string;
  pokemon?: string[];
};

type StartedGameProps = {
  room: Room;
  currentUserId: string | null;
  sendJsonMessage: (msg: Record<string, unknown>) => void;
  lastJsonMessage: WebSocketMessage | null;
};

const StartedGame = ({
  room,
  currentUserId,
  sendJsonMessage,
  lastJsonMessage,
}: StartedGameProps) => {
  const drawerName = room.players.find(
    (p) => p.playerId === room.round.drawerId,
  );
  const isDrawer = currentUserId === room.round.drawerId;
  const [timeRemaining, setTimeRemaining] = useState<number>(
    room.round.timeRemaining / 1000,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (lastJsonMessage?.text && !lastJsonMessage?.room) {
    return (
      <ChoosingPokemon
        pokemon={lastJsonMessage.pokemon}
        text={lastJsonMessage.text}
        sendJsonMessage={sendJsonMessage}
      />
    );
  }  
   return (
    <div>
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200 text-center z-10 flex justify-between">
        <h1>{drawerName?.name} is drawing</h1>
        {isDrawer && room.round.pokemon && (
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
      <div>
        <DrawingBoard />
        {!isDrawer && <InputBoard />}
      </div>
    </div>
  );
};

export default StartedGame;
