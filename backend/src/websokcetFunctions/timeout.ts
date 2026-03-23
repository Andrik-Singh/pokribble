import { broadcastRoomState } from "../broadcast.js";
import { choosingPokemon } from "../choosingPokemon.js";
import { Room } from "../utils.js";

export const timeout = async (myRoom: Room) => {
  const players = Array.from(myRoom.players.values());
  const previousDrawerIndex = myRoom.round.drawerIndex;
  let iterations = 0;
  do {
    iterations++;
    if (iterations > players.length) {
      // All players disconnected - end the game
      myRoom.started = false;
      broadcastRoomState(myRoom);
      return;
    }
    myRoom.round.drawerIndex = (myRoom.round.drawerIndex + 1) % players.length;
  } while (players[myRoom.round.drawerIndex].disconnected);
  if (myRoom.round.drawerIndex <= previousDrawerIndex) {
    myRoom.round.currentRound += 1;
  }
  if (myRoom.round.currentRound > myRoom.settings.maxRounds) {
    myRoom.gameEnded = true;
    broadcastRoomState(myRoom);
    return;
  }
  for (const player of players) {
    player.socketReference?.send(
      JSON.stringify({
        type: "Timeout",
        pokemon: myRoom.round.pokemon,
        drawer: players[previousDrawerIndex].name,
      }),
    );
  }
  setTimeout(async () => {
    await choosingPokemon(myRoom, myRoom.round.drawerIndex);
  }, 5000);
  return;
};
