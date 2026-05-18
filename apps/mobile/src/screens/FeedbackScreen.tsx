import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'Feedback'>;
};

export default function FeedbackScreen({ navigation }: Props) {
  const [rating, setRating] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>User Feedback</Text>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How was your experience?</Text>
          <Text style={styles.cardSubtitle}>Your feedback helps us improve our services for you and your pets.</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <FontAwesome5
                  name="star"
                  solid={star <= rating}
                  size={32}
                  color={star <= rating ? '#fbbf24' : '#e2e8f0'}
                  style={{ marginHorizontal: 5 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>What category does this fall under?</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}><Text style={styles.chipTextActive}>Clinic Visit</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>App Issue</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Suggestion</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Products</Text></TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Tell us more about it</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Please share any details that could help us..."
            placeholderTextColor="#a0aec0"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  mainScroll: { flex: 1, padding: 15 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  cardTitle: { fontSize: 18, fontFamily: 'Catcut', color: '#2d3748', textAlign: 'center', marginBottom: 8 },
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
