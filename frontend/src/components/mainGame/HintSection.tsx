import { typeStyles } from "../../utils/pokemonColor";

const HintSection = ({
  hints,
}: {
  hints: {
    length: number | null;
    basestat: number | null;
    type: string[] | null;
  };
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2 w-full animate-in fade-in slide-in-from-top-1 duration-500">
      {/* 1. Letter Slots (The "Hangman" style) */}
      {hints.length != null && (
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-1">
          {Array.from({ length: hints.length }, (_, i) => (
            <div
              key={i}
              className="w-4 h-6 sm:w-6 sm:h-8 border-b-4 border-slate-300 flex items-end justify-center pb-1 transition-all"
            >
              <span className="text-transparent select-none">_</span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Stat Pills */}
      <div className="flex flex-wrap justify-center items-center gap-2">
        {/* Base Stat Badge */}
        {hints.basestat != null && (
          <div className="flex items-center bg-white border border-slate-200 rounded-full pl-1 pr-3 py-0.5 shadow-sm overflow-hidden scale-in-95 animate-in duration-300">
            <span className="bg-indigo-500 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold mr-2 uppercase">
              BST
            </span>
            <span className="text-xs font-mono font-bold text-slate-700">
              {hints.basestat}
            </span>
          </div>
        )}

        {/* Pokemon Type Badges */}
        {hints.type?.map((type, i) => {
          const style = typeStyles[type.toLowerCase()] || {
            bgColor: "#ccc",
            color: "#333",
          };
          return (
            <span
              key={i}
              className="px-3 py-1 rounded-full capitalize font-black text-[10px] tracking-wider shadow-sm border border-black/5 animate-in zoom-in duration-300"
              style={{
                backgroundColor: style.bgColor,
                color: style.color,
              }}
            >
              {type}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default HintSection;
