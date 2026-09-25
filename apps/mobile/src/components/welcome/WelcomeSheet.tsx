import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onSignIn: () => void;
  onCreateAccount: () => void;
  onContinueGuest: () => void;
};

export default function WelcomeSheet({
  onSignIn,
  onCreateAccount,
  onContinueGuest,
}: Props) {
  const insets = useSafeAreaInsets();
  const [navigating, setNavigating] = useState(false);

  // Debounce: ignore taps for 500ms after first tap
  const handlePress = (callback: () => void) => {
    if (navigating) return;
    setNavigating(true);
    callback();
    setTimeout(() => setNavigating(false), 500);
  };

  return (
    <View style={styles.sheetContainer}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* â”€â”€ Header Text (unchanged) â”€â”€ */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeHeading}>Welcome</Text>
          <Text style={styles.appSubtitle}>
            Book visits, order supplies and keep your pet's records in one place.
          </Text>
        </View>

        {/* â”€â”€ Button area â”€â”€ */}
        <View style={styles.buttonsStack}>

          {/* 1. Create account â€” primary solid */}
          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => handlePress(onCreateAccount)}
            activeOpacity={0.82}
            disabled={navigating}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <Ionicons
              name="person-add-outline"
              size={18}
              color="#FFFFFF"
              style={styles.btnIcon}
            />
            <Text style={styles.createAccountBtnText}>Create account</Text>
          </TouchableOpacity>

          {/* 2. I already have an account â€” secondary outlined */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => handlePress(onSignIn)}
            activeOpacity={0.75}
            disabled={navigating}
            accessibilityRole="button"
            accessibilityLabel="I already have an account"
          >
            <Ionicons
              name="log-in-outline"
              size={18}
              color="#2E5E3E"
              style={styles.btnIcon}
            />
            <Text style={styles.signInBtnText}>I already have an account</Text>
          </TouchableOpacity>

          {/* 3. Just looking around? â€” guest card */}
          <TouchableOpacity
            style={styles.guestCard}
            onPress={() => handlePress(onContinueGuest)}
            activeOpacity={0.82}
            disabled={navigating}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest, browse products and clinic info"
          >
            {/* Eye icon */}
            <Ionicons name="eye-outline" size={20} color="#27500A" />

            {/* Middle text block */}
            <View style={styles.guestCardMiddle}>
              <Text style={styles.guestCardTitle}>Just looking around?</Text>
              <Text style={styles.guestCardSub} numberOfLines={1}>Browse products & clinic info without an account.</Text>
            </View>

            {/* Right: "Guest" label + arrow */}
            <View style={styles.guestCardRight}>
              <Text style={styles.guestLabel}>Guest</Text>
              <Ionicons name="arrow-forward" size={14} color="#27500A" />
            </View>
          </TouchableOpacity>

        </View>

        {/* â”€â”€ Footer Legal Notice (unchanged) â”€â”€ */}
        <View style={styles.footerLegalContainer}>
          <Text style={styles.legalText}>
            By continuing you agree to our{' '}
            <Text style={styles.legalHighlight}>Terms</Text> and{' '}
            <Text style={styles.legalHighlight}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // â”€â”€ Container (unchanged) â”€â”€
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  // â”€â”€ Header text (unchanged) â”€â”€
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  welcomeHeading: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 28,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },

  // â”€â”€ Buttons stack â”€â”€
  buttonsStack: {
    width: '100%',
    marginBottom: 16,
  },

  // 1. Create account (primary)
  createAccountBtn: {
    height: 48,
    backgroundColor: '#2E5E3E',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // 2. I already have an account (secondary outlined)
  signInBtn: {
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E5E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signInBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#2E5E3E',
    letterSpacing: 0.2,
  },

  // Shared icon spacing
  btnIcon: {
    marginRight: 6,
  },

  // 3. Guest card
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 56,
    marginTop: 12,
    gap: 10,
  },
  guestCardMiddle: {
    flex: 1,
  },
  guestCardTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#173404',
    lineHeight: 20,
  },
  guestCardSub: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#27500A',
    lineHeight: 17,
    marginTop: 1,
  },
  guestCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  guestLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#27500A',
  },

  // â”€â”€ Footer legal (unchanged) â”€â”€
  footerLegalContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 10,
  },
  legalText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  legalHighlight: {
    color: '#4B5563',
    fontFamily: 'PlusJakartaSans-Medium',
  },
});
