import "./env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import assignGame from "./routes/assignGames.js";
import loadGames from "./routes/loadGames.js";
import fastifyWebsocket from "@fastify/websocket";
import { redisClient } from "./redis.js";
const fastify = Fastify({
  logger: true,
});
await fastify.register(fastifyWebsocket);
await fastify.register(cors, {
  origin: [`${process.env.FRONTEND_URL as string}`],
  methods: ["GET", "POST", "PUT", "DELETE"],
});
fastify.register(assignGame);
fastify.register(loadGames);
redisClient.ping();
console.log("Redis connected");
const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
    console.log("Pokribble server is running on port 4000!");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
