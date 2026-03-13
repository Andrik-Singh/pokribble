import { Room } from "./utils.js";

const broadcastToNonDrawers = (msg: (number | string)[], myRoom: Room) => {
  myRoom.players.forEach((player) => {
    if (player.playerId === myRoom.round.drawerId) return;
    player.socketReference?.send(JSON.stringify(msg));
  });
};

const drawingFunctions = [
  // 0 = mousedown
  (msg: (number | string)[], myRoom: Room) => {
    broadcastToNonDrawers(msg, myRoom);
  },
  // 1 = move batch
  (msg: (number | string)[], myRoom: Room) => {
    broadcastToNonDrawers(msg, myRoom);
  },
  // 2 = mouseup
  (msg: (number | string)[], myRoom: Room) => {
    broadcastToNonDrawers(msg, myRoom);
  },
  // 3 = undo
  (msg: (number | string)[], myRoom: Room) => {
    broadcastToNonDrawers(msg, myRoom);
  },
  // 4 = redo
  (msg: (number | string)[], myRoom: Room) => {
    broadcastToNonDrawers(msg, myRoom);
  },
  // 5 = clear
  (msg: (number | string)[], myRoom: Room) => {
    broadcastToNonDrawers(msg, myRoom);
  },
];

export async function sendDrawing(message: (number | string)[], myRoom: Room) {
  const [type] = message;
  if (typeof type !== "number") {
    console.log("invalid message type");
    return;
  }
  const handler = drawingFunctions[type];
  if (!handler) {
    console.log("no handler found");
    return;
  }
  handler(message, myRoom);
}
