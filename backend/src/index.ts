import "./env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import assignGame from "./routes/assignGames.js";
import loadGames from "./routes/loadGames.js";
import fastifyWebsocket from "@fastify/websocket";
import { redisClient } from "./redis.js";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fastify = Fastify({
  logger: true,
});
console.log("🚨🚨🚨 THIS IS SRC/INDEX.TS 🚨🚨🚨");
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../frontend"),
});
fastify.setNotFoundHandler((req, reply) => {
  if (req.url.startsWith("/api") || req.url.startsWith("/ws")) {
    reply.code(404).send({ error: "Not Found" });
  } else {
    reply.sendFile("index.html");
  }
});
await fastify.register(fastifyWebsocket);
await fastify.register(cors, {
  origin: [
    process.env.FRONTEND_URL as string,
    process.env.FRONTEND_URL2 as string,
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
});
await fastify.register(assignGame);
await fastify.register(loadGames);
fastify.addHook("onRequest", async (req) => {
  console.log("🔥 REQUEST:", req.method, req.url);
});
try {
  await redisClient.ping();
  console.log("Redis connected");
} catch (error) {
  console.error("Redis connection failed:", error);
}
const start = async () => {
  try {
    await fastify.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    console.log(
      `Pokribble server is running on port ${process.env.PORT || 3000}!`,
    );
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
