import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

type Props = {
  code: string;
};

export default function CodeChip({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity
      style={[styles.chip, copied && styles.chipCopied]}
      onPress={handleCopy}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Ionicons
        name={copied ? 'checkmark' : 'copy-outline'}
        size={11}
        color={copied ? '#35501F' : '#6B7280'}
        style={{ marginRight: 4 }}
      />
      <Text style={[styles.text, copied && styles.textCopied]} numberOfLines={1}>
        {copied ? 'Code copied' : code}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  chipCopied: {
    backgroundColor: '#EAF3DE',
    borderColor: '#C2E0A3',
  },
  text: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#4B5563',
    letterSpacing: 0.3,
  },
  textCopied: {
    color: '#35501F',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});
