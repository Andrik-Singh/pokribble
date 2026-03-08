import type { Room } from "../routes/Game";

type ScoreBoardProps = {
  room: Room;
  sendJsonMessage: (msg: Record<string, unknown>) => void;
};

const ScoreBoard = ({ room, sendJsonMessage }: ScoreBoardProps) => {
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const top3 = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  const handleReturnToLobby = () => {
    sendJsonMessage({ type: "Return_To_Lobby" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <h1 className="text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 drop-shadow-sm">
        Final Scores
      </h1>

      {/* Podium */}
      <div className="flex items-end justify-center mb-16 gap-4 h-64">
        {/* Second Place */}
        {top3[1] && (
          <div className="flex flex-col items-center animate-fade-in-up delay-100">
            <div className="text-xl font-bold text-slate-300 mb-2 truncate max-w-24">
              {top3[1].name}
            </div>
            <div className="bg-slate-400 w-24 h-32 rounded-t-lg flex items-center justify-center text-3xl font-bold shadow-lg shadow-black/50 border-t-2 border-slate-300">
              2
            </div>
            <div className="mt-3 text-lg font-semibold text-slate-400">
              {top3[1].score} pts
            </div>
          </div>
        )}

        {/* First Place */}
        {top3[0] && (
          <div className="flex flex-col items-center animate-fade-in-up z-10">
            <div className="text-2xl font-black text-yellow-400 mb-2 drop-shadow-md truncate max-w-32">
              {top3[0].name}
            </div>
            <div className="bg-yellow-500 w-32 h-44 rounded-t-lg flex flex-col items-center justify-center shadow-xl shadow-yellow-500/20 border-t-4 border-yellow-300">
              <span className="text-5xl font-black text-white drop-shadow-md">
                1
              </span>
            </div>
            <div className="mt-3 text-xl font-bold text-yellow-500 drop-shadow-sm">
              {top3[0].score} pts
            </div>
          </div>
        )}

        {/* Third Place */}
        {top3[2] && (
          <div className="flex flex-col items-center animate-fade-in-up delay-200">
            <div className="text-lg font-bold text-orange-400 mb-2 truncate max-w-24">
              {top3[2].name}
            </div>
            <div className="bg-orange-600 w-24 h-24 rounded-t-lg flex items-center justify-center text-3xl font-bold shadow-lg shadow-black/50 border-t-2 border-orange-400">
              3
            </div>
            <div className="mt-3 text-lg font-semibold text-orange-500">
              {top3[2].score} pts
            </div>
          </div>
        )}
      </div>

      {/* Other Players List */}
      {rest.length > 0 && (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-xl mb-12 border border-slate-700">
          <ul className="space-y-4">
            {rest.map((player, index) => (
              <li
                key={player.playerId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-700/50 border border-slate-600/50"
              >
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-bold w-6 text-right">
                    {index + 4}
                  </span>
                  <span className="font-semibold">{player.name}</span>
                </div>
                <span className="text-slate-300 font-mono">
                  {player.score}{" "}
                  <span className="text-slate-500 text-sm">pts</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <button
        onClick={handleReturnToLobby}
        className="px-8 py-4 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
      >
        Return to Lobby
      </button>
    </div>
  );
};

export default ScoreBoard;
