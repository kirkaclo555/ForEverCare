import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute.key]?.options;
  if ((currentOptions?.tabBarStyle as any)?.display === 'none') {
    return null;
  }

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Custom Label Resolution: Rename Appointments to Bookings
        let label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        if (route.name === 'Appointments') {
          label = 'Bookings';
        }

        // Icon Resolution
        const getIconName = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
          switch (routeName) {
            case 'Home':
              return focused ? 'home' : 'home-outline';
            case 'Appointments':
              return focused ? 'calendar' : 'calendar-outline';
            case 'Telemed':
              return focused ? 'videocam' : 'videocam-outline';
            case 'Products':
              return focused ? 'cart' : 'cart-outline';
            case 'More':
              return focused ? 'menu' : 'menu-outline';
            default:
              return focused ? 'ellipse' : 'ellipse-outline';
          }
        };

        const iconName = getIconName(route.name, isFocused);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            if (route.name === 'More') {
              navigation.navigate('More', { screen: 'MoreMenu' });
            } else {
              navigation.navigate(route.name);
            }
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconColor = isFocused ? '#35501F' : '#6B7280';
        const labelColor = isFocused ? '#35501F' : '#6B7280';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {/* Active Soft Green Pill behind icon */}
            <View style={[styles.iconWrapper, isFocused && styles.activePill]}>
              <Ionicons name={iconName} size={20} color={iconColor} />
            </View>

            <Text
              style={[
                styles.tabLabel,
                { color: labelColor },
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {typeof label === 'string' ? label : route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  iconWrapper: {
    width: 46,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  activePill: {
    backgroundColor: '#EAF3DE',
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tabLabelInactive: {
    fontFamily: 'PlusJakartaSans-Medium',
  },
});
