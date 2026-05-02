import type { OutgoingWebSocketMessage, Room } from "../../types";
import { useSettingsChange } from "../../zustand/sockets";

const Settings = ({disabled, sendJsonMessage }: { disabled: boolean; sendJsonMessage: (msg: OutgoingWebSocketMessage) => void }) => {
  const updateSettings = (settings: Partial<Room["settings"]>) =>
    sendJsonMessage({ type: "Update_Settings", settings });
  const settings=useSettingsChange((s)=>s.settings)
  const setSettings=useSettingsChange((s)=>s.setSettings)
  if(!settings){
    return <div>Loading...</div>
  }
  return (
    <div>
      {[
        {
          label: "Max Players",
          canDec: settings.maxPlayers > 3,
          canInc: settings.maxPlayers < 10,
          onDec: () =>{
            setSettings({
              ...settings,
              maxPlayers: settings.maxPlayers - 1,
            })
            updateSettings({
              ...settings,
              maxPlayers: settings.maxPlayers - 1,
            })},
          onInc: () =>{
            setSettings({
              ...settings,
              maxPlayers: settings.maxPlayers + 1,
            })
            updateSettings({
              ...settings,
              maxPlayers: settings.maxPlayers + 1,
            })},
          display: `${settings.maxPlayers}`,
        },  
        {
          label: "Rounds",
          canDec: settings.maxRounds > 1,
          canInc: settings.maxRounds < 10,
          onDec: () => {
            setSettings({
              ...settings,
              maxRounds: settings.maxRounds - 1,
            })
            updateSettings({
              ...settings,
              maxRounds: settings.maxRounds - 1,
            })
          },
          onInc: () => {
            setSettings({
              ...settings,
              maxRounds: settings.maxRounds + 1,
            })
            updateSettings({
              ...settings,
              maxRounds: settings.maxRounds + 1,
            })
          },
          display: `${settings.maxRounds}`,
        },
        {
          label: "Time per Round",
          canDec: settings.maxTime > 10000,
          canInc: settings.maxTime < 60000,
          onDec: () => {
            setSettings({
              ...settings,
              maxTime: settings.maxTime - 5000,
            })
            updateSettings({
              ...settings,
              maxTime: settings.maxTime - 5000,
            })
          },
          onInc: () => {
            setSettings({
              ...settings,
              maxTime: settings.maxTime + 5000,
            })
            updateSettings({
              ...settings,
              maxTime: settings.maxTime + 5000,
            })
          },
          display: `${settings.maxTime / 1000}s`,
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
