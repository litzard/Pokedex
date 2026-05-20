import { Pokemon, PokemonDetail, PokemonListResponse, PokemonTypeListResponse, PokemonType } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (limit: number = 20): Promise<Pokemon[]> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=0`);
  const data: PokemonListResponse = await response.json();

  const pokemonPromises = data.results.map(async (pokemon) => {
    const detailResponse = await fetch(pokemon.url);
    return await detailResponse.json() as Pokemon;
  });

  const pokemonList = await Promise.all(pokemonPromises);
  return pokemonList;
};

export const getPokemonById = async (id: number): Promise<PokemonDetail> => {
  const response = await fetch(`${BASE_URL}/pokemon/${id}`);
  if (!response.ok) {
    throw new Error('Pokemon not found');
  }
  return await response.json() as PokemonDetail;
};

export const getPokemonByName = async (name: string): Promise<PokemonDetail> => {
  const response = await fetch(`${BASE_URL}/pokemon/${name.toLowerCase()}`);
  if (!response.ok) {
    throw new Error('Pokemon not found');
  }
  return await response.json() as PokemonDetail;
};

export const getPokemonTypes = async (): Promise<PokemonTypeListResponse> => {
  const response = await fetch(`${BASE_URL}/type`);
  return await response.json() as PokemonTypeListResponse;
};

export const getPokemonByType = async (type: string): Promise<Pokemon[]> => {
  const response = await fetch(`${BASE_URL}/type/${type.toLowerCase()}`);
  const data = await response.json() as { pokemon: { pokemon: { url: string } }[] };
  
  const pokemonPromises = data.pokemon.slice(0, 30).map(async (item) => {
    const detailResponse = await fetch(item.pokemon.url);
    return await detailResponse.json() as Pokemon;
  });

  return await Promise.all(pokemonPromises);
};

export const searchPokemon = async (query: string): Promise<Pokemon[]> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=100`);
  const data: PokemonListResponse = await response.json();
  
  const filteredResults = data.results.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  
  const pokemonPromises = filteredResults.slice(0, 20).map(async (pokemon) => {
    const detailResponse = await fetch(pokemon.url);
    return await detailResponse.json() as Pokemon;
  });

  return await Promise.all(pokemonPromises);
};