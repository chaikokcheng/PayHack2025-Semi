import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Alert, Platform, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from './src/constants/Colors';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

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
import MerchantMenuScreen from './src/screens/MerchantMenuScreen';

const Tab = createBottomTabNavigator();
const ShoppingStack = createStackNavigator();

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

// Wallet Stack Navigator  
const WalletStack = createStackNavigator();
function WalletStackScreen() {
  return (
    <WalletStack.Navigator screenOptions={{ headerShown: false }}>
      <WalletStack.Screen name="AnalyticsMain" component={AnalyticsScreen} />
      <WalletStack.Screen name="Transfer" component={TransferScreen} />
    </WalletStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
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
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 90 : 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shopping" component={ShoppingStackScreen} />
      <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
      <Tab.Screen name="Analytics" component={WalletStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Add a root stack navigator to support navigation to MerchantMenuScreen from anywhere
const RootStack = createStackNavigator();

function RootStackScreen() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="MerchantMenuScreen" component={MerchantMenuScreen} />
      <RootStack.Screen name="QRScannerScreen" component={QRScannerScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      setChecking(true);
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          // Allow bypass in development
          if (__DEV__) {
            Alert.alert(
              'Biometric Not Available',
              'Biometric authentication is not available on this device. Do you want to proceed for development/testing?',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => setAuthError('Authentication required.') },
                { text: 'Proceed', style: 'destructive', onPress: () => setIsAuthenticated(true) }
              ]
            );
            setChecking(false);
            return;
          } else {
            setAuthError('Biometric authentication not available.');
            setChecking(false);
            return;
          }
        }
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access PayHack2025',
          fallbackLabel: 'Enter Passcode',
        });
        if (result.success) {
          setIsAuthenticated(true);
        } else {
          setAuthError('Authentication failed.');
        }
      } catch (e) {
        setAuthError('Authentication error.');
      }
      setChecking(false);
    };
    authenticate();
  }, []);

  if (checking) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="auto" />
        <Ionicons name="finger-print" size={64} color={Colors.primary} />
        <Text style={{ marginTop: 20, fontSize: 18 }}>Checking biometric authentication...</Text>
      </GestureHandlerRootView>
    );
  }

  if (!isAuthenticated) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="auto" />
        <Ionicons name="close-circle" size={64} color="red" />
        <Text style={{ marginTop: 20, fontSize: 18, color: 'red' }}>{authError || 'Authentication required.'}</Text>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootStackScreen />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
