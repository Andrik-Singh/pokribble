import React from "react";
import type { OutgoingWebSocketMessage, Room } from "../../types";

const Settings = ({ room, sendJsonMessage }: { room: Room; sendJsonMessage: (msg: OutgoingWebSocketMessage) => void }) => {
  const updateSettings = (settings: Partial<Room["settings"]>) =>
    sendJsonMessage({ type: "Update_Settings", settings });

  const userId = window.localStorage.getItem("pokribble-user-id");
  const disabled = userId !== room.owner;
  return (
    <div>
      {[
        {
          label: "Max Players",
          canDec: room.settings.maxPlayers > 3,
          canInc: room.settings.maxPlayers < 10,
          onDec: () =>
            updateSettings({
              ...room.settings,
              maxPlayers: room.settings.maxPlayers - 1,
            }),
          onInc: () =>
            updateSettings({
              ...room.settings,
              maxPlayers: room.settings.maxPlayers + 1,
            }),
          display: `${room.settings.maxPlayers}`,
        },
        {
          label: "Rounds",
          canDec: room.settings.maxRounds > 1,
          canInc: room.settings.maxRounds < 10,
          onDec: () =>
            updateSettings({
              ...room.settings,
              maxRounds: room.settings.maxRounds - 1,
            }),
          onInc: () =>
            updateSettings({
              ...room.settings,
              maxRounds: room.settings.maxRounds + 1,
            }),
          display: `${room.settings.maxRounds}`,
        },
        {
          label: "Time per Round",
          canDec: room.settings.maxTime > 10000,
          canInc: room.settings.maxTime < 60000,
          onDec: () =>
            updateSettings({
              ...room.settings,
              maxTime: room.settings.maxTime - 5000,
            }),
          onInc: () =>
            updateSettings({
              ...room.settings,
              maxTime: room.settings.maxTime + 5000,
            }),
          display: `${room.settings.maxTime / 1000}s`,
        },
      ].map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 hover:border-orange-300 transition-colors"
        >
          <span className="text-sm font-bold text-amber-800">{item.label}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={!item.canDec || disabled}
              onClick={item.onDec}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-amber-200 text-amber-600 font-bold text-base hover:bg-red-50 hover:border-red-200 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
            >
              −
            </button>
            <span className="text-base font-extrabold text-amber-900 w-10 text-center tabular-nums">
              {item.display}
            </span>
            <button
              disabled={!item.canInc || disabled}
              onClick={item.onInc}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-amber-200 text-amber-600 font-bold text-base hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Settings;
