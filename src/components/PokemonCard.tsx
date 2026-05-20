import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Pokemon } from '../types/pokemon';

interface Props {
  pokemon: Pokemon;
  onPress: (pokemonId: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (pokemonId: number) => void;
}

const PokemonCard: React.FC<Props> = ({ pokemon, onPress, isFavorite, onToggleFavorite }) => {
  const getPokemonId = () => `#${pokemon.id.toString().padStart(3, '0')}`;
  
  const getPokemonImage = () => {
    return pokemon.sprites.other['official-artwork'].front_default 
      || pokemon.sprites.front_default;
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
    return pokemon.types[0]?.type.name || 'normal';
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: getTypeColor(getPrimaryType()) + '30' }]}
      onPress={() => onPress(pokemon.id)}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(pokemon.id)}
      >
        <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <Image
        source={{ uri: getPokemonImage() }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.id}>{getPokemonId()}</Text>
      <Text style={styles.name}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
      <View style={styles.typesContainer}>
        {pokemon.types.map((type) => (
          <View key={type.slot} style={[styles.typeBadge, { backgroundColor: getTypeColor(type.type.name) }]}>
            <Text style={styles.typeText}>{type.type.name}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 180,
  },
  favoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    zIndex: 1,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
  id: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default PokemonCard;