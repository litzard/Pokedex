import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getPokemonById } from '../services/pokemonService';
import { PokemonDetail } from '../types/pokemon';

type RootStackParamList = {
  Home: undefined;
  Detail: { pokemonId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId } = route.params;
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPokemonDetail();
  }, [pokemonId]);

  const loadPokemonDetail = async () => {
    try {
      const data = await getPokemonById(pokemonId);
      setPokemon(data);
    } catch (error) {
      console.error('Error loading pokemon detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
      normal: '#A8A878',
    };
    return colors[type] || '#A8A878';
  };

  const getPrimaryType = (): string => {
    return pokemon?.types[0]?.type.name || 'normal';
  };

  const getPokemonImage = (): string => {
    if (!pokemon) return '';
    return pokemon.sprites.other['official-artwork'].front_default 
      || pokemon.sprites.front_default;
  };

  const getStatColor = (value: number): string => {
    if (value >= 100) return '#FF0000';
    if (value >= 80) return '#FF8C00';
    if (value >= 60) return '#FFD700';
    if (value >= 40) return '#90EE90';
    return '#87CEEB';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: getTypeColor(getPrimaryType()) + '20' }]}>
        <ActivityIndicator size="large" color={getTypeColor(getPrimaryType())} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar el Pokémon</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const typeColor = getTypeColor(getPrimaryType());

  return (
    <ScrollView style={[styles.container, { backgroundColor: typeColor + '20' }]}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.pokemonId}>#{pokemon.id.toString().padStart(3, '0')}</Text>
        <Text style={styles.pokemonName}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map((type) => (
            <View key={type.slot} style={[styles.typeBadge, { backgroundColor: getTypeColor(type.type.name) }]}>
              <Text style={styles.typeText}>{type.type.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: getPokemonImage() }} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Altura</Text>
            <Text style={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades</Text>
        <View style={styles.abilitiesContainer}>
          {pokemon.abilities.map((ability, index) => (
            <View key={index} style={[styles.abilityBadge, { backgroundColor: typeColor + '40' }]}>
              <Text style={styles.abilityText}>
                {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                {ability.is_hidden ? ' (Oculta)' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas Base</Text>
        {pokemon.stats.map((stat, index) => (
          <View key={index} style={styles.statRow}>
            <Text style={styles.statName}>{stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1)}</Text>
            <View style={styles.statBarContainer}>
              <View style={[styles.statBar, { width: `${Math.min(stat.base_stat, 100)}%`, backgroundColor: getStatColor(stat.base_stat) }]} />
            </View>
            <Text style={styles.statValue}>{stat.base_stat}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalStats}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  backButtonContainer: {
    padding: 16,
    paddingTop: 50,
  },
  backArrow: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pokemonId: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 250,
    height: 250,
  },
  infoSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 40,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  abilityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statName: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  statBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  totalStats: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  backButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default DetailScreen;