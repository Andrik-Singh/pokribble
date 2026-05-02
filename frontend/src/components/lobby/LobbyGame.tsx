import { toast } from "react-toastify";
import type { OutgoingWebSocketMessage } from "../../types";
import Settings from "./Settings";
import { useSettingsChange, useSocketFunction } from "../../zustand/sockets";

type GenerationIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type GenerationListType = { name: string; index: GenerationIndex }[];

const generationsList: GenerationListType = [
  { name: "Gen 1", index: 1 },
  { name: "Gen 2", index: 2 },
  { name: "Gen 3", index: 3 },
  { name: "Gen 4", index: 4 },
  { name: "Gen 5", index: 5 },
  { name: "Gen 6", index: 6 },
  { name: "Gen 7", index: 7 },
  { name: "Gen 8", index: 8 },
  { name: "Gen 9", index: 9 },
];

type LobbyGameProps = {
  sendJsonMessage: (msg: OutgoingWebSocketMessage) => void;
};

const LobbyGame = ({ sendJsonMessage }: LobbyGameProps) => {
  const link = window.location.origin + window.location.pathname;
  const room=useSocketFunction((s)=>s.roomContent)!
  const settings=useSettingsChange((s)=>s.settings) ?? room.settings
  const activeGeneration = generationsList.filter((gen) =>
    settings.generation.includes(gen.index),
  );
  const inactiveGeneration = generationsList.filter(
    (gen) => !settings.generation.includes(gen.index),
  );

  const toggleGeneration = (index: GenerationIndex) =>
    sendJsonMessage({ type: "Toggle_Generation", generation: index });

  const userId = window.localStorage.getItem("pokribble-user-id");
  const disabled = userId !== room.owner;
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight">
              Battle Lobby
            </h1>
            <p className="text-amber-700 text-sm mt-1 font-medium">
              Gather your team before the battle begins
            </p>
          </div>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(link);
            }}
            className="text-sm font-bold px-4 py-2 rounded-lg bg-amber-50 text-amber-400 border border-amber-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all active:scale-95 whitespace-nowrap"
          >
            Invite others
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl p-5 shadow-sm shadow-amber-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-800">
                Trainers
              </h2>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                {room.players.length} / {room.settings.maxPlayers}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[48px] content-start">
              {room.players.map((player) => {
                const owner = player.playerId === room.owner;
                return (
                  <div
                    key={player.playerId}
                    title={owner ? "Room Owner" : undefined}
                    className={"flex items-center gap-2  border border-amber-200 rounded-full pl-1 pr-3 py-1 transition-colors" + (owner ? " bg-green-400" : " bg-amber-50")}
                  >
                    <img
                      className="w-8 h-8 rounded-full object-cover bg-amber-100"
                      src={`https://img.pokemondb.net/sprites/lets-go-pikachu-eevee/normal/${player.avatar}.png`}
                      alt={player.name}
                    />
                    <span className="text-sm font-bold text-amber-900">
                      {player.name}
                    </span>
                  </div>
                );
              })}
              {room.players.length === 0 && (
                <p className="text-sm text-amber-400 italic">
                  No trainers yet…
                </p>
              )}
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl p-5 shadow-sm shadow-amber-200">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-800 mb-4">
              Game Rules
            </h2>
            <div className="flex flex-col gap-3">
              <Settings disabled={disabled} sendJsonMessage={sendJsonMessage} />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl p-5 mb-8 shadow-sm shadow-amber-200">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-800 mb-4">
            Generations
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Active
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeGeneration.map((gen) => (
                  <button
                    key={gen.index}
                    onClick={() => toggleGeneration(gen.index)}
                    disabled={activeGeneration.length <= 1 || disabled}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {gen.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-300" />
                Disabled
              </p>
              <div className="flex flex-wrap gap-1.5">
                {inactiveGeneration.map((gen) => (
                  <button
                    key={gen.index}
                    onClick={() => toggleGeneration(gen.index)}
                    disabled={disabled}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-400 border border-amber-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all active:scale-95"
                  >
                    {gen.name}
                  </button>
                ))}
                {inactiveGeneration.length === 0 && (
                  <p className="text-xs text-amber-300 italic">All active!</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            disabled={disabled || room.players.length < 2}
            onClick={() => {
              if (room.players.length < 2) {
                toast("At least 2 players are needed to start the game");
                return;
              }
              sendJsonMessage({ type: "Game_Start" });
            }}
            className="bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-extrabold text-base px-12 py-4 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 active:translate-y-0.5 transition-all tracking-wide cursor-pointer"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyGame;
