import { useEffect, useState } from "react";
import ChoosingPokemon from "./ChoosingPokemon";
import Timeout from "./Timeout";
import type {
  IncomingWebSocketMessage,
  OutgoingWebSocketMessage,
  PokemonDescription,
  Room,
} from "../types";
import { useSocketFunction, type TSocketFunction } from "../zustand/sockets";
import MainGame from "./mainGame/MainGame";
type StartedGameProps = {
  currentUserId: string | null;
  sendJsonMessage: (msg: OutgoingWebSocketMessage) => void;
};

export type TimeoutPayload = {
  pokemon: { name: string; image: string };
  drawer: string;
};
type Screen =
  | {
      type: "Room_Update";
      room: Partial<Room>;
    }
  | {
      type: "Timeout";
      drawerId: string;
      pokemon: PokemonDescription;
    }
  | {
      type: "Return_To_Lobby";
    }
  | {
      type: "Pokemon_Choose";
      text: string;
      pokemon?: PokemonDescription[];
    }
  | {
      type: "Guess_Result";
      correct: boolean;
      distance?: number;
    }
  | {
      type: "Hint";
      hint: string;
    }
  | {
      type: "Setting_Up";
    };
const StartedGame = ({ currentUserId, sendJsonMessage }: StartedGameProps) => {
  const room = useSocketFunction((s: TSocketFunction) => s.roomContent);
  const lastJsonMessage = useSocketFunction(
    (s: TSocketFunction) => s.webSocketMessage,
  );
  const [screen, setScreen] = useState<Screen | null>(null);

  useEffect(() => {
    if (room && !screen) {
      setScreen({ type: "Room_Update", room });
    }
  }, [room, screen]);

  useEffect(() => {
    if (!lastJsonMessage) return;
    if (Array.isArray(lastJsonMessage)) return;
    if (lastJsonMessage.type === "Setting_Up") {
      setScreen({ type: "Setting_Up" });
    }
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
        drawerId: lastJsonMessage.drawer,
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

  useEffect(() => {
    if (!lastJsonMessage) return;
    if (Array.isArray(lastJsonMessage)) return;
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
        drawerId: lastJsonMessage.drawer,
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

  if (!room || !screen) {
    return <div>Initializing</div>;
  }
  if (screen.type === "Pokemon_Choose") {
    return (
      <ChoosingPokemon
        pokemon={screen.pokemon}
        text={screen.text}
        sendJsonMessage={sendJsonMessage}
      />
    );
  }
  if (screen.type === "Timeout") {
    return <Timeout pokemon={screen.pokemon} drawer={screen.drawerId} />;
  }
  if (screen.type === "Setting_Up") {
    return <div>Setting Up</div>;
  }
  return (
    <MainGame currentUserId={currentUserId} sendJsonMessage={sendJsonMessage} />
  );
};

export default StartedGame;
