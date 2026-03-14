import type { Room } from "../types";

const SideBar = ({ room }: { room: Room }) => {
  const sorted = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <aside className="w-full h-auto bg-[#0f0f13] border-r border-white/5 flex flex-col gap-5 p-5 font-mono">
      {" "}
      <h1 className="text-[11px] font-medium tracking-widest uppercase text-white/25 pb-3 border-b border-white/5">
        Scores
      </h1>
      <ul className="flex xl:flex-col flex-row xl:gap-1 gap-5">
        {sorted.map((player, index) => (
          <li
            key={player.playerId}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors ${
              index === 0
                ? "bg-violet-950/50 border border-violet-500/20"
                : "hover:bg-white/5"
            }`}
          >
            <span
              className={`text-[11px] w-5 shrink-0 ${index === 0 ? "text-violet-400" : "text-white/20"}`}
            >
              #{index + 1}
            </span>
            <span
              className={`flex-1 text-[13px] truncate ${index === 0 ? "text-white" : "text-white/60"}`}
            >
              {player.name}
            </span>
            <span
              className={`text-[13px] font-medium tabular-nums ${index === 0 ? "text-violet-400" : "text-white/30"}`}
            >
              {player.score}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SideBar;
