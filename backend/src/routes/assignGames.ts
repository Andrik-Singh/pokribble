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
      players: new Map,
      started:false,
      settings:{
        maxPlayers:4,
        generation:[1,2,3,4,5,8,9],
        maxRounds:2,
        maxTime:60*1000
      },
      sockets:new Map()
    });
    reply.status(200).send({
      id: roomId,
      text: "A new game has been created",
    });
  });

  done();
}