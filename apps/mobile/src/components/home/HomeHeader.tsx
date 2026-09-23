import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  user: {
    id?: string;
    fullName?: string;
    firstName?: string;
    avatarUri?: string | null;
  };
  unreadCount: number;
  onPressAvatar: () => void;
  onPressBell: () => void;
  language?: string;
};

export default function HomeHeader({
  user,
  unreadCount,
  onPressAvatar,
  onPressBell,
  language = 'en',
}: Props) {
  const isGuest = !user?.id || user.id.trim() === '';

  // Resolve First Name cleanly
  const firstName = user?.firstName
    ? user.firstName
    : user?.fullName
    ? user.fullName.split(' ')[0]
    : 'Pet Parent';

  const getInitials = (name?: string) => {
    if (!name) return 'FP';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'FP';
  };

  const greetingTitle = isGuest
    ? language === 'tl'
      ? 'Mabuhay, Panauhin!'
      : 'Welcome, Guest!'
    : `${language === 'tl' ? 'Mabuhay' : 'Welcome'}, ${firstName}`;

  const greetingSubtitle = isGuest
    ? language === 'tl'
      ? 'Mag-sign in upang i-unlock ang lahat'
      : 'Sign in to unlock all features'
    : language === 'tl'
    ? 'Kamustahin natin ang iyong mga alaga 🐾'
    : "Let's check in on your furry babies 🐾";

  return (
    <View style={styles.headerContainer}>
      {/* Decorative ambient background accents */}
      <View style={styles.ambientBlob1} />
      <View style={styles.ambientBlob2} />

      <View style={styles.contentRow}>
        {/* Left: User Avatar */}
        <TouchableOpacity
          onPress={onPressAvatar}
          activeOpacity={0.8}
          style={styles.avatarTouchable}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isGuest ? (
            <View style={styles.guestAvatar}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
          ) : user?.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Center: Greeting & Subtitle */}
        <View style={styles.greetingContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {greetingTitle}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {greetingSubtitle}
          </Text>
        </View>

        {/* Right: Notification Bell with Red Dot Badge */}
        <TouchableOpacity
          onPress={onPressBell}
          activeOpacity={0.75}
          style={styles.bellButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.bellCircle}>
            <Ionicons name="notifications" size={19} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.redBadgeDot}>
                {unreadCount > 9 ? (
                  <Text style={styles.badgeNumberText}>9+</Text>
                ) : (
                  <View style={styles.solidDot} />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#35501F',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
  },
  ambientBlob1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  ambientBlob2: {
    position: 'absolute',
    bottom: -20,
    left: 80,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  avatarTouchable: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#263B16',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#FFFFFF',
  },
  guestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  titleText: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitleText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#EAF3DE',
    marginTop: 2,
    opacity: 0.9,
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#35501F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  solidDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'PlusJakartaSans-Bold',
    lineHeight: 9,
  },
});
