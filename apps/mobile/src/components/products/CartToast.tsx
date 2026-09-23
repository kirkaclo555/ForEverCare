import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  message?: string;
  onHide: () => void;
  bottomOffset?: number;
  onUndo?: () => void;
  undoLabel?: string;
  duration?: number;
};

export default function CartToast({
  visible,
  message = 'Added to cart',
  onHide,
  bottomOffset = 70,
  onUndo,
  undoLabel = 'Undo',
  duration,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timeoutMs = duration !== undefined ? duration : 1800;
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 10,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, timeoutMs);

      return () => clearTimeout(timer);
    }
  }, [visible, opacity, translateY, onHide, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { bottom: bottomOffset, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents={onUndo ? 'auto' : 'none'}
    >
      <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
      <Text style={styles.toastText}>{message}</Text>
      {onUndo && (
        <TouchableOpacity
          onPress={() => {
            onUndo();
            onHide();
          }}
          style={styles.undoBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.undoText}>{undoLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 999,
  },
  toastText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  undoBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  undoText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#4ADE80',
    textTransform: 'uppercase',
  },
});
