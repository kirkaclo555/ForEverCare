import React, { useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  image?: string | null;
  images?: string[] | null;
};

export default function ProductImageGallery({ image, images }: Props) {
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 32);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Normalize image list
  let imageList: string[] = [];
  if (Array.isArray(images) && images.length > 0) {
    imageList = images.filter(Boolean);
  } else if (image) {
    imageList = [image];
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (containerWidth || 1));
    setActiveIndex(index);
  };

  return (
    <View
      style={styles.frame}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {imageList.length === 0 ? (
        // Placeholder when no images exist
        <View style={styles.placeholderContainer}>
          <Ionicons name="cube-outline" size={54} color="#9CA3AF" />
        </View>
      ) : imageList.length === 1 ? (
        // Single Image
        <View style={styles.singleImageWrapper}>
          <Image
            source={{ uri: imageList[0] }}
            style={styles.image}
            resizeMode="contain"
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#35501F" />
            </View>
          )}
        </View>
      ) : (
        // Multi-image Horizontal Swipeable Carousel
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width: containerWidth }}
          >
            {imageList.map((imgUri, index) => (
              <View
                key={`${imgUri}-${index}`}
                style={[styles.singleImageWrapper, { width: containerWidth }]}
              >
                <Image
                  source={{ uri: imgUri }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {imageList.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#F8FAF9',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 249, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#35501F',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
});
