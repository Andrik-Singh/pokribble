import {  broadcastSettings } from "../broadcast.js";
import { Room } from "../utils.js";

export const toggleGeneration = (
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
  broadcastSettings(myRoom);
};
