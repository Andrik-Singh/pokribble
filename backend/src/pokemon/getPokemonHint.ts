export async function getPokemonHint(
  pokemonId?: number,
): Promise<string | null> {
  if (!pokemonId) return null;
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`,
    );
    const data = await res.json();
    return data.flavor_text_entries[0].flavor_text;
  } catch (err) {
    console.error(err);
    return null;
  }
}
