import { getRandomPokemon } from "./sendPokemonDescription.js";
import { Room } from "../utils.js";

export async function choosingPokemon(myRoom: Room, drawerIndex: number) {
  const players = Array.from(myRoom.players.keys());
  myRoom.round.drawerId = players[drawerIndex];
  myRoom.round.correctGuesses = [];
  const generation = myRoom.settings.generation;
  if (!generation || generation.length === 0) {
    throw new Error("Generation settings are required but not configured");
  }
  const drawingPlayers = Array.from(myRoom.players.values()).filter(
    (player) => player.playerId === myRoom.round.drawerId,
  );
  const nonDrawingPlayers = Array.from(myRoom.players.values()).filter(
    (player) => player.playerId !== myRoom.round.drawerId,
  );
  const pokemon = [
    await getRandomPokemon(
      generation[Math.floor(Math.random() * generation.length)],
    ),
    await getRandomPokemon(
      generation[Math.floor(Math.random() * generation.length)],
    ),
    await getRandomPokemon(
      generation[Math.floor(Math.random() * generation.length)],
    ),
  ];
  for (const player of nonDrawingPlayers) {
    player.socketReference?.send(
      JSON.stringify({
        type: "Pokemon_Choose",
        text: "Drawer is choosing a pokemon",
      }),
    );
  }
  for (const player of drawingPlayers) {
    player.socketReference?.send(
      JSON.stringify({
        type: "Pokemon_Choose",
        text: "Choose a pokemon",
        pokemon,
      }),
    );
  }
}
