import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../App';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

import GuestRestriction from '../components/GuestRestriction';
import GuestAuthModal from '../components/GuestAuthModal';
import { useGuestAuth } from '../utils/auth';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'Feedback'>;
};

export default function FeedbackScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const { guestModalVisible, promptGuestAuth, closeGuestModal } = useGuestAuth();

  const { t, language } = useLanguage();
  
  // Tabs: 'give' or 'my'
  const [activeTab, setActiveTab] = useState<'give' | 'my'>('give');

  // Submit/Edit State
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('Clinic Visit');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  // My Feedbacks State
  const [myFeedbacks, setMyFeedbacks] = useState<any[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ["Clinic Visit", "App Issue", "Suggestion", "Products", "Other"];

  const fetchMyFeedbacks = async () => {
    if (!user?.id) return;
    setIsLoadingFeedbacks(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Failed to load my feedbacks:', error);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyFeedbacks();
    }
  }, [activeTab, user?.id]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'my') {
      await fetchMyFeedbacks();
    } else {
      setTimeout(() => {
        setRating(0);
        setComments('');
        setCategory('Clinic Visit');
        setErrorMessage(null);
      }, 50);
    }
    setRefreshing(false);
  }, [activeTab]);

  const parseFeedback = (rawComments: string) => {
    let cat = "Other";
    let comment = rawComments || "";
    if (comment.startsWith("[")) {
      const endIdx = comment.indexOf("]");
      if (endIdx > -1) {
        cat = comment.substring(1, endIdx);
        comment = comment.substring(endIdx + 1).trim();
      }
    }
    return { category: cat, comment };
  };

  const handleEditClick = (feedback: any) => {
    const parsed = parseFeedback(feedback.comments);
    setRating(feedback.rating);
    setCategory(parsed.category || 'Other');
    setComments(parsed.comment);
    setEditingFeedbackId(feedback.id);
    setIsEditMode(true);
    setActiveTab('give'); // switch to give tab to edit
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingFeedbackId(null);
    setRating(0);
    setComments('');
    setCategory('Clinic Visit');
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth();
      return;
    }
    if (rating === 0) {
      setErrorMessage("Please select a rating before submitting.");
      return;
    }
    if (!comments.trim()) {
      setErrorMessage("Please write a comment describing your experience.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let res;
      if (isEditMode && editingFeedbackId) {
        res = await fetch(`${API_URL}/api/feedback`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedbackId: editingFeedbackId,
            userId: user.id,
            rating,
            category,
            comments
          })
        });
      } else {
        res = await fetch(`${API_URL}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            rating,
            category,
            comments
          })
        });
      }
      
      const data = await res.json();
      if (data.success) {
        setRating(0);
        setComments('');
        setCategory('Clinic Visit');
        setIsEditMode(false);
        setEditingFeedbackId(null);
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.error || "Failed to submit feedback.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "light-content"} />

      <GuestAuthModal
        visible={guestModalVisible}
        onClose={closeGuestModal}
        onLogin={() => { closeGuestModal(); (navigation as any).navigate('Login'); }}
        onRegister={() => { closeGuestModal(); (navigation as any).navigate('Register'); }}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{t('userFeedback')}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'give' && styles.activeTab]}
          onPress={() => setActiveTab('give')}
        >
          <Text style={[styles.tabText, activeTab === 'give' && styles.activeTabText]}>
            {isEditMode ? 'Edit Feedback' : t('giveFeedback')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => {
            if (isEditMode) cancelEdit();
            setActiveTab('my');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            My Feedbacks
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.mainScroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2D5016']} />
        }
      >
        {activeTab === 'give' ? (
          <>
            {errorMessage && (
              <View style={{ backgroundColor: '#FFF5F5', borderColor: '#FED7D7', borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 15 }}>
                <Text style={{ color: '#C53030', fontSize: 13, fontFamily: 'Montserrat-Medium' }}>{errorMessage}</Text>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {isEditMode && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <Text style={{ fontFamily: 'Montserrat-Bold', color: '#2D5016' }}>Editing Feedback</Text>
                  <TouchableOpacity onPress={cancelEdit}>
                    <Text style={{ color: '#718096', fontFamily: 'Montserrat-Medium', fontSize: 12 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t('howWasExperience')}</Text>
              <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>{t('feedbackDesc')}</Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity 
                    key={star} 
                    onPress={() => {
                      if (!user?.id || user.id.trim() === '') {
                        promptGuestAuth();
                      } else {
                        setRating(star);
                      }
                    }}
                  >
                    <FontAwesome5
                      name="star"
                      solid={star <= rating}
                      size={32}
                      color={star <= rating ? '#fbbf24' : (isDarkMode ? '#4a5568' : '#e2e8f0')}
                      style={{ marginHorizontal: 5 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>{t('categoryLabel') || 'Category'}</Text>
              <View style={styles.chipRow}>
                {categories.map((cat) => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }, category === cat ? styles.chipActive : {}]}
                    onPress={() => {
                      if (!user?.id || user.id.trim() === '') {
                        promptGuestAuth();
                      } else {
                        setCategory(cat);
                      }
                    }}
                  >
                    <Text style={category === cat ? styles.chipTextActive : [styles.chipText, { color: theme.subtext }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: theme.text }]}>{t('tellUsMore') || 'Tell us more'}</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc', borderColor: theme.border, color: theme.text }]}
                placeholder={t('feedbackPlaceholder')}
                placeholderTextColor={theme.subtext}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={comments}
                onChangeText={setComments}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitBtnText}>{isEditMode ? 'Save Changes' : t('submitFeedback')}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </>
        ) : (
          // My Feedbacks Tab
          <View style={{ paddingBottom: 40 }}>
            {!user?.id ? (
              <View style={[styles.card, { backgroundColor: theme.card, alignItems: 'center', paddingVertical: 40 }]}>
                <FontAwesome5 name="user-lock" size={40} color="#CBD5E0" style={{ marginBottom: 15 }} />
                <Text style={{ fontFamily: 'Montserrat-Medium', color: theme.subtext, textAlign: 'center' }}>
                  Please log in to view your feedbacks.
                </Text>
              </View>
            ) : isLoadingFeedbacks && myFeedbacks.length === 0 ? (
              <ActivityIndicator size="large" color="#2D5016" style={{ marginTop: 40 }} />
            ) : myFeedbacks.length === 0 ? (
              <View style={[styles.card, { backgroundColor: theme.card, alignItems: 'center', paddingVertical: 40 }]}>
                <FontAwesome5 name="comment-slash" size={40} color="#CBD5E0" style={{ marginBottom: 15 }} />
                <Text style={{ fontFamily: 'Montserrat-Medium', color: theme.subtext, textAlign: 'center' }}>
                  You haven't submitted any feedback yet.
                </Text>
              </View>
            ) : (
              myFeedbacks.map((item) => {
                const parsed = parseFeedback(item.comments);
                return (
                  <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, padding: 15 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <FontAwesome5 
                            key={star}
                            name="star" 
                            solid={star <= item.rating}
                            color={star <= item.rating ? '#fbbf24' : '#e2e8f0'}
                            size={14}
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </View>
                      <View style={{ backgroundColor: '#EAF3DE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                        <Text style={{ color: '#2D5016', fontSize: 10, fontFamily: 'Montserrat-Bold' }}>{parsed.category}</Text>
                      </View>
                    </View>
                    <Text style={{ color: theme.text, fontFamily: 'Montserrat-Regular', fontSize: 13, lineHeight: 20, marginBottom: 12 }}>
                      {parsed.comment}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 10 }}>
                      <Text style={{ color: theme.subtext, fontSize: 11, fontFamily: 'Montserrat-Regular' }}>
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </Text>
                      <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => handleEditClick(item)}
                      >
                        <FontAwesome5 name="edit" size={12} color="#2D5016" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#2D5016', fontSize: 12, fontFamily: 'Montserrat-SemiBold' }}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Success Notification Modal Overlay */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }} 
        >
          <View style={{ 
            width: '100%',
            maxWidth: 380,
            backgroundColor: theme.card, 
            borderRadius: 20, 
            padding: 25, 
            alignItems: 'center', 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10
          }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <FontAwesome5 name="check" size={26} color="#7CB342" />
            </View>
            <Text style={{ fontSize: 20, fontFamily: 'Montserrat-Bold', color: theme.text, textAlign: 'center', marginBottom: 10 }}>
              {language === 'en' ? 'Success!' : 'Tagumpay!'}
            </Text>
            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: theme.subtext, textAlign: 'center', marginBottom: 22, lineHeight: 20 }}>
              {isEditMode ? 'Feedback updated successfully!' : t('feedbackSuccess')}
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#2D5016', borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center' }}
              onPress={() => {
                setShowSuccessModal(false);
                if (isEditMode) {
                  // Wait for modal to close then fetch
                  setTimeout(() => {
                    setActiveTab('my');
                    fetchMyFeedbacks();
                    setIsEditMode(false);
                    setEditingFeedbackId(null);
                  }, 100);
                } else if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Montserrat-Bold' }}>
                {language === 'en' ? 'Done' : 'Tapos na'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2D5016',
  },
  tabText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#718096',
  },
  activeTabText: {
    color: '#2D5016',
    fontFamily: 'Montserrat-Bold',
  },
  mainScroll: { flex: 1, padding: 15 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  cardTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: '#2d3748', textAlign: 'center', marginBottom: 8 },
  cardSubtitle: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 20, lineHeight: 20, fontFamily: 'Montserrat-Regular' },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  inputLabel: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#4a5568', marginBottom: 10, marginTop: 10 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  chipActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  chipText: { fontSize: 13, color: '#4a5568', fontFamily: 'Montserrat-Medium' },
  chipTextActive: { fontSize: 13, color: 'white', fontFamily: 'Montserrat-Bold' },
  textArea: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#2d3748',
    minHeight: 120,
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
  submitBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
});
