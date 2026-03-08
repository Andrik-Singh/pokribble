import { FastifyInstance } from "fastify";
import { generateName, room, serializeRoom } from "../utils.js";
import {
  broadcastToAll,
  broadcastToId,
  broadcastRoomState,
} from "../broadcast.js";
import { sendPokemonDescription } from "../sendPokemonDescription.js";
import { choosingPokemon } from "../choosingPokemon.js";
import { changeRound } from "../changeRound.js";
//checks if a room is there or not and checks if the game has started or not and if the user is already in the room or not
export default async function loadGames(fastify: FastifyInstance) {
  fastify.post("/api/loadGame", async (req, reply) => {
    const body: any = req.body;
    const randomId = crypto.randomUUID();
    const myRoom = room.get(body.roomId);
    console.log(myRoom);
    if (!myRoom) {
      return { text: "Pokribble room not found" };
    }
    const finalUserId = body.userId ?? randomId;
    const finalUserName = body.userName ?? generateName();
    if (myRoom.players.size >= myRoom.settings.maxPlayers) {
      return {
        text: "Max players reached",
        ok: false,
      };
    }
    if (!myRoom.players.has(finalUserId)) {
      if (myRoom.started) {
        return {
          text: "Pokribble room has already started",
        };
      }
    }
    const shouldHidePokemon =
      myRoom.started &&
      myRoom.round &&
      myRoom.round.pokemon &&
      finalUserId !== myRoom.round.drawerId;

    const roundData = shouldHidePokemon
      ? { ...myRoom.round, pokemon: null }
      : myRoom.round;

    return {
      text: "Pokribble room joined!",
      room: {
        ...myRoom,
        players: Array.from(myRoom.players.values()).map(
          ({ socketReference, disconnected, ...rest }) => rest,
        ),
        round: roundData,
      },
      userId: finalUserId,
      userName: finalUserName,
    };
  });

  fastify.get("/api/ws/:roomId", { websocket: true }, (connection, req) => {
    const { roomId } = req.params as { roomId: string };
    const { userId, userName } = req.query as {
      userId: string;
      userName: string;
    };

    const myRoom = room.get(roomId);
    if (!myRoom) {
      connection.close();
      return;
    }
    if (!userId) {
      connection.close();
      return;
    }
    const existingPlayer = myRoom.players.get(userId);
    if (existingPlayer) {
      existingPlayer.socketReference = connection;
      existingPlayer.disconnected = false;
    } else {
      if (myRoom.started) {
        connection.close();
        return;
      }
      myRoom.players.set(userId, {
        playerId: userId,
        score: 0,
        name: userName,
        socketReference: connection,
        disconnected: false,
      });
    }
    broadcastRoomState(myRoom);

    console.log("connection started");
    connection.on("message", async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === "Toggle_Generation") {
          const genIndex = message.generation as
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9;
          const currentGens = myRoom.settings.generation;
          if (currentGens.includes(genIndex)) {
            if (currentGens.length <= 1) {
              return;
            }
            myRoom.settings.generation = currentGens.filter(
              (g) => g !== genIndex,
            );
          } else {
            myRoom.settings.generation = [...currentGens, genIndex].sort();
          }
          broadcastRoomState(myRoom);
          return;
        }
        if (message.type === "Update_Settings") {
          if (
            !message.settings ||
            typeof message.settings !== "object" ||
            myRoom.started
          ) {
            return;
          }
          if (
            message.settings.maxPlayers < 3 ||
            message.settings.maxPlayers > 10
          ) {
            return;
          }
          if (
            message.settings.maxRounds < 1 ||
            message.settings.maxRounds > 10
          ) {
            return;
          }
          if (
            message.settings.maxTime < 1000 ||
            message.settings.maxTime > 80000
          ) {
            return;
          }
          const { maxPlayers, maxRounds, maxTime, generation } =
            message.settings;
          myRoom.settings = {
            ...myRoom.settings,
            maxPlayers,
            maxRounds,
            maxTime,
          };
          if (generation) {
            myRoom.settings.generation = generation;
          }
          broadcastRoomState(myRoom);
          return;
        }
        if (message.type === "Game_Start") {
          if (myRoom.started) return;
          myRoom.started = true;
          myRoom.round.drawerIndex = 0;
          myRoom.round.timeRemaining = myRoom.settings.maxTime;
          await choosingPokemon(myRoom, myRoom.round.drawerIndex);
          return;
        }
        if (message.type === "Pokemon_Chosen") {
          if (userId !== myRoom.round.drawerId) return;
          myRoom.round.pokemon = message.pokemon;
          await sendPokemonDescription(myRoom);

          if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);

          myRoom.round.timerId = setInterval(async () => {
            if (myRoom.round.timeRemaining <= 0) {
              if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);

              const players = Array.from(myRoom.players.values());
              const previousDrawerIndex = myRoom.round.drawerIndex;

              do {
                myRoom.round.drawerIndex =
                  (myRoom.round.drawerIndex + 1) % players.length;
              } while (players[myRoom.round.drawerIndex].disconnected);
              if (myRoom.round.drawerIndex <= previousDrawerIndex) {
                myRoom.round.currentRound += 1;
              }

              if (myRoom.round.currentRound > myRoom.settings.maxRounds) {
                console.log(`Game over in room ${roomId}`);
                myRoom.gameEnded = true;
                broadcastRoomState(myRoom);
                return;
              }

              console.log(myRoom.round.drawerIndex, "drawerIndex");
              await changeRound(myRoom, myRoom.round.drawerIndex);
              return;
            }
            myRoom.round.timeRemaining = myRoom.round.timeRemaining - 1000;
          }, 1000);
          return;
        }
        if (message.type === "Return_To_Lobby") {
          myRoom.started = false;
          myRoom.gameEnded = false;
          myRoom.round.currentRound = 1;
          myRoom.round.drawerIndex = 0;
          myRoom.round.pokemon = undefined;
          myRoom.round.drawerId = undefined;
          for (const player of myRoom.players.values()) {
            player.score = 0;
          }
          if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);
          broadcastRoomState(myRoom);
          return;
        }
      } catch (e) {
        console.error(e);
      }
      broadcastRoomState(myRoom);
    });

    connection.on("close", () => {
      if (myRoom.started) {
        const existingPlayer = myRoom.players.get(userId);
        if (!existingPlayer) {
          return;
        }
        existingPlayer.disconnected = true;
        existingPlayer.socketReference = undefined;
        broadcastRoomState(myRoom);
        const anyoneOnline = Array.from(myRoom.players.values()).some(
          (player) => !player.disconnected,
        );
        if (!anyoneOnline) {
          console.log("room deleted", roomId);
          if (myRoom.round.timerId) clearInterval(myRoom.round.timerId);
          room.delete(roomId);
          connection.close();
          return;
        }
        return;
      }
      if (!myRoom.started) {
        if (myRoom.players.size < 1) {
          console.log("room deleted", roomId);
          room.delete(roomId);
          connection.close();
          return;
        }
        myRoom.players.delete(userId);
        console.log("User deleted", userId);
        broadcastRoomState(myRoom);
        return;
      }
    });

    connection.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });
}
