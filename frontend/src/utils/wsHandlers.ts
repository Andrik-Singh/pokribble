import { toast } from "react-toastify";
import { useDrawingSocket } from "../zustand/drawing";
import { useScreenChange } from "../zustand/screen";
import { useSettingsChange, useSocketFunction } from "../zustand/sockets";
import type { IncomingWebSocketMessage } from "../types";
type WsMessageObject = Exclude<
  IncomingWebSocketMessage,
  [number, number, number, string, number, "pen" | "eraser"]
>;
type MsgOfType<T extends WsMessageObject["type"]> = Extract<
  WsMessageObject,
  { type: T }
>;

type SetError = (msg: string) => void;

export function handleWsMessage(
  data: IncomingWebSocketMessage,
  setError: SetError,
) {
  if (Array.isArray(data)) {
    useDrawingSocket.getState().setDrawingData(data);
    return;
  }
  const narrwoedData = data as WsMessageObject;
  const handlers: {
    [T in WsMessageObject["type"]]?: (msg: MsgOfType<T>) => void;
  } = {
    Setting_Up: (msg) => {
      useSettingsChange.getState().setSettings(msg.settings);
    },
    Room_Update: (msg) => {
      if (!msg.room) {
        setError("Room not found");
        return;
      }
      useSocketFunction.getState().setRoomContent(msg.room);
      if (!useSettingsChange.getState().settings) {
        useSettingsChange.getState().setSettings(msg.room.settings);
      }
      useScreenChange
        .getState()
        .setScreen({ type: "Room_Update", room: msg.room });
    },
    Timer_Tick: (msg) => {
      useSocketFunction.getState().setTimeReamining(msg.timeRemaining);
    },
    Hint: (msg) => {
      useSocketFunction.getState().setLastJsonMessage(msg);
    },
    Pokemon_Choose: (msg) => {
      useScreenChange.getState().setScreen({
        type: "Pokemon_Choose",
        pokemon: msg.pokemon,
        text: msg.text,
      });
    },
    Timeout: (msg) => {
      useScreenChange.getState().setScreen({
        type: "Timeout",
        drawerId: msg.drawer,
        pokemon: msg.pokemon,
      });
    },
    Wait: () => {
      useScreenChange.getState().setScreen({ type: "Setting_Up" });
    },
    Guess_Result: (msg) => {
      if (msg.correct) {
        toast("You guessed the word!");
      } else {
        toast(`Incorrect — you were ${msg.distance} away`);
      }
    },
  };
  const handler = handlers[narrwoedData.type] as ((msg: WsMessageObject) => void) | undefined;
if (handler) {
  handler(narrwoedData);
}
}
