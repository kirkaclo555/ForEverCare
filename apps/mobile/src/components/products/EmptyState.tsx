import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  type?: 'empty' | 'error';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
};

export default function EmptyState({
  type = 'empty',
  title,
  message,
  actionText,
  onAction,
}: Props) {
  const isError = type === 'error';
  const defaultTitle = isError ? 'Unable to load products' : 'No products found';
  const defaultMessage = isError
    ? 'Something went wrong while fetching products. Please try again.'
    : 'Try a different search or category.';
  const defaultActionText = isError ? 'Try again' : 'Clear filters';

  return (
    <View style={styles.container}>
      {/* Icon Circle */}
      <View style={[styles.iconCircle, isError && styles.iconCircleError]}>
        <Ionicons
          name={isError ? 'alert-circle-outline' : 'search-outline'}
          size={32}
          color={isError ? '#DC2626' : '#9CA3AF'}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>{title || defaultTitle}</Text>

      {/* Helper message */}
      <Text style={styles.message}>{message || defaultMessage}</Text>

      {/* Action button */}
      {onAction && (
        <TouchableOpacity
          style={[styles.actionBtn, isError && styles.actionBtnError]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>{actionText || defaultActionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleError: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    maxWidth: 260,
  },
  actionBtn: {
    backgroundColor: '#35501F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnError: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
