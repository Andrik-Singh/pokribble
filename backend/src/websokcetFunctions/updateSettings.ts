import { broadcastRoomState } from "../broadcast.js";
import { Room } from "../utils.js";

export const updateSettings = (
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
