import { Room } from "./utils.js";

export function broadcastRoomState(myRoom: Room) {
  const players = Array.from(myRoom.players.values()).map(
    ({ socketReference, ...rest }) => rest,
  );

  myRoom.players.forEach((p) => {
    if (!p.socketReference) return;

    const shouldHidePokemon =
      myRoom.started &&
      myRoom.round.pokemon &&
      p.playerId !== myRoom.round.drawerId &&
      !myRoom.round.correctGuesses?.includes(p.playerId);

    const { timerId, ...restRound } = myRoom.round;

    const roundData = shouldHidePokemon
      ? { ...restRound, pokemon: null }
      : restRound;

    const roomPayload = {
      ...myRoom,
      players,
      round: roundData,
    };

    p.socketReference.send(
      JSON.stringify({ type: "Room_Update", room: roomPayload }),
    );
  });
}
