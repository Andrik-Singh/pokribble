import { useEffect } from "react";
import type { OutgoingWebSocketMessage } from "../types";

type ChoosingPokemonProps = {
  pokemon?: string[];
  text?: string;
  sendJsonMessage: (msg: OutgoingWebSocketMessage) => void;
};

const ChoosingPokemon = ({
  pokemon,
  text,
  sendJsonMessage,
}: ChoosingPokemonProps) => {
  const isDrawer = pokemon && pokemon.length > 0;
  useEffect(() => {
    const timeout = setTimeout(() => {
      sendJsonMessage({
        type: "Pokemon_Chosen",
        pokemon: {
          name: pokemon?.[0] ?? "Charmander",
          image: "",
        },
      });
      return () => {
        clearTimeout(timeout);
      };
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);
  if (isDrawer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
          <h1 className="text-2xl font-bold text-indigo-700 mb-2">
            Choose a Pokémon to draw!
          </h1>
          <p className="text-gray-500 mb-6">
            Pick one of the three options below
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            {pokemon.map((name, index) => (
              <button
                key={index}
                onClick={() =>
                  sendJsonMessage({
                    type: "Pokemon_Chosen",
                    pokemon: { name, image: "" },
                  })
                }
                className="bg-linear-to-br from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 capitalize cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          {text || "Waiting..."}
        </h1>
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default ChoosingPokemon;
