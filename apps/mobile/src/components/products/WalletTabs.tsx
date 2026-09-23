import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WalletTabsProps {
  activeTab: 'gcash' | 'maya';
  onSelectTab: (tab: 'gcash' | 'maya') => void;
}

export default function WalletTabs({ activeTab, onSelectTab }: WalletTabsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'gcash' && styles.activeTab]}
        onPress={() => onSelectTab('gcash')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'gcash' }}
      >
        <Ionicons
          name="wallet-outline"
          size={16}
          color={activeTab === 'gcash' ? '#FFFFFF' : '#6B7280'}
          style={styles.icon}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'gcash' ? styles.activeTabText : styles.inactiveTabText,
          ]}
        >
          GCash
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'maya' && styles.activeTab]}
        onPress={() => onSelectTab('maya')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'maya' }}
      >
        <Ionicons
          name="wallet-outline"
          size={16}
          color={activeTab === 'maya' ? '#FFFFFF' : '#6B7280'}
          style={styles.icon}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'maya' ? styles.activeTabText : styles.inactiveTabText,
          ]}
        >
          Maya
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#35501F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  inactiveTabText: {
    color: '#6B7280',
    fontFamily: 'Montserrat-Medium',
  },
});
