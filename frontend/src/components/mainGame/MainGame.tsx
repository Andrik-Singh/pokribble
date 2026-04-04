import { useEffect, useState } from "react";
import DrawingBoard from "./DrawingBoard";
import { useSocketFunction, type TSocketFunction } from "../../zustand/sockets";
import ClientDrawingBoard from "./ClientDrawingBoard";
import SideBar from "./SideBar";
import InputBoard from "./InputBoard";
import HintSection from "./HintSection";

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
  const timeRemaining = useSocketFunction(
    (s: TSocketFunction) => s.timeRemaining,
  );
  const [hints, setHints] = useState<{
    length: number | null;
    basestat: number | null;
    type: string[] | null;
  }>({
    length: null,
    basestat: null,
    type: null,
  });

  useEffect(() => {
    if (Array.isArray(lastJsonMessage) || !lastJsonMessage) return;
    if (lastJsonMessage.type === "Hint") {
      setHints((prev) => ({
        ...prev,
        [lastJsonMessage.value.type.toLocaleLowerCase()]:
          lastJsonMessage.value.value,
      }));
    }
  }, [lastJsonMessage]);

  if (!room) return <div>Initializing</div>;

  const drawerName = room.players.find(
    (p) => p.playerId === room.round.drawerId,
  );
  const isDrawer = currentUserId === room.round.drawerId;
  const currentGuessered = room.round.correctGuesses?.includes(
    currentUserId ?? "",
  );

  return (
    <div className="h-[100svh] flex flex-col bg-gray-100 overflow-hidden font-[Nunito]">
      {/* TOP BAR — round info + timer only */}
      <div className="bg-white shadow-md shrink-0 flex items-center justify-between px-4 py-2 text-sm sm:text-base">
        <span className="font-bold text-gray-700 hidden sm:block">
          {drawerName?.name} is drawing
        </span>
        <span className="text-gray-500 font-medium">
          R {room.round.currentRound}/{room.settings.maxRounds}
        </span>
        <div className="font-mono bg-gray-100 px-3 py-1 rounded text-indigo-600 font-bold">
          {Math.ceil(timeRemaining / 1000)}s
        </div>
      </div>

      {/* HINT BAR — full width strip below header */}
      <div className="bg-indigo-50 border-b border-indigo-100 shrink-0 flex items-center justify-center gap-4 px-4 py-2">
        {(isDrawer || currentGuessered) && (
          <div className="flex items-center gap-2">
            <img
              className="w-10 h-10 object-contain"
              src={room.round.pokemon?.image}
              width={40}
              height={40}
              alt=""
            />
            <span className="text-indigo-600 font-bold uppercase text-sm">
              {room.round.pokemon?.name}
            </span>
          </div>
        )}
        <HintSection hints={hints} />
      </div>

      <div className="flex-1 flex md:flex-row flex-col overflow-hidden">
        <div className="w-full md:w-48 bg-white/60 border-r shrink-0 overflow-y-auto">
          <SideBar room={room} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-2 overflow-hidden">
          {isDrawer ? (
            <DrawingBoard sendJsonMessage={sendJsonMessage} />
          ) : (
            <ClientDrawingBoard />
          )}
        </div>
      </div>
      {!isDrawer && !currentGuessered && (
        <div className="p-2 bg-white border-t shrink-0">
          <InputBoard sendJsonMessage={sendJsonMessage} />
        </div>
      )}
    </div>
  );
};

export default MainGame;
