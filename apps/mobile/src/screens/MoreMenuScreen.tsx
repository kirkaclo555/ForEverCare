import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;
};

export default function MoreMenuScreen({ navigation }: Props) {
  const menuOptions = [
    {
      id: 'pet-records',
      title: 'Pet Records',
      subtitle: 'Manage pet profiles and medical history',
      icon: 'paw',
      color: '#38a169',
      bg: '#f0fff4',
      route: 'PetRecords' as const,
    },
    {
      id: 'pet-monitoring',
      title: 'Pet Monitoring',
      subtitle: "Track your pet's health stats and vitals",
      icon: 'heartbeat',
      color: '#805ad5',
      bg: '#faf5ff',
      route: 'PetMonitoring' as const,
    },
    {
      id: 'tutorials',
      title: 'Pet Tutorials',
      subtitle: 'Watch guides on training, grooming, and care',
      icon: 'photo-video',
      color: '#3182ce',
      bg: '#ebf8ff',
      route: 'Tutorials' as const,
    },
    {
      id: 'feedback',
      title: 'Provide Feedback',
      subtitle: 'Tell us how we can improve our services',
      icon: 'comment-alt',
      color: '#d69e2e',
      bg: '#fffff0',
      route: 'Feedback' as const,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and account security',
      icon: 'cog',
      color: '#4a5568',
      bg: '#edf2f7',
      route: 'Settings' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>More Options</Text>
        </View>
      </View>
      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Discover & Connect</Text>
        <View style={styles.menuContainer}>
          {menuOptions.map(option => (
            <TouchableOpacity 
              key={option.id} 
              style={styles.menuCard} 
              onPress={() => navigation.navigate(option.route)}
            >
              <View style={[styles.iconBox, { backgroundColor: option.bg }]}>
                <FontAwesome5 name={option.icon} size={20} color={option.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={16} color="#cbd5e0" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F1EC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  mainScroll: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Catcut', color: '#4a5568', marginBottom: 15 },
  menuContainer: { gap: 15 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2d3748', marginBottom: 4 },
  menuSubtitle: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-Regular' },
});
