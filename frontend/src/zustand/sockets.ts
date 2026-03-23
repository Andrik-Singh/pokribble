import { create } from "zustand";
import type { IncomingWebSocketMessage, Room } from "../types";
export type TSocketFunction = {
  roomContent: Room | null;
  setRoomContent: (room: Room) => void;
  webSocketMessage: IncomingWebSocketMessage | null;
  setLastJsonMessage: (message: IncomingWebSocketMessage) => void;
};
export const useSocketFunction = create<TSocketFunction>((set) => ({
  roomContent: null,
  setRoomContent: (room: Room) => set({ roomContent: room }),
  webSocketMessage: null,
  setLastJsonMessage: (message: IncomingWebSocketMessage) =>
    set({ webSocketMessage: message }),
}));
