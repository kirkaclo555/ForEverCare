import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { PetProvider } from './src/context/PetContext';
import { UserProvider } from './src/context/UserContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import PetMonitoringScreen from './src/screens/PetMonitoringScreen';
import PetRecordsScreen from './src/screens/PetRecordsScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import TelemedicineScreen from './src/screens/TelemedicineScreen';
import MoreMenuScreen from './src/screens/MoreMenuScreen';
import TutorialsScreen from './src/screens/TutorialsScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AccountSecurityScreen from './src/screens/AccountSecurityScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type MoreStackParamList = {
  MoreMenu: undefined;
  Feedback: undefined;
  Tutorials: undefined;
  PetRecords: undefined;
  PetMonitoring: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  PetOwnerTabs: undefined;
  Register: undefined;
  Users: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
  AccountSecurity: undefined;
};



const Stack = createNativeStackNavigator<RootStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const Tab = createBottomTabNavigator();

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <MoreStack.Screen name="Feedback" component={FeedbackScreen} />
      <MoreStack.Screen name="Tutorials" component={TutorialsScreen} />
      <MoreStack.Screen name="PetRecords" component={PetRecordsScreen} />
      <MoreStack.Screen name="PetMonitoring" component={PetMonitoringScreen} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
    </MoreStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2E5E3E',
        tabBarInactiveTintColor: '#a0aec0',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          backgroundColor: '#FCFBF7',
          borderTopWidth: 1,
          borderTopColor: '#edf2f7',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Appointments') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Telemed') iconName = focused ? 'videocam' : 'videocam-outline';
          else if (route.name === 'Products') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'More') iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Telemed" component={TelemedicineScreen} options={{ tabBarLabel: 'Telemed' }} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <PetProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="PetOwnerTabs" component={MainTabNavigator} />
              <Stack.Screen name="Register" component={SignupScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PetProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
