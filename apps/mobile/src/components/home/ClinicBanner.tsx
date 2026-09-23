import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isLoading?: boolean;
  clinicPhone?: string;
  clinicMapUrl?: string;
  hoursText?: string;
  isOpenToday?: boolean;
};

export default function ClinicBanner({
  isLoading = false,
  clinicPhone = '09123456789',
  clinicMapUrl = 'https://maps.google.com/?q=FurEverCare+Balingasag+Misamis+Oriental',
  hoursText = 'Open today, 8:00 AM to 5:00 PM',
  isOpenToday = true,
}: Props) {
  const screenWidth = Dimensions.get('window').width;
  // Card has 16px padding on outer scrollview, so content width inside card is:
  const bannerWidth = screenWidth - 32;

  const carouselRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselItems = [
    { img: require('../../../assets/balingasag.jpg'), text: 'Balingasag Dog and Cat Clinic' },
    { img: require('../../../assets/balingasag2.jpg'), text: 'Expert Care for Your Furry Friends' },
    { img: require('../../../assets/balingasag3.jpg'), text: "Your Pet's Second Home" },
    { img: require('../../../assets/balingasag4.jpg'), text: 'Professional Veterinary Services' },
  ];

  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev === carouselItems.length - 1 ? 0 : prev + 1;
        if (carouselRef.current) {
          carouselRef.current.scrollTo({
            x: next * bannerWidth,
            animated: true,
          });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerWidth, isLoading]);

  const handleCall = () => {
    const cleanPhone = clinicPhone.replace(/\D/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch((err) =>
      console.warn('Could not open dialer:', err)
    );
  };

  const handleMap = () => {
    Linking.openURL(clinicMapUrl).catch((err) =>
      console.warn('Could not open map:', err)
    );
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeletonPhoto}>
          <ActivityIndicator size="small" color="#35501F" />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.skeletonLine} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* 96-116px Photo Area with Gradient and Overlaid Clinic Name */}
      <View style={styles.photoContainer}>
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ width: bannerWidth }}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / bannerWidth
            );
            setCurrentIndex(newIndex);
          }}
        >
          {carouselItems.map((item, index) => (
            <View key={index} style={{ width: bannerWidth, height: 110 }}>
              <Image source={item.img} style={styles.bannerImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.72)']}
                style={styles.gradientOverlay}
              >
                <Text style={styles.clinicNameText} numberOfLines={1}>
                  {item.text}
                </Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Info Row: Status Dot + Hours on top, Action Buttons below */}
      <View style={styles.infoRow}>
        <View style={styles.statusGroup}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOpenToday ? '#10B981' : '#EF4444' },
            ]}
          />
          <Text style={styles.hoursText} numberOfLines={1}>
            {hoursText}
          </Text>
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.75}
            onPress={handleCall}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Ionicons name="call-outline" size={13} color="#35501F" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.75}
            onPress={handleMap}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Ionicons name="location-outline" size={13} color="#35501F" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnText}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  photoContainer: {
    height: 110,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 52,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  clinicNameText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    overflow: 'hidden',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  hoursText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#374151',
    flex: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C2E0A3',
    backgroundColor: '#F7FAF3',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 10,
    minHeight: 26,
  },
  actionBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#35501F',
  },
  skeletonPhoto: {
    height: 110,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    width: '60%',
  },
});
