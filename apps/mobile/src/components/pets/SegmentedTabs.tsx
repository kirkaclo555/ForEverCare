import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type PetDetailTab = 'medical' | 'prescriptions' | 'vaccines';

interface SegmentedTabsProps {
  activeTab: PetDetailTab;
  onTabChange: (tab: PetDetailTab) => void;
}

const TABS: { id: PetDetailTab; label: string }[] = [
  { id: 'medical', label: 'Check-ups' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'vaccines', label: 'Vaccines' },
];

export default function SegmentedTabs({
  activeTab,
  onTabChange,
}: SegmentedTabsProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
          >
            <Text style={[styles.tabText, isActive ? styles.activeTabText : styles.inactiveTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#35501F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
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
