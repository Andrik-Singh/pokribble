import { broadcastRoomState } from "../broadcast.js";
import { choosingPokemon } from "../choosingPokemon.js";
import { levenshtein, Room } from "../utils.js";
import { pokemonChoose } from "./pokemonchoose.js";
import { timeout } from "./timeout.js";
import { toggleGeneration } from "./toggleGeneration.js";
import { updateSettings } from "./updateSettings.js";

const gameStart = async (myRoom: Room) => {
  myRoom.started = true;
  myRoom.round.drawerIndex = 0;
  broadcastRoomState(myRoom);
  await choosingPokemon(myRoom, myRoom.round.drawerIndex);
};

const returnToLobby = (myRoom: Room) => {
  myRoom.started = false;
  myRoom.gameEnded = false;
  myRoom.round.currentRound = 1;
  myRoom.round.drawerIndex = 0;
  myRoom.round.pokemon = undefined;
  myRoom.round.drawerId = undefined;
  for (const player of myRoom.players.values()) {
    player.score = 0;
  }
  if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);
  broadcastRoomState(myRoom);
  return;
};
const guessPokemon = async (
  myRoom: Room,
  message: { guess: string },
  userId: string,
) => {
  if (userId === myRoom.round.drawerId) return;
  const roundPokemon = myRoom.round.pokemon?.name.toLowerCase();
  const guessPokemon = message.guess.toLowerCase();
  if (!roundPokemon || !guessPokemon) return;
  const player = myRoom.players.get(userId);
  if (roundPokemon === guessPokemon) {
    if (myRoom.round.correctGuesses.includes(userId)) return;
    const timeRemaining = myRoom.round.timeRemaining;
    const points = Math.floor((timeRemaining / myRoom.settings.maxTime) * 100);
    if (player) {
      player.score += points;
      const drawer = myRoom.players.get(myRoom.round.drawerId ?? "");
      if (drawer) {
        drawer.score += points;
      }
      myRoom.round.correctGuesses.push(userId);
      player.socketReference?.send(
        JSON.stringify({
          type: "Guess_Result",
          correct: true,
          distance: 0,
        }),
      );
      if (myRoom.round.correctGuesses.length === myRoom.players.size - 1) {
        if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);
        myRoom.round.timerId = undefined;
        await timeout(myRoom);
        return;
      }
      setTimeout(() => {
        broadcastRoomState(myRoom);
      }, 1000);
      return;
    }
  }
  const distance = levenshtein(roundPokemon, guessPokemon);
  const threshold =
    guessPokemon.length <= 5 ? 1 : guessPokemon.length <= 10 ? 2 : 3;
  if (distance <= threshold) {
    player?.socketReference?.send(
      JSON.stringify({
        type: "Guess_Result",
        correct: false,
        distance,
      }),
    );
    return;
  }
  player?.socketReference?.send(
    JSON.stringify({
      type: "Guess_Result",
      correct: false,
    }),
  );
};
export const webSocketFunction = {
  Toggle_Generation: toggleGeneration,
  Update_Settings: updateSettings,
  Game_Start: gameStart,
  Pokemon_Chosen: pokemonChoose,
  Guess: guessPokemon,
  Return_To_Lobby: returnToLobby,
};
