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
    <div className="flex flex-col bg-white justify-center items-center gap-7 text-sm text-gray-700">
      {hints.length != null && (
        <div className="flex gap-1 items-center">
          {Array.from({ length: hints.length }, (_, i) => (
            <span className="w-7 h-3 rounded-full inline-block" key={i}>
              _
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        {hints.basestat != null && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            Base Stat: <strong>{hints.basestat}</strong>
          </span>
        )}
        {hints.type != null &&
          hints.type.map((type, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded capitalize font-semibold text-xs"
              style={{
                backgroundColor: typeStyles[type.toLowerCase()]?.bgColor,
                color: typeStyles[type.toLowerCase()]?.color,
              }}
            >
              {type}
            </span>
          ))}
      </div>
    </div>
  );
};

export default HintSection;
