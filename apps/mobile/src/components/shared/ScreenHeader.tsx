/**
 * ScreenHeader — shared fixed header for all screens.
 * Fixes the Catcut font clipping issue with explicit lineHeight and paddingVertical.
 * No overflow:hidden on any parent.
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  onBack?: () => void;
  /** Optional right element (e.g. an Edit button). Pass null to use an invisible spacer. */
  right?: React.ReactNode | null;
  /** Background colour, defaults to #35501F */
  backgroundColor?: string;
};

export default function ScreenHeader({
  title,
  onBack,
  right,
  backgroundColor = '#35501F',
}: Props) {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + 10;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View
        style={[
          styles.header,
          {
            backgroundColor,
            paddingTop: topPad,
            // minHeight ensures the content area is at least 56 px tall,
            // independent of safe-area inset
            minHeight: topPad + 56,
          },
        ]}
      >
        {/* Left — back button or spacer */}
        <View style={styles.side}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Centre — title: no fixed height, no overflow:hidden */}
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {title}
        </Text>

        {/* Right — custom element or matching spacer */}
        <View style={styles.side}>
          {right !== undefined ? right : null}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    // NO overflow: 'hidden' — that's what clips the Catcut font
  },
  side: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    // ~1.4× fontSize to avoid clipping ascenders/descenders
    lineHeight: 28,
    // Extra breathing room — critical for decorative fonts like Catcut on Android
    paddingVertical: Platform.OS === 'android' ? 4 : 2,
    fontFamily: 'Catcut',
    color: '#FFFFFF',
    textAlign: 'center',
    // includeFontPadding: false combined with explicit lineHeight
    // prevents Android from double-padding the font metrics
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
});
