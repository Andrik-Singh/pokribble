import type { Room } from "../../types";
import { SPRITE_BASE_URL } from "../../utils/randomNumbers";

const rankMeta = [
  {
    card: "bg-amber-50 border border-amber-200/60",
    rank: "text-amber-500 font-bold",
    name: "text-amber-900 font-semibold",
    score: "text-amber-600 font-bold",
    badge: "bg-amber-100 text-amber-600 border border-amber-200",
    label: "🥇",
  },
  {
    card: "bg-slate-100 border border-slate-200/60",
    rank: "text-slate-400 font-semibold",
    name: "text-slate-700 font-semibold",
    score: "text-slate-500 font-semibold",
    badge: "bg-slate-200 text-slate-500 border border-slate-300",
    label: "🥈",
  },
  {
    card: "bg-orange-50 border border-orange-200/50",
    rank: "text-orange-400 font-semibold",
    name: "text-orange-800 font-medium",
    score: "text-orange-500",
    badge: "bg-orange-100 text-orange-500 border border-orange-200",
    label: "🥉",
  },
];

const defaultMeta = {
  card: "bg-white border border-slate-100",
  rank: "text-slate-300",
  name: "text-slate-500",
  score: "text-slate-400",
  badge: "bg-slate-50 text-slate-400 border border-slate-200",
  label: "",
};

const SideBar = ({ room }: { room: Room }) => {
  const sorted = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <aside className="w-full h-full bg-slate-50 border-r border-slate-200 flex flex-col gap-4 p-5 font-mono overflow-y-auto">
      <h1 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 pb-3 border-b border-slate-200">
        Leaderboard
      </h1>

      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {sorted.map((player, index) => {
          const meta = rankMeta[index] ?? defaultMeta;

          return (
            <li
              key={player.playerId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${meta.card}`}
            >
              {/* Rank */}
              <span
                className={`text-[11px] w-5 text-center shrink-0 ${meta.rank}`}
              >
                {meta.label || `#${index + 1}`}
              </span>

              {/* Avatar */}
              <img
                src={`${SPRITE_BASE_URL}${player.avatar}.png`}
                alt={player.avatar}
                className="w-8 h-8 rounded-full shrink-0 object-cover ring-2 ring-white"
              />

              {/* Name */}
              <span className={`flex-1 text-[12px] truncate ${meta.name}`}>
                {player.name}
              </span>

              {/* Score */}
              <span
                className={`text-[11px] tabular-nums px-2 py-0.5 rounded-full shrink-0 ${meta.badge}`}
              >
                {player.score.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SideBar;
