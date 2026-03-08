import { Room } from "./utils.js";

export function sanitizePlayers(myRoom: Room) {
  return Array.from(myRoom.players.values()).map(
    ({ socketReference, ...rest }) => rest,
  );
}
