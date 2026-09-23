import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../context/UserContext';

type Props = {
  user: UserProfile;
  onPress: () => void;
};

function getInitials(fullName: string): string {
  const parts = (fullName || '').trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileCard({ user, onPress }: Props) {
  const hasAvatar =
    user.avatarUri &&
    (user.avatarUri.startsWith('http') ||
      user.avatarUri.startsWith('file') ||
      user.avatarUri.startsWith('data:image/'));

  const displayName = user.fullName?.trim() || user.email || 'Pet Owner';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="View and edit your profile"
    >
      {/* Avatar */}
      {hasAvatar ? (
        <Image source={{ uri: user.avatarUri! }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.initials}>{getInitials(displayName)}</Text>
        </View>
      )}

      {/* Name + subtitle */}
      <View style={styles.textBlock}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          View and edit profile
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF3DE',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#35501F',
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#9CA3AF',
    marginTop: 1,
  },
});
