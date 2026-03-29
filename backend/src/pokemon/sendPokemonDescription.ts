import { getData, pokemonKey, redisClient, setData } from "../redis.js";

const GEN_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};
const ALLOWED_HYPHENATED = new Set([
  "mr-mime",
  "mime-jr",
  "type-null",
  "porygon-z",
  "porygon2",
  "ho-oh",
  "jangmo-o",
  "hakamo-o",
  "kommo-o",
  "tapu-koko",
  "tapu-lele",
  "tapu-bulu",
  "tapu-fini",
  "mr-rime",
  "chi-yu",
  "wo-chien",
  "chien-pao",
  "ting-lu",
  "great-tusk",
  "scream-tail",
  "brute-bonnet",
  "flutter-mane",
  "slither-wing",
  "sandy-shocks",
  "iron-treads",
  "iron-bundle",
  "iron-hands",
  "iron-jugulis",
  "iron-moth",
  "iron-thorns",
  "roaring-moon",
  "iron-valiant",
  "walking-wake",
  "iron-leaves",
  "gouging-fire",
  "raging-bolt",
  "iron-boulder",
  "iron-crown",
]);

function isBaseForm(name: string): boolean {
  if (ALLOWED_HYPHENATED.has(name)) return true;
  if (name.includes("-")) return false;
  return true;
}

export async function getRandomPokemon(generation?: number) {
  if (generation !== undefined && !GEN_RANGES[generation]) {
    console.error("Invalid generation: must be between 1 and 9");
    return;
  }
  const [min, max] = generation ? GEN_RANGES[generation] : [1, 1025];

  for (let attempt = 0; attempt < 20; attempt++) {
    const id = Math.floor(Math.random() * (max - min + 1)) + min;
    const cachedData: {
      name: string;
      image: string;
      id: number;
      types: string[];
      length: number;
    } | null = await getData(`${pokemonKey}${id}`);
    if (cachedData) {
      return {
        name: cachedData.name,
        image: cachedData.image,
        id: cachedData.id,
      };
    }
    let data;
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) {
        console.error("PokeAPI request failed with status", res.status);
        continue;
      }
      data = await res.json();
    } catch (error) {
      console.error(error);
      continue;
    }

    if (!isBaseForm(data.name)) continue;
    const totalBaseStat = data.stats.reduce(
      (acc: number, stat: any) => acc + stat.base_stat,
      0,
    );
    setData(
      `${pokemonKey}${id}`,
      JSON.stringify({
        name: data.name.replace("-", ""),
        image:
          data.sprites.other["official-artwork"]?.front_default ??
          data.sprites.front_default,
        id: data.id,
        types: data.types.map((type: any) => type.type.name),
        length: data.name.length,
        totalBaseStat,
      }),
    );
    return {
      name: data.name.replace("-", ""),
      image:
        data.sprites.other["official-artwork"]?.front_default ??
        data.sprites.front_default,
      id: data.id,
    };
  }

  throw new Error("Could not find a valid base-form Pokémon after 20 attempts");
}
