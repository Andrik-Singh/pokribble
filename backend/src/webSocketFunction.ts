import { broadcastRoomState } from "./broadcast.js";
import { changeRound } from "./changeRound.js";
import { choosingPokemon } from "./choosingPokemon.js";
import { sendPokemonDescription } from "./sendPokemonDescription.js";
import { Room } from "./utils.js";

const toggleGeneration = (
  myRoom: Room,
  genIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
) => {
  const currentGens = myRoom.settings.generation;
  if (currentGens.includes(genIndex)) {
    if (currentGens.length <= 1) {
      return;
    }
    myRoom.settings.generation = currentGens.filter((g) => g !== genIndex);
  } else {
    myRoom.settings.generation = [...currentGens, genIndex].sort();
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
  if (message.settings.maxTime < 1000 || message.settings.maxTime > 80000) {
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
  myRoom.round.timeRemaining = myRoom.settings.maxTime;
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
  await sendPokemonDescription(myRoom);

  if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);

  myRoom.round.timerId = setInterval(async () => {
    if (myRoom.round.timeRemaining <= 0) {
      if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);

      const players = Array.from(myRoom.players.values());
      const previousDrawerIndex = myRoom.round.drawerIndex;

      do {
        myRoom.round.drawerIndex =
          (myRoom.round.drawerIndex + 1) % players.length;
      } while (players[myRoom.round.drawerIndex].disconnected);
      if (myRoom.round.drawerIndex <= previousDrawerIndex) {
        myRoom.round.currentRound += 1;
      }

      if (myRoom.round.currentRound > myRoom.settings.maxRounds) {
        myRoom.gameEnded = true;
        broadcastRoomState(myRoom);
        return;
      }

      console.log(myRoom.round.drawerIndex, "drawerIndex");
      await changeRound(myRoom, myRoom.round.drawerIndex);
      return;
    }
    myRoom.round.timeRemaining = myRoom.round.timeRemaining - 1000;
  }, 1000);
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
export const webSocketfucntion = {
  Toggle_Generation: toggleGeneration,
  Update_Settings: updateSettings,
  Game_Start: gameStart,
  Pokemon_Chosen: pokemonChoose,
  Return_To_Lobby: returnToLobby,
};
