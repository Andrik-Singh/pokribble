import { broadcastRoomState } from "../broadcast.js";
import { getPokemonHint } from "../pokemon/getPokemonHint.js";
import { Room } from "../utils.js";
import { timeout } from "./timeout.js";

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
  if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);
  myRoom.round.timerId = setInterval(async () => {
    if (myRoom.round.timeRemaining <= 0) {
      if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);
      myRoom.round.timerId = undefined;
      await timeout(myRoom);
      return;
    }

    if (myRoom.round.timeRemaining === myRoom.settings.maxTime / 2) {
      const hint = await getPokemonHint(myRoom.round.pokemon?.id);
      myRoom.players.forEach((p) => {
        p.socketReference?.send(
          JSON.stringify({
            type: "Hint",
            hint: hint,
          }),
        );
      });
    }
    myRoom.round.timeRemaining = myRoom.round.timeRemaining - 1000;
    broadcastRoomState(myRoom);
  }, 1000);
  return;
};
