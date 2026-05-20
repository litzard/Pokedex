import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, 
  TextInput, TouchableOpacity, ScrollView, Alert 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PokemonCard from '../components/PokemonCard';
import { getPokemonList, getPokemonTypes, searchPokemon, getPokemonByType } from '../services/pokemonService';
import { getFavorites, toggleFavorite } from '../storage/favoriteStorage';
import { Pokemon, PokemonTypeListResponse } from '../types/pokemon';

type RootStackParamList = {
  Home: undefined;
  Detail: { pokemonId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [types, setTypes] = useState<PokemonTypeListResponse | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pokemonData, typesData, favData] = await Promise.all([
        getPokemonList(30),
        getPokemonTypes(),
        getFavorites()
      ]);
      
      setAllPokemon(pokemonData);
      setPokemonList(pokemonData);
      setTypes(typesData);
      setFavorites(favData);
    } catch (err) {
      setError('Error al cargar los datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setPokemonList(allPokemon);
      return;
    }
    
    try {
      setLoading(true);
      const results = await searchPokemon(query);
      setPokemonList(results);
    } catch (err) {
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = async (type: string | null) => {
    setSelectedType(type);
    setShowFavoritesOnly(false);
    
    if (!type) {
      setPokemonList(allPokemon);
      return;
    }
    
    try {
      setLoading(true);
      const results = await getPokemonByType(type);
      setPokemonList(results);
    } catch (err) {
      setError('Error al filtrar por tipo');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (pokemonId: number) => {
    const success = await toggleFavorite(pokemonId);
    if (success) {
      const updatedFavorites = await getFavorites();
      setFavorites(updatedFavorites);
    }
  };

  const toggleShowFavorites = async () => {
    const newValue = !showFavoritesOnly;
    setShowFavoritesOnly(newValue);
    
    if (newValue) {
      const favPokemon = allPokemon.filter(p => favorites.includes(p.id));
      setPokemonList(favPokemon);
    } else {
      if (selectedType) {
        handleTypeFilter(selectedType);
      } else {
        setPokemonList(allPokemon);
      }
    }
  };

  const handlePokemonPress = (pokemonId: number) => {
    navigation.navigate('Detail', { pokemonId });
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      fire: '#F08030', water: '#6890F0', grass: '#78C850',
      electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028',
      poison: '#A040A0', ground: '#E0C068', flying: '#A890F0',
      psychic: '#F85888', bug: '#A8B820', rock: '#B8A038',
      ghost: '#705898', dragon: '#7038F8', steel: '#B8B8D0',
      fairy: '#EE99AC', normal: '#A8A878',
    };
    return colors[type] || '#A8A878';
  };

  if (loading && pokemonList.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Cargando Pokémon...</Text>
      </View>
    );
  }

  if (error && pokemonList.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Pokémon..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, showFavoritesOnly && styles.filterChipActive]}
            onPress={toggleShowFavorites}
          >
            <Text style={[styles.filterChipText, showFavoritesOnly && styles.filterChipTextActive]}>
              {showFavoritesOnly ? '❤️ Favoritos' : '🤍 Favoritos'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, !selectedType && !showFavoritesOnly && styles.filterChipActive]}
            onPress={() => handleTypeFilter(null)}
          >
            <Text style={[styles.filterChipText, !selectedType && !showFavoritesOnly && styles.filterChipTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          {types?.results.map((type) => (
            <TouchableOpacity
              key={type.name}
              style={[
                styles.filterChip,
                { backgroundColor: getTypeColor(type.name) + '30' },
                selectedType === type.name && { borderColor: getTypeColor(type.name), borderWidth: 2 }
              ]}
              onPress={() => handleTypeFilter(type.name)}
            >
              <Text style={[styles.filterChipText, { color: getTypeColor(type.name) }]}>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {pokemonList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron Pokémon</Text>
          <Text style={styles.emptySubtext}>
            {showFavoritesOnly ? 'Agrega favoritos para verlos aquí' : 'Intenta con otros términos de búsqueda'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pokemonList}
          renderItem={({ item }) => (
            <PokemonCard 
              pokemon={item} 
              onPress={handlePokemonPress}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF0000',
    marginBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#FF0000',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;