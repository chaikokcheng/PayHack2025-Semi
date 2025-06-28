import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from './src/constants/Colors';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ShoppingScreen from './src/screens/ShoppingScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import TransferScreen from './src/screens/TransferScreen';
import OfflinePaymentScreen from './src/screens/OfflinePaymentScreen';
import ReceivePaymentScreen from './src/screens/ReceivePaymentScreen';
import BluetoothScannerScreen from './src/screens/BluetoothScannerScreen';
import PaymentTransferScreen from './src/screens/PaymentTransferScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const ShoppingStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const AnalyticsStack = createStackNavigator();

// Shopping Stack Navigator
function ShoppingStackScreen() {
  return (
    <ShoppingStack.Navigator screenOptions={{ headerShown: false }}>
      <ShoppingStack.Screen name="ShoppingMain" component={ShoppingScreen} />
      <ShoppingStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <ShoppingStack.Screen name="Cart" component={CartScreen} />
    </ShoppingStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// Analytics Stack Navigator - Keep Analytics independent
function AnalyticsStackScreen() {
  return (
    <AnalyticsStack.Navigator screenOptions={{ headerShown: false }}>
      <AnalyticsStack.Screen name="AnalyticsMain" component={AnalyticsScreen} />
      <AnalyticsStack.Screen name="Transfer" component={TransferScreen} />
      <AnalyticsStack.Screen name="Chatbot" component={ChatbotScreen} />
    </AnalyticsStack.Navigator>
  );
}

// Offline Payment Stack Navigator  
const OfflinePaymentStack = createStackNavigator();
function OfflinePaymentStackScreen() {
  return (
    <OfflinePaymentStack.Navigator screenOptions={{ headerShown: false }}>
      <OfflinePaymentStack.Screen name="OfflinePaymentMain" component={OfflinePaymentScreen} />
      <OfflinePaymentStack.Screen name="ReceivePayment" component={ReceivePaymentScreen} />
      <OfflinePaymentStack.Screen name="BluetoothScanner" component={BluetoothScannerScreen} />
      <OfflinePaymentStack.Screen name="PaymentTransfer" component={PaymentTransferScreen} />
      <OfflinePaymentStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </OfflinePaymentStack.Navigator>

  );
}

// Main Tab Navigator
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Shopping') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'QR Scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shopping" component={ShoppingStackScreen} />
      <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

// Root Stack Navigator to handle both main tabs and offline payment stack
function RootStackScreen() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="OfflinePayment" component={OfflinePaymentStackScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootStackScreen />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
