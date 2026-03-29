import { FastifyInstance } from "fastify";
import { generateName, room, serializeRoom } from "../utils.js";
import { broadcastRoomState } from "../broadcast.js";
import { webSocketFunction } from "../websokcetFunctions/webSocketFunction.js";
import { sendDrawing } from "../DrawingBoard.js";
//checks if a room is there or not and checks if the game has started or not and if the user is already in the room or not
export default async function loadGames(fastify: FastifyInstance) {
  fastify.post("/api/loadGame", async (req, reply) => {
    const body: any = req.body;
    const randomId = crypto.randomUUID();
    const myRoom = room.get(body.roomId);
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
    const { timerId, ...restRound } = myRoom.round;
    const roundData = shouldHidePokemon
      ? { ...restRound, pokemon: null }
      : restRound;

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
    const { userId, userName, avatar } = req.query as {
      userId: string;
      userName: string;
      avatar: string;
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
      if (!userName) {
        connection.close();
        return;
      }
      myRoom.players.set(userId, {
        playerId: userId,
        score: 0,
        name: userName,
        socketReference: connection,
        disconnected: false,
        avatar: avatar,
      });
    }
    broadcastRoomState(myRoom);
    connection.on("message", async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (Array.isArray(message)) {
          sendDrawing(message, myRoom);
          return;
        }
        const messageType = message.type as string;
        if (!(messageType in webSocketFunction)) {
          console.log("no handler found");
          return;
        }

        const handler =
          webSocketFunction[messageType as keyof typeof webSocketFunction];
        await handler(myRoom, message, userId);
        return;
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
