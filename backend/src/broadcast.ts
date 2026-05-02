import { Room } from "./utils.js";

export function broadcastRoomState(myRoom: Room) {
  const players = Array.from(myRoom.players.values()).map(
    ({ socketReference, ...rest }) => rest,
  );

  const { timerId, ...restRound } = myRoom.round;
  const fullPayload = JSON.stringify({
    type: "Room_Update",
    room: { ...myRoom, players, round: restRound },
  });

  const hiddenPayload = JSON.stringify({
    type: "Room_Update",
    room: { ...myRoom, players, round: { ...restRound, pokemon: null } },
  });
  const correctGuesses = new Set(myRoom.round.correctGuesses);
  myRoom.players.forEach((p) => {
    if (!p.socketReference) return;

    const isDrawer =
      !myRoom.started ||
      !myRoom.round.pokemon ||
      p.playerId === myRoom.round.drawerId ||
      correctGuesses.has(p.playerId);

    p.socketReference.send(isDrawer ? fullPayload : hiddenPayload);
  });
}
export function broadcastTimerTick(myRoom: Room) {
  const payload = JSON.stringify({
    type: "Timer_Tick",
    timeRemaining: myRoom.round.timeRemaining,
  });
  myRoom.players.forEach((p) => {
    p.socketReference?.send(payload, {
      compress: false,
    });
  });
}
export function broadcastSettings(myRoom: Room) {
  const payload = JSON.stringify({
    type: "Setting_Up",
    settings: myRoom.settings,
  });
  myRoom.players.forEach((p) => {
    if (!(p.playerId === myRoom.owner)) {
      p.socketReference?.send(payload, {
        compress: false,
      });
    }
  });
}
