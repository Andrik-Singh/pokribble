import { FastifyInstance, FastifyPluginOptions } from "fastify";
import crypto from "crypto";
import { room } from "../utils.js";

export default function assignGame(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  fastify.post("/api/create-new-game", async (req, reply) => {
    const roomId = crypto.randomUUID();
    room.set(roomId, {
      players: [],
      playerCount: 4,
    });
    reply.status(200).send({
      id: roomId,
      text: "A new game has been created",
    });
  });

  done();
}