import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, Modal, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MoreStackParamList } from '../../App';
import { API_URL } from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import GuestRestriction from '../components/GuestRestriction';
import { promptGuestAuth } from '../utils/auth';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'Tutorials'>;
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Dog Training':
      return { icon: 'dog', bg: '#feebc8', color: '#dd6b20' };
    case 'Cat Care':
      return { icon: 'cat', bg: '#c6f6d5', color: '#38a169' };
    case 'Grooming':
      return { icon: 'spa', bg: '#e9d8fd', color: '#805ad5' };
    case 'Health & Diet':
      return { icon: 'bone', bg: '#fed7d7', color: '#e53e3e' };
    default:
      return { icon: 'video', bg: '#bee3f8', color: '#3182ce' };
  }
};

// Paused video thumbnail preview component
const VideoThumbnail = ({ uri, categoryStyle }: { uri: string; categoryStyle: any }) => {
  try {
    const player = useVideoPlayer(uri);
    return (
      <VideoView
        style={StyleSheet.absoluteFillObject}
        player={player}
        nativeControls={false}
      />
    );
  } catch (e) {
    return (
      <FontAwesome5 
        name={categoryStyle.icon} 
        size={32} 
        color={categoryStyle.color} 
        style={{ opacity: 0.5 }} 
      />
    );
  }
};

// Inline watch video player component
const ActiveWatchPlayer = ({ uri }: { uri: string }) => {
  try {
    const player = useVideoPlayer(uri, p => {
      p.play();
    });
    return (
      <VideoView
        style={styles.inlineVideo}
        player={player}
      />
    );
  } catch (e) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <FontAwesome5 name="exclamation-circle" size={40} color="#fc8181" style={{ marginBottom: 10 }} />
        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Montserrat-Medium' }}>Unable to load video player.</Text>
      </View>
    );
  }
};

export default function TutorialsScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();

  const { t, language } = useLanguage();
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Dog Training', 'Cat Care', 'Grooming', 'Health & Diet']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Play video states
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTutorials();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tutorials`);
      const data = await res.json();
      if (data.success) {
        setTutorials(data.tutorials);
        const uniqueCats = Array.from(new Set(data.tutorials.map((t: any) => t.category).filter(Boolean)));
        const merged = ['All', ...Array.from(new Set(['Dog Training', 'Cat Care', 'Grooming', 'Health & Diet', ...uniqueCats]))];
        setCategories(merged as string[]);
      } else {
        Alert.alert('Error', data.error || 'Failed to load tutorials');
      }
    } catch (err: any) {
      console.error('Fetch tutorials error:', err);
      Alert.alert('Network Error', 'Could not connect to database tutorials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const filteredTutorials = activeCategory === 'All' 
    ? tutorials 
    : tutorials.filter(t => t.category === activeCategory);

  const handlePlayVideo = (tutorial: any) => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth(navigation, language);
      return;
    }
    setSelectedVideo(tutorial);
    setIsPlayModalOpen(true);
  };

  const closePlayModal = () => {
    setIsPlayModalOpen(false);
    setSelectedVideo(null);
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('petTutorials')}</Text>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Categories */}
        <View style={[styles.categoryContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map(cat => {
              let localizedCat = cat;
              if (cat === 'All') localizedCat = language === 'en' ? 'All' : 'Lahat';
              else if (cat === 'Dog Training') localizedCat = language === 'en' ? 'Dog Training' : 'Pagsasanay sa Aso';
              else if (cat === 'Cat Care') localizedCat = language === 'en' ? 'Cat Care' : 'Pag-aalaga ng Pusa';
              else if (cat === 'Grooming') localizedCat = t('grooming');
              else if (cat === 'Health & Diet') localizedCat = language === 'en' ? 'Health & Diet' : 'Kalusugan at Pagkain';

              return (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.categoryBtn, { backgroundColor: isDarkMode ? '#2d2d2d' : '#F4F1EC' }, activeCategory === cat && styles.categoryBtnActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.categoryText, { color: theme.subtext }, activeCategory === cat && styles.categoryTextActive]}>{localizedCat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Video List */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2D5016" />
            <Text style={styles.loaderText}>{t('loadingTutorials')}</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.tutorialsList} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2D5016']} />
            }
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {activeCategory === 'All' ? (language === 'en' ? 'All' : 'Lahat') : activeCategory} {t('tutorialsCount')} ({filteredTutorials.length})
            </Text>
            
            {filteredTutorials.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="video-slash" size={40} color="#a0aec0" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyText}>
                  {language === 'en' ? 'No tutorial videos found in this category.' : 'Walang nahanap na tutorial video sa kategoryang ito.'}
                </Text>
              </View>
            ) : (
              filteredTutorials.map(tutorial => {
                const styleHelper = getCategoryStyle(tutorial.category || 'Other');
                const videoUrl = tutorial.videoLink.startsWith('http') ? tutorial.videoLink : `${API_URL}${tutorial.videoLink}`;

                return (
                  <TouchableOpacity 
                    key={tutorial.id} 
                    style={[styles.videoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => handlePlayVideo(tutorial)}
                  >
                    <View style={[styles.videoThumbnail, { backgroundColor: styleHelper.bg }]}>
                      <FontAwesome5 name={styleHelper.icon} size={32} color={styleHelper.color} style={{ opacity: 0.5, position: 'absolute' }} />
                      <VideoThumbnail uri={videoUrl} categoryStyle={styleHelper} />
                      <View style={styles.playIconContainer}>
                        <FontAwesome5 name="play" size={16} color="white" />
                      </View>
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{language === 'en' ? 'Watch' : 'Panoorin'}</Text>
                      </View>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>{tutorial.title}</Text>
                      {tutorial.description ? (
                        <Text style={[styles.videoDesc, { color: theme.subtext }]} numberOfLines={2}>{tutorial.description}</Text>
                      ) : null}
                      <Text style={styles.videoCategory}>{tutorial.category || 'Other'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>

      {/* Watch Video Modal */}
      <Modal
        visible={isPlayModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closePlayModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                {selectedVideo?.title}
              </Text>
              <TouchableOpacity onPress={closePlayModal} style={styles.modalCloseBtn}>
                <FontAwesome5 name="times" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.videoPlayerContainer}>
              {selectedVideo && (
                <ActiveWatchPlayer 
                  uri={selectedVideo.videoLink.startsWith('http') 
                    ? selectedVideo.videoLink 
                    : `${API_URL}${selectedVideo.videoLink}`} 
                />
              )}
            </View>

            <ScrollView style={styles.videoDetailsContainer}>
              <View style={styles.badgeRow}>
                <Text style={[styles.detailCategory, { color: isDarkMode ? '#C6F6D5' : '#2D5016', backgroundColor: isDarkMode ? 'rgba(45,80,22,0.3)' : 'rgba(45,80,22,0.1)' }]}>{selectedVideo?.category || 'Other'}</Text>
              </View>
              <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedVideo?.title}</Text>
              <Text style={[styles.detailDesc, { color: theme.subtext }]}>
                {selectedVideo?.description || 'No description provided for this tutorial.'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { height } = Dimensions.get('window');

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
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#000',
  },
  playIconContainer: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
    zIndex: 10,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  durationText: { color: 'white', fontSize: 12, fontFamily: 'Montserrat-SemiBold' },
  
  videoInfo: { padding: 15 },
  videoTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2d3748', marginBottom: 4, lineHeight: 22 },
  videoDesc: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-Medium', marginBottom: 6, lineHeight: 18 },
  videoCategory: { fontSize: 12, color: '#2D5016', fontFamily: 'Montserrat-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loaderText: { marginTop: 10, color: '#718096', fontSize: 15, fontFamily: 'Montserrat-Medium' },

  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#a0aec0', fontSize: 14, fontFamily: 'Montserrat-Medium', textAlign: 'center' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F4F1EC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#2d3748',
    flex: 1,
    marginRight: 10,
  },
  modalCloseBtn: {
    padding: 5,
  },
  videoPlayerContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineVideo: {
    width: '100%',
    height: '100%',
  },
  videoDetailsContainer: {
    flex: 1,
    padding: 20,
  },
  badgeRow: {
    marginBottom: 10,
  },
  detailCategory: {
    fontSize: 11,
    color: '#2D5016',
    backgroundColor: 'rgba(45,80,22,0.1)',
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  detailTitle: {
    fontSize: 20,
    fontFamily: 'Catcut',
    color: '#2d3748',
    marginBottom: 12,
    lineHeight: 28,
  },
  detailDesc: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#4a5568',
    lineHeight: 22,
  },
});
