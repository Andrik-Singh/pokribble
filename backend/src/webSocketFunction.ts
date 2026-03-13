import { broadcastRoomState } from "./broadcast.js";
import { choosingPokemon } from "./choosingPokemon.js";
import { levenshtein, Room } from "./utils.js";

const toggleGeneration = (
  myRoom: Room,
  message: {
    generation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  },
) => {
  const currentGens = myRoom.settings.generation;
  if (currentGens.includes(message.generation)) {
    if (
      currentGens.length <= 1 ||
      message.generation < 1 ||
      message.generation > 9
    ) {
      return;
    }
    myRoom.settings.generation = currentGens.filter(
      (g) => g !== message.generation,
    );
  } else {
    myRoom.settings.generation = [...currentGens, message.generation].sort();
  }
  broadcastRoomState(myRoom);
};
const updateSettings = (
  myRoom: Room,
  message: {
    settings: {
      maxPlayers: number;
      maxRounds: number;
      maxTime: number;
      generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    };
  },
) => {
  if (
    !message.settings ||
    typeof message.settings !== "object" ||
    myRoom.started
  ) {
    return;
  }
  if (message.settings.maxPlayers < 3 || message.settings.maxPlayers > 10) {
    return;
  }
  if (message.settings.maxRounds < 1 || message.settings.maxRounds > 10) {
    return;
  }
  if (message.settings.maxTime < 10000 || message.settings.maxTime > 80000) {
    return;
  }
  const { maxPlayers, maxRounds, maxTime, generation } = message.settings;
  myRoom.settings = {
    ...myRoom.settings,
    maxPlayers,
    maxRounds,
    maxTime,
  };
  if (generation) {
    myRoom.settings.generation = generation;
  }
  broadcastRoomState(myRoom);
};
const gameStart = async (myRoom: Room) => {
  myRoom.started = true;
  myRoom.round.drawerIndex = 0;
  broadcastRoomState(myRoom);
  await choosingPokemon(myRoom, myRoom.round.drawerIndex);
};
const pokemonChoose = async (
  myRoom: Room,
  message: {
    pokemon: {
      name: string;
      image: string;
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
    myRoom.round.timeRemaining = myRoom.round.timeRemaining - 1000;
    broadcastRoomState(myRoom);
  }, 1000);
  return;
};
const timeout = async (myRoom: Room) => {
  const players = Array.from(myRoom.players.values());
  const previousDrawerIndex = myRoom.round.drawerIndex;
  do {
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
const guessPokemon = (
  myRoom: Room,
  message: { guess: string },
  userId: string,
) => {
  const roundPokemon = myRoom.round.pokemon?.name.toLowerCase();
  const guessPokemon = message.guess.toLowerCase();
  if (!roundPokemon || !guessPokemon) return;
  const player = myRoom.players.get(userId);
  if (roundPokemon === guessPokemon) {
    if (player) {
      player.score += 1;
      myRoom.round.correctGuesses?.push(userId);
      player.socketReference?.send(
        JSON.stringify({
          type: "Guess_Result",
          correct: true,
          distance: 0,
        }),
      );
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
        correct: true,
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
