import { FastifyInstance } from "fastify";
import { generateName, room } from "../utils.js";
import { broadcast } from "../broadcast.js";

export default async function loadGames(fastify: FastifyInstance) {
  fastify.post("/api/loadGame", async (req, reply) => {
    const body: any = req.body;
    const randomId = crypto.randomUUID();
    const myRoom = room.get(body.roomId);
    if (!myRoom) {
      return { text: "Game not found" };
    }
    const finalUserId = body.userId ?? randomId;
    const finalUserName = body.userName ?? generateName();
    if (myRoom.players.size >= myRoom.settings.maxPlayers) {
      return {
        text: "Max players reached",
      };
    }
    if (!myRoom.players.has(finalUserId)) {
      myRoom.players.set(finalUserId, {
        playerId: finalUserId,
        score: 0,
        name: finalUserName,
      });
    }
    return {
      text: "Game found",
      room: {
        ...myRoom,
        players: Array.from(myRoom.players.values()),
      },
      userId: finalUserId,
      userName: finalUserName,
    };
  });

  fastify.get("/api/ws/:roomId", { websocket: true }, (connection, req) => {
    const { roomId } = req.params as { roomId: string };
    const { userId } = req.query as { userId: string };
    const socketId = crypto.randomUUID();
    const myRoom = room.get(roomId);
    if (!myRoom) {
      connection.close();
      return;
    }
    console.log("connection started");
    myRoom.sockets.set(socketId, connection);
    connection.on("message", (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === "Toggle_Generation") {
          const genIndex = message.generation as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
          const currentGens = myRoom.settings.generation;
          if(currentGens.length<=1){
            return;
          }
          if (currentGens.includes(genIndex)) {
            if (currentGens.length > 1) {
              myRoom.settings.generation = currentGens.filter((g) => g !== genIndex);
            }
          } else {
            myRoom.settings.generation = [...currentGens, genIndex].sort();
          } 
        }
        if(message.type === "Update_Settings"){
          console.log(message.settings)
          if(message.settings.maxPlayers<=3 || message.settings.maxPlayers>=10){
            return;
          }
          if(message.settings.maxRounds<=1 || message.settings.maxRounds>=10  ){
            return;
          }
          if(message.settings.maxTime<=10000 || message.settings.maxTime>=80000){
            return;
          }
          myRoom.settings={...myRoom.settings,...message.settings}
        } 
        if(message.type === "Game_Start"){
          myRoom.started=true;
        }
      } catch (e) {
      }
      const payload = JSON.stringify({
        room: {
          ...myRoom,
          players: Array.from(myRoom.players.values()),
        },
      });
      broadcast(myRoom, payload);
    });

    connection.on("close", () => {
      if (!myRoom.started) {
        if (myRoom.players.size < 1) {
          console.log("room deleted", roomId);
          room.delete(roomId);
          connection.close();
          return;
        }
        myRoom.players.delete(userId);
        console.log("User deleted", userId);
        const payload = JSON.stringify({
          room: {
            ...myRoom,
            players: Array.from(myRoom.players.values()),
          },
        });
        broadcast(myRoom,payload);
        return;
      }
    });

    connection.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });
}
