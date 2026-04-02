import { getData, pokemonKey } from "../redis.js";

export async function getPokemonHint(pokemonId?: number): Promise<{
  type: string[];
  length: number;
  totalBaseStat: number;
} | null> {
  if (!pokemonId) return null;
  try {
    const cachedData: {
      types: string[];
      length: number;
      totalBaseStat: number;
    } | null = await getData(`${pokemonKey}${pokemonId}`);
    if (cachedData) {
      return {
        type: cachedData.types,
        length: cachedData.length,
        totalBaseStat: cachedData.totalBaseStat,
      };
    }
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    if (!res.ok) {
      throw new Error(`PokeAPI request failed with status ${res.status}`);
    }
    const data = await res.json();
    const type = data.types.map((t: { type: { name: string } }) => t.type.name);
    const totalBaseStat = data.stats.reduce(
      (acc: number, stat: any) => acc + stat.base_stat,
      0,
    );
    return {
      type,
      length: data.name.length,
      totalBaseStat,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
