import { broadcastRoomState, broadcastSettings } from "../broadcast.js";
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
  if (
    !Number.isInteger(message.settings.maxPlayers) ||
    message.settings.maxPlayers < 3 ||
    message.settings.maxPlayers > 10
  ) {
    return;
  }
  if (
    !Number.isInteger(message.settings.maxRounds) ||
    message.settings.maxRounds < 1 ||
    message.settings.maxRounds > 10
  ) {
    return;
  }
  if (
    !Number.isInteger(message.settings.maxTime) ||
    message.settings.maxTime < 10000 ||
    message.settings.maxTime > 80000
  ) {
    return;
  }
  const { maxPlayers, maxRounds, maxTime, generation } = message.settings;
  if (generation !== undefined) {
    if (
      !Array.isArray(generation) ||
      generation.length === 0 ||
      !generation.every((g) => Number.isInteger(g) && g >= 1 && g <= 9)
    ) {
      return;
    }
  }

  myRoom.settings = {
    ...myRoom.settings,
    maxPlayers,
    maxRounds,
    maxTime,
    ...(generation !== undefined ? { generation } : {}),
  };
  broadcastSettings(myRoom)
};
