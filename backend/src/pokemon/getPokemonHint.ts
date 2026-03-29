import { getData, pokemonKey } from "../redis.js";

export async function getPokemonHint(pokemonId?: number): Promise<{
  type: string[];
  length: number;
  totalBaseStat: number;
} | null> {
  if (!pokemonId) return null;
  try {
    const cachedData: {
      type: string[];
      length: number;
      totalBaseStat: number;
    } | null = await getData(`${pokemonKey}${pokemonId}`);
    if (cachedData) {
      return {
        type: cachedData.type,
        length: cachedData.length,
        totalBaseStat: cachedData.totalBaseStat,
      };
    }
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    if (!res.ok) {
      throw new Error(`PokeAPI request failed with status ${res.status}`);
    }
    const data = await res.json();
    return {
      type: data.types.map((t: { type: { name: string } }) => t.type.name),
      length: data.name.length,
      totalBaseStat: data.stats.reduce(
        (acc: number, stat: any) => acc + stat.base_stat,
        0,
      ),
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
