import { broadcastRoomState } from "./broadcast.js";
import { Room } from "./utils.js";

export async function getRandomPokemon() {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/1`);
  const data = await res.json();
  return data.name;
}

export async function sendPokemonDescription(myRoom: Room) {
  broadcastRoomState(myRoom);
}
