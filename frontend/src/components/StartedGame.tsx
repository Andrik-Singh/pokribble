import ChoosingPokemon from "./ChoosingPokemon";
import Timeout from "./Timeout";
import type {
  OutgoingWebSocketMessage,
} from "../types";
import MainGame from "./mainGame/MainGame";
import { useScreenChange } from "../zustand/screen";
type StartedGameProps = {
  currentUserId: string | null;
  sendJsonMessage: (msg: OutgoingWebSocketMessage) => void;
};

export type TimeoutPayload = {
  pokemon: { name: string; image: string };
  drawer: string;
};
const StartedGame = ({ currentUserId, sendJsonMessage }: StartedGameProps) => {
  const screen = useScreenChange((s) => s.screen)
  if (!screen) {
    return <div>Initializing</div>;
  }
  if (screen.type === "Pokemon_Choose") {
    console.log("Pokemon choose")
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
  if (screen.type === "Drawing_Begin") {

    return (
      <MainGame currentUserId={currentUserId} sendJsonMessage={sendJsonMessage} />
    );
  } else {
    return (
      <div>Erropr</div>
    )
  }
};

export default StartedGame;
