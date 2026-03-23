import type { OutgoingWebSocketMessage } from "../types";
import { useSocketFunction, type TSocketFunction } from "../zustand/sockets";

type ScoreBoardProps = {
  sendJsonMessage: (msg: OutgoingWebSocketMessage) => void;
};

const medals = ["🥇", "🥈", "🥉"];
const podiumColors = [
  {
    bar: "bg-gradient-to-t from-amber-500 to-yellow-400",
    border: "border-yellow-300",
    name: "text-amber-900",
    score: "text-amber-700",
    height: "h-44",
  },
  {
    bar: "bg-linear-to-r from-slate-500 to-gray-400",
    border: "border-gray-200",
    name: "text-amber-800",
    score: "text-amber-600",
    height: "h-32",
  },
  {
    bar: "bg-linear-to-r from-orange-700 to-orange-800",
    border: "border-orange-300",
    name: "text-amber-800",
    score: "text-orange-600",
    height: "h-24",
  },
];
const podiumOrder = [1, 0, 2];

const ScoreBoard = ({ sendJsonMessage }: ScoreBoardProps) => {
  const room = useSocketFunction((s: TSocketFunction) => s.roomContent);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 flex items-center justify-center">
        <p className="text-amber-600 font-bold animate-pulse">Initializing…</p>
      </div>
    );
  }

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const top3 = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-100 via-orange-50 to-amber-100 font-sans">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight">
            Final Scores
          </h1>
        </div>
        {top3.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl p-6 mb-4 shadow-sm shadow-amber-200">
            <div className="flex items-end justify-center gap-4">
              {podiumOrder.map((rank) => {
                const player = top3[rank];
                if (!player) return <div key={rank} className="w-24" />;
                const style = podiumColors[rank];
                return (
                  <div
                    key={player.playerId}
                    className="flex flex-col items-center"
                  >
                    <img
                      className="w-10 h-10 rounded-full object-cover bg-amber-100 border-2 border-amber-200 mb-1"
                      src={`https://img.pokemondb.net/sprites/lets-go-pikachu-eevee/normal/${player.avatar}.png`}
                      alt={player.name}
                    />
                    <p
                      className={`text-xs font-extrabold mb-1 truncate max-w-20 ${style.name}`}
                    >
                      {player.name}
                    </p>
                    <div
                      className={`w-24 ${style.height} ${style.bar} border-t-4 ${style.border} rounded-t-xl flex items-center justify-center text-3xl shadow-md`}
                    >
                      {medals[rank]}
                    </div>
                    <p className={`text-xs font-bold mt-2 ${style.score}`}>
                      {player.score} pts
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {rest.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl p-5 mb-4 shadow-sm shadow-amber-200">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-800 mb-4">
              Other Trainers
            </h2>
            <ul className="space-y-2">
              {rest.map((player, i) => (
                <li
                  key={player.playerId}
                  className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-amber-400 w-5">
                      {i + 4}
                    </span>
                    <img
                      className="w-8 h-8 rounded-full object-cover bg-amber-100"
                      src={`https://img.pokemondb.net/sprites/lets-go-pikachu-eevee/normal/${player.avatar}.png`}
                      alt={player.name}
                    />
                    <span className="text-sm font-bold text-amber-900">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-700">
                    {player.score}{" "}
                    <span className="text-xs font-medium text-amber-400">
                      pts
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-center mt-8">
          <button
            onClick={() => sendJsonMessage({ type: "Return_To_Lobby" })}
            className="bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-extrabold text-base px-12 py-4 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 active:translate-y-0.5 transition-all tracking-wide cursor-pointer"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
