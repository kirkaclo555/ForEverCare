import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'Tutorials'>;
};

const CATEGORIES = ['All', 'Dog Training', 'Cat Care', 'Grooming', 'Health & Diet'];

const TUTORIALS = [
  { id: '1', title: 'Basic Obedience Training for Puppies', duration: '12:45', category: 'Dog Training', icon: 'dog', bg: '#feebc8', color: '#dd6b20' },
  { id: '2', title: 'How to Properly Trim Cat Claws', duration: '5:30', category: 'Grooming', icon: 'cat', bg: '#e9d8fd', color: '#805ad5' },
  { id: '3', title: 'Understanding Feline Body Language', duration: '8:20', category: 'Cat Care', icon: 'cat', bg: '#c6f6d5', color: '#38a169' },
  { id: '4', title: 'DIY Dog Grooming at Home', duration: '15:10', category: 'Grooming', icon: 'dog', bg: '#bee3f8', color: '#3182ce' },
  { id: '5', title: 'Best Diet Practices for Senior Dogs', duration: '10:05', category: 'Health & Diet', icon: 'bone', bg: '#fed7d7', color: '#e53e3e' },
  { id: '6', title: 'Litter Box Training Essentials', duration: '7:55', category: 'Cat Care', icon: 'cat', bg: '#feebc8', color: '#dd6b20' },
];

export default function TutorialsScreen({ navigation }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTutorials = activeCategory === 'All' 
    ? TUTORIALS 
    : TUTORIALS.filter(t => t.category === activeCategory);

  const handlePlayVideo = (title: string) => {
    Alert.alert('Play Video', `Starting tutorial: "${title}"\n(Video Player Integration Coming Soon)`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Tutorials</Text>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Categories */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Video List */}
        <ScrollView style={styles.tutorialsList} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{activeCategory} Tutorials ({filteredTutorials.length})</Text>
          
          {filteredTutorials.map(tutorial => (
            <TouchableOpacity 
              key={tutorial.id} 
              style={styles.videoCard}
              onPress={() => handlePlayVideo(tutorial.title)}
            >
              <View style={[styles.videoThumbnail, { backgroundColor: tutorial.bg }]}>
                <FontAwesome5 name={tutorial.icon} size={32} color={tutorial.color} style={{ opacity: 0.8 }} />
                <View style={styles.playIconContainer}>
                  <FontAwesome5 name="play" size={16} color="white" />
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{tutorial.duration}</Text>
                </View>
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{tutorial.title}</Text>
                <Text style={styles.videoCategory}>{tutorial.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F1EC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  mainContainer: { flex: 1 },
  
  categoryContainer: {
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  categoryScroll: { paddingHorizontal: 20, gap: 10 },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F1EC',
  },
  categoryBtnActive: { backgroundColor: '#2D5016' },
  categoryText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#4a5568' },
  categoryTextActive: { color: '#fff' },

  tutorialsList: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Catcut', color: '#2d3748', marginBottom: 15 },
  
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  videoThumbnail: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playIconContainer: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4, // visually center the play icon
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: { color: 'white', fontSize: 12, fontFamily: 'Montserrat-SemiBold' },
  
  videoInfo: { padding: 15 },
  videoTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2d3748', marginBottom: 4, lineHeight: 22 },
  videoCategory: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-Medium' },
});
