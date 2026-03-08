import { Room } from "./utils.js";

export function broadcastToAll(myRoom: Room, payload: string) {
  myRoom.players.forEach((p) => {
    p.socketReference?.send(payload);
  });
}
export function broadcastToId({
  myRoom,
  userId,
  payload,
}: {
  myRoom: Room;
  userId: string;
  payload: string;
}) {
  myRoom.players.get(userId)?.socketReference?.send(payload);
}

export function broadcastRoomState(myRoom: Room) {
  myRoom.players.forEach((p) => {
    if (!p.socketReference) return;

    // Hide pokemon from non-drawers if a pokemon is currently active
    const shouldHidePokemon =
      myRoom.started &&
      myRoom.round.pokemon &&
      p.playerId !== myRoom.round.drawerId;

    const { timerId, ...restRound } = myRoom.round;
    const roundData = shouldHidePokemon
      ? { ...restRound, pokemon: null }
      : restRound;

    const roomPayload = {
      ...myRoom,
      players: Array.from(myRoom.players.values()).map(
        ({ socketReference, ...rest }) => rest,
      ),
      round: roundData,
    };

    p.socketReference.send(
      JSON.stringify({ type: "Room_Update", room: roomPayload }),
    );
  });
}
