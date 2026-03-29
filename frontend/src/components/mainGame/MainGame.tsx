import { useEffect, useState } from "react";
import DrawingBoard from "./DrawingBoard";
import { useSocketFunction, type TSocketFunction } from "../../zustand/sockets";
import ClientDrawingBoard from "./ClientDrawingBoard";
import SideBar from "./SideBar";
import InputBoard from "./InputBoard";

const MainGame = ({
  currentUserId,
  sendJsonMessage,
}: {
  currentUserId: string | null;
  sendJsonMessage: (msg: any) => void;
}) => {
  const room = useSocketFunction((s: TSocketFunction) => s.roomContent);
  const lastJsonMessage = useSocketFunction(
    (s: TSocketFunction) => s.webSocketMessage,
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(
    room?.round.timeRemaining ? room.round.timeRemaining / 1000 : 0,
  );
  useEffect(() => {
    if (Array.isArray(lastJsonMessage) || !lastJsonMessage) return;
    if (lastJsonMessage.type === "Hint") {
      console.log(lastJsonMessage);
    }
  }, [lastJsonMessage]);
  useEffect(() => {
    if (!room) return;
    setTimeRemaining(room.round.timeRemaining / 1000);
  }, [room?.round.timeRemaining]);
  if (!room) {
    return <div>Initializing</div>;
  }
  const drawerName = room.players.find(
    (p) => p.playerId === room.round.drawerId,
  );
  const isDrawer = currentUserId === room.round.drawerId;
  const currentGuessered = room.round.correctGuesses?.includes(
    currentUserId ?? "",
  );

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
      <div className="flex w-full flex-col">
        <SideBar room={room} />
        {isDrawer ? (
          <DrawingBoard sendJsonMessage={sendJsonMessage} />
        ) : (
          <ClientDrawingBoard />
        )}
      </div>
      {!isDrawer && !currentGuessered && (
        <InputBoard sendJsonMessage={sendJsonMessage} />
      )}
    </div>
  );
};

export default MainGame;
