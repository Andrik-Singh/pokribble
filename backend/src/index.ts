import Fastify from "fastify";
import cors from "@fastify/cors";
import dotEnv from "dotenv"
import assignGame from "./routes/assignGames.js";
import loadGames from "./routes/loadGames.js";
import fastifyWebsocket from "@fastify/websocket";
dotEnv.config()
const fastify = Fastify({
  logger: true,
});
await fastify.register(fastifyWebsocket)
await fastify.register(cors, {
  origin: [`${process.env.FRONTEND_URL as string}`], 
  methods: ["GET", "POST", "PUT", "DELETE"],
});
fastify.register(assignGame)
fastify.register(loadGames)
const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
    console.log("server is running")
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
