import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@pokedex_favorites';

export const getFavorites = async (): Promise<number[]> => {
  try {
    const value = await AsyncStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addFavorite = async (pokemonId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(pokemonId)) {
      favorites.push(pokemonId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

export const removeFavorite = async (pokemonId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter(id => id !== pokemonId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

export const isFavorite = async (pokemonId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(pokemonId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const toggleFavorite = async (pokemonId: number): Promise<boolean> => {
  const favorites = await getFavorites();
  if (favorites.includes(pokemonId)) {
    return removeFavorite(pokemonId);
  } else {
    return addFavorite(pokemonId);
  }
};