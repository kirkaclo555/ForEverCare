import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

type Language = 'en' | 'tl';

type LangOption = {
  code: Language;
  label: string;
  sublabel: string;
  flag: string;
};

const LANGUAGES: LangOption[] = [
  { code: 'en', label: 'English', sublabel: 'United States', flag: '🇺🇸' },
  { code: 'tl', label: 'Wikang Filipino', sublabel: 'Tagalog', flag: '🇵🇭' },
];

type Props = {
  visible: boolean;
  currentLanguage: Language;
  onSelect: (lang: Language) => void;
  onClose: () => void;
};

export default function LanguageSheet({
  visible,
  currentLanguage,
  onSelect,
  onClose,
}: Props) {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.card, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={[styles.sheetTitle, { color: theme.text }]}>Language</Text>
        <Text style={[styles.sheetSubtitle, { color: theme.subtext }]}>
          Select your preferred language
        </Text>

        {LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langRow,
                {
                  backgroundColor: isSelected
                    ? isDarkMode
                      ? '#1c330e'
                      : '#EAF3DE'
                    : isDarkMode
                    ? '#2d2d2d'
                    : '#F9FAFB',
                  borderColor: isSelected ? '#7CB342' : theme.border,
                },
              ]}
              onPress={() => onSelect(lang.code)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${lang.label}`}
              activeOpacity={0.7}
            >
              <View style={styles.langLeft}>
                <Text style={styles.flag}>{lang.flag}</Text>
                <View>
                  <Text style={[styles.langLabel, { color: theme.text }]}>
                    {lang.label}
                  </Text>
                  <Text style={[styles.langSublabel, { color: theme.subtext }]}>
                    {lang.sublabel}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  isSelected && {
                    borderColor: '#7CB342',
                  },
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color="#7CB342" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.cancelBtn,
            { backgroundColor: isDarkMode ? '#2d2d2d' : '#F3F4F6', borderColor: theme.border },
          ]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cancel language selection"
        >
          <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flag: {
    fontSize: 22,
  },
  langLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  langSublabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});
