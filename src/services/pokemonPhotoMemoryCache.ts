const pokemonPhotoMemoryCache = new Map<number, string>();

export function setCachedPokemonPhoto(pokemonId: number, photoUri: string) {
  pokemonPhotoMemoryCache.set(pokemonId, photoUri);
}

export function getCachedPokemonPhoto(pokemonId: number) {
  return pokemonPhotoMemoryCache.get(pokemonId) ?? null;
}

export function clearCachedPokemonPhoto(pokemonId: number) {
  pokemonPhotoMemoryCache.delete(pokemonId);
}
