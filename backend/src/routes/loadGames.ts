import { FastifyInstance } from "fastify";
import { room } from "../utils.js";

export default async function loadGames(fastify: FastifyInstance) {
  fastify.post("/api/loadGame", async (req, reply) => {
    const body: any = req.body;
    console.log(room, body);
    if (!room.has(body.roomId)) {
      return({
        text: "Game not found",
      });
    }
    const randomId = crypto.randomUUID();
    const myRoom = room.get(body.roomId);
    myRoom.players.push({
      playerId: body.userId ? body.userId : randomId,
      playerPoint: 0,
    });
    if (body.userId) {
      return {
        text: "Game found",
        room: myRoom,
        userId: body.userOd,
      };
    }
    return {
      text: "Game found",
      room: myRoom,
      userId: randomId,
    };
  });
}
