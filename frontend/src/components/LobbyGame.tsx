import type { OutgoingWebSocketMessage, Room } from "../types";

type GenerationIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type GenerationListType = {
  name: string;
  index: GenerationIndex;
}[];
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
  room: Room;
  sendJsonMessage: (msg: OutgoingWebSocketMessage) => void;
};

const LobbyGame = ({ room, sendJsonMessage }: LobbyGameProps) => {
  const activeGeneration = generationsList.filter((gen) =>
    room.settings.generation.includes(gen.index),
  );

  const inactiveGeneration = generationsList.filter(
    (gen) => !room.settings.generation.includes(gen.index),
  );

  const toggleGeneration = (index: GenerationIndex) => {
    sendJsonMessage({ type: "Toggle_Generation", generation: index });
  };
  const updateSettings = (settings: Partial<Room["settings"]>) => {
    sendJsonMessage({ type: "Update_Settings", settings });
  };
  return (
    <div className="p-6 max-w-4xl mx-auto font-sans text-slate-800">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">
          Players ({room.players.length}/{room.settings.maxPlayers})
        </h1>
        <div className="flex flex-wrap gap-2">
          {room.players.map((player) => (
            <div
              key={player.playerId}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full border border-blue-200"
            >
              {player.name}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <h2 className="text-lg font-bold text-green-700 mb-3 border-b border-green-200 pb-2">
            Active Generations
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {activeGeneration.map((gen) => (
              <button
                key={gen.index}
                onClick={() => toggleGeneration(gen.index)}
                disabled={activeGeneration.length <= 1}
                className={`bg-white p-2 rounded shadow-sm text-center border border-green-300 transition-colors ${
                  activeGeneration.length <= 1
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-green-100 hover:border-green-400"
                }`}
              >
                {gen.name}
              </button>
            ))}{" "}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-500 mb-3 border-b border-gray-200 pb-2">
            Disabled
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {inactiveGeneration.map((gen) => (
              <button
                key={gen.index}
                onClick={() => toggleGeneration(gen.index)}
                className="bg-white p-2 rounded shadow-sm text-center border border-gray-300 opacity-60 cursor-pointer hover:opacity-100 hover:border-green-300 hover:bg-green-50 transition-all"
              >
                {gen.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold text-gray-500 mb-3 border-b border-gray-200 pb-2">
          Game Rules
        </h2>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
          <div className="bg-white p-3 rounded shadow-sm border border-gray-300 hover:border-green-300 hover:bg-green-50 transition-all flex items-center justify-between">
            <button
              disabled={room.settings.maxPlayers <= 3}
              onClick={() => {
                if (room.settings.maxPlayers <= 3) {
                  return;
                }
                updateSettings({
                  ...room.settings,
                  maxPlayers: room.settings.maxPlayers - 1,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer select-none"
            >
              −
            </button>
            <span className="text-sm font-medium text-gray-700">
              Max Players: {room.settings.maxPlayers}
            </span>
            <button
              disabled={room.settings.maxPlayers >= 10}
              onClick={() => {
                if (room.settings.maxPlayers >= 10) {
                  return;
                }
                updateSettings({
                  ...room.settings,
                  maxPlayers: room.settings.maxPlayers + 1,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg hover:bg-green-100 hover:text-green-600 transition-colors cursor-pointer select-none"
            >
              +
            </button>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-300 hover:border-green-300 hover:bg-green-50 transition-all flex items-center justify-between">
            <button
              disabled={room.settings.maxRounds <= 1}
              onClick={() => {
                if (room.settings.maxRounds <= 1) {
                  return;
                }
                updateSettings({
                  ...room.settings,
                  maxRounds: room.settings.maxRounds - 1,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer select-none"
            >
              −
            </button>
            <span className="text-sm font-medium text-gray-700">
              Max Rounds: {room.settings.maxRounds}
            </span>
            <button
              disabled={room.settings.maxRounds >= 10}
              onClick={() => {
                if (room.settings.maxRounds >= 10) {
                  return;
                }
                updateSettings({
                  ...room.settings,
                  maxRounds: room.settings.maxRounds + 1,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg hover:bg-green-100 hover:text-green-600 transition-colors cursor-pointer select-none"
            >
              +
            </button>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-300 hover:border-green-300 hover:bg-green-50 transition-all flex items-center justify-between">
            <button
              disabled={room.settings.maxTime <= 10000}
              onClick={() => {
                if (room.settings.maxTime <= 10000) {
                  return;
                }
                updateSettings({
                  ...room.settings,
                  maxTime: room.settings.maxTime - 5000,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer select-none"
            >
              −
            </button>
            <span className="text-sm font-medium text-gray-700">
              Max Time: {room.settings.maxTime / 1000}s
            </span>
            <button
              disabled={room.settings.maxTime >= 60000}
              onClick={() => {
                if (room.settings.maxTime >= 60000) {
                  return;
                }
                updateSettings({
                  ...room.settings,
                  maxTime: room.settings.maxTime + 5000,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg hover:bg-green-100 hover:text-green-600 transition-colors cursor-pointer select-none"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            sendJsonMessage({
              type: "Game_Start",
            });
          }}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default LobbyGame;
