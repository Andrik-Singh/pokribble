import { broadcastRoomState, broadcastTimerTick } from "../broadcast.js";
import { getPokemonHint } from "../pokemon/getPokemonHint.js";
import { Room } from "../utils.js";
import { timeout } from "./timeout.js";
const sendMessage = (
  myRoom: Room,
  value?: { type: string; value: string | string[] },
) => {
  if (!value) return;
  myRoom.players.forEach((player) => {
    if (player.socketReference?.readyState === WebSocket.OPEN) {
      player.socketReference.send(JSON.stringify({ type: "Hint", value }));
    }
  });
};
export const pokemonChoose = async (
  myRoom: Room,
  message: {
    pokemon: {
      name: string;
      image: string;
      id: number;
    };
  },
  userId: string,
) => {
  if (userId !== myRoom.round.drawerId) return;
  myRoom.round.pokemon = message.pokemon;
  myRoom.round.timeRemaining = myRoom.settings.maxTime;
  broadcastRoomState(myRoom);
  if (myRoom.round.timerId) {
    clearTimeout(myRoom.round.timerId);
    myRoom.round.timerId = undefined;
  }
  const hints = await getPokemonHint(myRoom.round.pokemon?.id);
  if (!hints) {
    console.error("No hints available");
  }
  const runRoundTick = async () => {
    if (myRoom.round.timeRemaining <= 0) {
      myRoom.round.timerId = undefined;
      await timeout(myRoom);
      return;
    }
    const secondsRemaining = Math.floor(myRoom.round.timeRemaining / 1000);
    const maxSecs = myRoom.settings.maxTime / 1000;
    if (secondsRemaining === Math.floor(maxSecs / 1.5)) {
      sendMessage(
        myRoom,
        hints ? { type: "Type", value: hints.type } : undefined,
      );
    }
    if (secondsRemaining === Math.floor(maxSecs / 2)) {
      sendMessage(
        myRoom,
        hints ? { type: "Length", value: hints.length.toString() } : undefined,
      );
    }
    if (secondsRemaining === Math.floor(maxSecs / 3)) {
      sendMessage(
        myRoom,
        hints
          ? {
              type: "BaseStat",
              value: hints.totalBaseStat.toString(),
            }
          : undefined,
      );
    }
    myRoom.round.timeRemaining = myRoom.round.timeRemaining - 1000;
    broadcastTimerTick(myRoom);

    myRoom.round.timerId = setTimeout(runRoundTick, 1000);
  };

  myRoom.round.timerId = setTimeout(runRoundTick, 1000);
  return;
};
