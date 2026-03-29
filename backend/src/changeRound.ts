import { choosingPokemon } from "./pokemon/choosingPokemon.js";
import { Room } from "./utils.js";

export async function changeRound(myRoom: Room, drawerIndex: number) {
  let standByTime = 5; // 5 seconds between rounds

  if (myRoom.round.timerId) {
    clearInterval(myRoom.round.timerId);
  }

  myRoom.round.pokemon = undefined;
  const playerIds = Array.from(myRoom.players.keys());
  myRoom.round.drawerId = playerIds[drawerIndex];

  // Broadcast out the new round and drawer right away so frontend updates instantly!
  const { broadcastRoomState } = await import("./broadcast.js");
  broadcastRoomState(myRoom);
  myRoom.round.timerId = setInterval(async () => {
    myRoom.round.timeRemaining = standByTime * 1000;

    if (standByTime <= 0) {
      if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);

      // Time to let the new drawer choose a pokemon
      myRoom.round.timeRemaining = myRoom.settings.maxTime;
      await choosingPokemon(myRoom, drawerIndex);
    } else {
      // You can broadcast a "Next round staring in X seconds" message here if needed.
      // For now, we just update the room state silently or with a minimal text update.
    }
    standByTime--;
  }, 1000);
}
