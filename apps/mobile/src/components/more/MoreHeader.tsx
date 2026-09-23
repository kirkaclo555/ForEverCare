import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  canGoBack?: boolean;
  onBack?: () => void;
};

export default function MoreHeader({ canGoBack, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#35501F" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        {canGoBack && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          // Keeps title left-aligned consistently whether back btn shows or not
          <View style={styles.backBtnPlaceholder} />
        )}
        <Text style={styles.title} numberOfLines={1}>More</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 0,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Catcut',
    color: '#FFFFFF',
  },
});
