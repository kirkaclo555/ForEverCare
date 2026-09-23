import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface PetPhotoProps {
  avatar?: string | null;
  species?: string;
  size?: number;
  borderRadius?: number;
}

export default function PetPhoto({ avatar, species = 'Dog', size = 60, borderRadius }: PetPhotoProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatar]);

  const isCat = species.toLowerCase() === 'cat';
  const hasValidImage =
    avatar &&
    (avatar.startsWith('file') || avatar.startsWith('http') || avatar.startsWith('data:image/')) &&
    !hasError;

  const effectiveRadius = borderRadius ?? 14;

  if (hasValidImage) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: effectiveRadius }]}>
        <Image
          source={{ uri: avatar }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      </View>
    );
  }

  // Soft tinted tile with dark species icon
  const tileBg = isCat ? '#EAF3DE' : '#FEF3C7';
  const iconColor = isCat ? '#276749' : '#92400E';
  const iconName = isCat ? 'cat' : 'dog';

  return (
    <View style={[styles.container, styles.tintedTile, { width: size, height: size, borderRadius: effectiveRadius, backgroundColor: tileBg }]}>
      <FontAwesome5 name={iconName} size={size * 0.44} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tintedTile: {
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});
