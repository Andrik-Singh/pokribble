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

// Hyphenated names that ARE canonical base forms (not formes)
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
  if (name.includes("-")) return false; // blocks zygarde-50, rotom-wash, etc.
  return true;
}

export async function getRandomPokemon(generation?: number) {
  if (generation !== undefined && !GEN_RANGES[generation]) {
    console.error("The genratoin is either undefined or not in range");
    return;
  }
  const [min, max] = generation ? GEN_RANGES[generation] : [1, 1025];

  for (let attempt = 0; attempt < 20; attempt++) {
    const id = Math.floor(Math.random() * (max - min + 1)) + min;
    let data;
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      data = await res.json();
    } catch (error) {
      console.error(error);
      continue;
    }

    if (!isBaseForm(data.name)) continue;
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
