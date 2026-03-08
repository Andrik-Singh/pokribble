import { getRandomPokemon } from "./sendPokemonDescription.js";
import { Room } from "./utils.js";

export async function choosingPokemon(myRoom: Room, drawerIndex: number) {
  const players = Array.from(myRoom.players.keys());
  myRoom.round.drawerId = players[drawerIndex];
  const drawingPlayers = Array.from(myRoom.players.values()).filter(
    (player) => player.playerId === myRoom.round.drawerId,
  );
  const nonDrawingPlayers = Array.from(myRoom.players.values()).filter(
    (player) => player.playerId !== myRoom.round.drawerId,
  );
  console.log("drawing", drawingPlayers[0].name);
  console.log("nonDrawing", nonDrawingPlayers[0].name);
  const pokemon = [
    await getRandomPokemon(),
    await getRandomPokemon(),
    await getRandomPokemon(),
  ];
  for (const player of nonDrawingPlayers) {
    player.socketReference?.send(
      JSON.stringify({
        text: "Drawer is choosing a pokemon",
      }),
    );
  }
  for (const player of drawingPlayers) {
    console.log("drawer", player);
    player.socketReference?.send(
      JSON.stringify({
        text: "Choose a pokemon",
        pokemon,
      }),
    );
  }
}
