import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Unified Modal Styles for FurEverPawCare
 * 
 * Three modal variants:
 * 1. Bottom Sheet - slides up from bottom (language, rules, forms)
 * 2. Center Dialog - centered alert-style (confirmations, success, dropdowns)
 * 3. Full Screen - full page overlay (notifications list, about us)
 */
export const modalStyles = StyleSheet.create({
  // ─── BOTTOM SHEET ───
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  // ─── CENTER DIALOG ───
  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerContent: {
    width: '100%' as any,
    maxWidth: 380,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  // ─── FULL SCREEN ───
  fullScreenOverlay: {
    flex: 1,
  },
  fullScreenHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  fullScreenHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: 'white',
  },

  // ─── SHARED ELEMENTS ───
  handleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#cbd5e0',
    borderRadius: 3,
    alignSelf: 'center' as const,
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 15,
    alignSelf: 'center' as const,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center' as const,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center' as const,
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 10,
    marginTop: 5,
  },

  // ─── BUTTONS ───
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  buttonRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 10,
  },
  buttonFlex: {
    flex: 1,
  },

  // ─── INPUT ───
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 12,
  },

  // ─── LIST ITEM (for dropdowns) ───
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },

  // ─── HEADER ROW (icon + title inline) ───
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 5,
    gap: 10,
  },

  // ─── CLOSE BUTTON ROW ───
  closeRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    marginBottom: 5,
  },
});

/**
 * Helper to get theme-appropriate modal background and text colors
 */
export const getModalThemeColors = (isDarkMode: boolean, theme: any) => ({
  overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.55)',
  cardBg: theme.card,
  inputBg: isDarkMode ? '#1a1a1a' : '#f7fafc',
  inputBorder: theme.border,
  textPrimary: theme.text,
  textSecondary: theme.subtext,
  iconBg: isDarkMode ? '#1c330e' : '#EAF3DE',
  iconColor: isDarkMode ? '#EAF3DE' : '#7CB342',
  accentBg: '#2D5016',
  accentBgLight: isDarkMode ? '#1c330e' : '#EAF3DE',
  dangerBg: '#e53e3e',
  dangerBgLight: '#fed7d7',
  secondaryBtnBg: isDarkMode ? '#2d2d2d' : '#f7fafc',
  secondaryBtnBorder: theme.border,
});
