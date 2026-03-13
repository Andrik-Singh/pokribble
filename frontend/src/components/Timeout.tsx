export type TimeoutProps = {
  pokemon: { name: string; image: string };
  drawer: string;
};

const Timeout = ({ pokemon, drawer }: TimeoutProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900 text-white rounded-xl shadow-2xl space-y-4">
      <h2 className="text-3xl font-bold text-red-500">Time's Up!</h2>
      <p className="text-xl">
        The player was{" "}
        <span className="font-bold text-yellow-400">{drawer}</span>.
      </p>
      <div className="mt-4">
        <p className="text-lg mb-2">The Pokémon was:</p>
        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="w-48 h-48 mx-auto drop-shadow-md"
        />
        <h3 className="text-2xl font-bold text-blue-400 mt-2 capitalize">
          {pokemon.name}
        </h3>
      </div>
    </div>
  );
};

export default Timeout;
