import { useEffect, useState } from "react";
import ChoosingPokemon from "./ChoosingPokemon";
import Timeout from "./Timeout";
import MainGame from "./MainGame";
import type {
  IncomingWebSocketMessage,
  OutgoingWebSocketMessage,
  Room,
} from "../types";
type StartedGameProps = {
  room: Room;
  currentUserId: string | null;
  sendJsonMessage: (msg: OutgoingWebSocketMessage) => void;
  lastJsonMessage: IncomingWebSocketMessage | null;
};

export type TimeoutPayload = {
  pokemon: { name: string; image: string };
  drawer: string;
};

const StartedGame = ({
  room,
  currentUserId,
  sendJsonMessage,
  lastJsonMessage,
}: StartedGameProps) => {
  const [screen, setScreen] = useState<IncomingWebSocketMessage>({
    type: "Room_Update",
    room,
  });
  useEffect(() => {
    if (!lastJsonMessage) return;
    if (lastJsonMessage.type === "Pokemon_Choose") {
      setScreen({
        type: "Pokemon_Choose",
        pokemon: lastJsonMessage.pokemon,
        text: lastJsonMessage.text,
      });
    }

    if (lastJsonMessage.type === "Timeout") {
      setScreen({
        type: "Timeout",
        drawerId: lastJsonMessage.drawerId,
        pokemon: lastJsonMessage.pokemon,
      });
    }
    if (lastJsonMessage.type === "Room_Update") {
      setScreen({
        type: "Room_Update",
        room: lastJsonMessage.room,
      });
    }
  }, [lastJsonMessage]);
  if (screen.type === "Pokemon_Choose") {
    return (
      <ChoosingPokemon
        pokemon={screen.pokemon?.map((p) => p.name)}
        text={screen.text}
        sendJsonMessage={sendJsonMessage}
      />
    );
  }
  if (screen.type === "Timeout") {
    return <Timeout pokemon={screen.pokemon!} drawer={screen.drawerId!} />;
  }
  return (
    <MainGame
      room={room}
      currentUserId={currentUserId}
      sendJsonMessage={sendJsonMessage}
      lastJsonMessage={lastJsonMessage}
    />
  );
};

export default StartedGame;
