import { create } from "zustand";
import type { IncomingWebSocketMessage, Room } from "../types";
export type TSocketFunction = {
  roomContent: Room | null;
  setRoomContent: (room: Room) => void;
  webSocketMessage: IncomingWebSocketMessage | null;
  setLastJsonMessage: (message: IncomingWebSocketMessage) => void;
  timeRemaining: number;
  setTimeReamining: (time: number) => void;
};
export type TsettingsChange = {
  settings: {
    maxPlayers: number;
    maxRounds: number;
    maxTime: number;
    generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
  } | null;
  setSettings: (settings: TsettingsChange["settings"]) => void;
};
export const useSocketFunction = create<TSocketFunction>((set) => ({
  roomContent: null,
  setRoomContent: (room: Room) => set({ roomContent: room }),
  webSocketMessage: null,
  setLastJsonMessage: (message: IncomingWebSocketMessage) =>
    set({ webSocketMessage: message }),
  timeRemaining: 0,
  setTimeReamining: (time: number) => set({ timeRemaining: time }),
}));
export const useSettingsChange = create<TsettingsChange>((set) => ({
  settings: null,
  setSettings: (settings: TsettingsChange["settings"]) =>
    set({ settings: settings }),
}));
