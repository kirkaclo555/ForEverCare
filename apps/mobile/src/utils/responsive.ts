import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline design dimensions (e.g. Standard Mobile screen size 375 x 812)
const BASELINE_WIDTH = 375;
const BASELINE_HEIGHT = 812;

const scaleWidth = SCREEN_WIDTH / BASELINE_WIDTH;
const scaleHeight = SCREEN_HEIGHT / BASELINE_HEIGHT;

/**
 * Scale element size horizontally (width, paddingHorizontal, etc.)
 */
export function scale(size: number): number {
  const newSize = size * scaleWidth;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale element size vertically (height, paddingVertical, etc.)
 */
export function verticalScale(size: number): number {
  const newSize = size * scaleHeight;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Moderate scaling factor for responsive layouts without extreme resizing (great for padding/margins)
 */
export function moderateScale(size: number, factor = 0.5): number {
  return Math.round(size + (scale(size) - size) * factor);
}

/**
 * Smart font sizing that scales with width but enforces a sensible threshold
 */
export function fontSize(size: number): number {
  const scaled = size * scaleWidth;
  // Apply a moderate scaling factor so fonts don't look ridiculously huge on big screens or tiny on tiny screens
  return Math.round(PixelRatio.roundToNearestPixel(size + (scaled - size) * 0.4));
}

/**
 * Responsive percentage width
 */
export function wp(percent: number): number {
  return (SCREEN_WIDTH * percent) / 100;
}

/**
 * Responsive percentage height
 */
export function hp(percent: number): number {
  return (SCREEN_HEIGHT * percent) / 100;
}

export const device = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 360,
  isTablet: SCREEN_WIDTH >= 768,
};
