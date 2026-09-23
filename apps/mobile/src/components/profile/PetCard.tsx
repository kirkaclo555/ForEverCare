import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PetItem = {
  id: string;
  name: string;
  breed?: string;
  age?: string;
  species?: string;
  avatar?: string;
};

type Props = {
  pets: PetItem[];
  onPressPet: (pet: PetItem) => void;
  onPressAddPet: () => void;
};

export function SinglePetCard({
  pet,
  onPress,
}: {
  pet: PetItem;
  onPress: () => void;
}) {
  const isDog = (pet.species || '').toLowerCase() === 'dog';

  return (
    <TouchableOpacity style={styles.petCard} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.petAvatarWrapper}>
        {pet.avatar && (pet.avatar.startsWith('http') || pet.avatar.startsWith('data:')) ? (
          <Image source={{ uri: pet.avatar }} style={styles.petImage} />
        ) : (
          <View style={[styles.petIconFallback, { backgroundColor: isDog ? '#EBF8FF' : '#FEF3C7' }]}>
            <Ionicons
              name={isDog ? 'paw' : 'paw'}
              size={22}
              color={isDog ? '#3182CE' : '#D97706'}
            />
          </View>
        )}
      </View>

      <Text style={styles.petName} numberOfLines={1}>
        {pet.name}
      </Text>
      <Text style={styles.petDetails} numberOfLines={1}>
        {pet.breed || pet.species || 'Pet'}
      </Text>
      {Boolean(pet.age) && (
        <Text style={styles.petAge} numberOfLines={1}>
          {pet.age}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function AddPetCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.addPetCard} activeOpacity={0.75} onPress={onPress}>
      <View style={styles.addIconCircle}>
        <Ionicons name="add" size={24} color="#35501F" />
      </View>
      <Text style={styles.addPetText}>Add pet</Text>
    </TouchableOpacity>
  );
}

export default function PetCardList({ pets, onPressPet, onPressAddPet }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {pets.map((pet) => (
        <SinglePetCard key={pet.id} pet={pet} onPress={() => onPressPet(pet)} />
      ))}
      <AddPetCard onPress={onPressAddPet} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  petCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  petAvatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petIconFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  petDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  petAge: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#35501F',
    marginTop: 2,
    textAlign: 'center',
  },
  addPetCard: {
    width: 110,
    height: 126,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#35501F',
    backgroundColor: 'rgba(53, 80, 31, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addPetText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
});
