import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  type?: 'empty' | 'error';
  title?: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  isUnverified?: boolean;
  errorMessage?: string;
  onAddPet?: () => void;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = 'empty',
  title,
  subtitle,
  iconName = 'paw',
  isUnverified = false,
  errorMessage = 'Failed to load pets. Please try again.',
  onAddPet,
  onRetry,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  if (type === 'error') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, styles.errorIconCircle]}>
          <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
        </View>
        <Text style={styles.title}>{title || 'Something went wrong'}</Text>
        <Text style={styles.subtitle}>{errorMessage}</Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.button}
            onPress={onRetry}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const effectiveTitle = title || 'No pets yet';
  const effectiveSubtitle = subtitle || (
    isUnverified
      ? 'Records unlock after clinic verification.'
      : 'Add your first pet to book visits and keep their records.'
  );

  const effectiveAction = onAction || onAddPet;
  const effectiveActionLabel = actionLabel || (onAddPet ? 'Add pet' : undefined);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={36} color="#35501F" />
      </View>
      <Text style={styles.title}>{effectiveTitle}</Text>
      <Text style={styles.subtitle}>{effectiveSubtitle}</Text>

      {isUnverified && subtitle && (
        <Text style={styles.unverifiedNote}>
          Records unlock after clinic verification.
        </Text>
      )}

      {effectiveAction && effectiveActionLabel && (
        <TouchableOpacity
          style={styles.button}
          onPress={effectiveAction}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={effectiveActionLabel}
        >
          <Text style={styles.buttonText}>{effectiveActionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorIconCircle: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  unverifiedNote: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#92400E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#35501F',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
    marginTop: 18,
    shadowColor: '#35501F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
});
