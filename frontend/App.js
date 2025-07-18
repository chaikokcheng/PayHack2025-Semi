import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from './src/constants/Colors';
// import * as LocalAuthentication from 'expo-local-authentication'; // Disabled for development
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ShoppingScreen from './src/screens/ShoppingScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OldAnalyticsScreen from './src/screens/OldAnalyticsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import BillScreen from './src/screens/BillScreen';
import TransferScreen from './src/screens/TransferScreen';
import MerchantMenuScreen from './src/screens/MerchantMenuScreen';
import OfflinePaymentScreen from './src/screens/OfflinePaymentScreen';
import ReceivePaymentScreen from './src/screens/ReceivePaymentScreen';
import PaymentTransferScreen from './src/screens/PaymentTransferScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import CarWalletScreen from './src/screens/CarWalletScreen';
import OnboardingScreen from './src/screens/Onboard/OnboardingScreen';
import EKYCStep from './src/screens/Onboard/EKYCStep';
import SSMUploadStep from './src/screens/Onboard/SSMUploadStep';
import SSMSummaryStep from './src/screens/Onboard/SSMSummaryStep';
import BankStatementUploadStep from './src/screens/Onboard/BankStatementUploadStep';
import BankStatementSummaryStep from './src/screens/Onboard/BankStatementSummaryStep';

// Onboarding Context
export const OnboardingContext = React.createContext();

const Tab = createBottomTabNavigator();
const ShoppingStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const DiscoveryStack = createStackNavigator();

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
      <ProfileStack.Screen name="OldAnalytics" component={OldAnalyticsScreen} />
    </ProfileStack.Navigator>
  );
}

// Discovery Stack Navigator - Main discovery and social impact features
function DiscoveryStackScreen() {
  return (
    <DiscoveryStack.Navigator screenOptions={{ headerShown: false }}>
      <DiscoveryStack.Screen name="DiscoveryMain" component={AnalyticsScreen} />
      <DiscoveryStack.Screen name="Transfer" component={TransferScreen} />
      <DiscoveryStack.Screen name="Chatbot" component={ChatbotScreen} />
    </DiscoveryStack.Navigator>
  );
}

// Offline Payment Stack Navigator  
const OfflinePaymentStack = createStackNavigator();
function OfflinePaymentStackScreen() {
  return (
    <OfflinePaymentStack.Navigator screenOptions={{ headerShown: false }}>
      <OfflinePaymentStack.Screen name="OfflinePaymentMain" component={OfflinePaymentScreen} />
      <OfflinePaymentStack.Screen name="ReceivePayment" component={ReceivePaymentScreen} />
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
          } else if (route.name === 'Discovery') {
            iconName = focused ? 'compass' : 'compass-outline';
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
      <Tab.Screen name="Discovery" component={DiscoveryStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

// Add a root stack navigator to support navigation to MerchantMenuScreen from anywhere
const RootStack = createStackNavigator();

export default function App() {
  const [showOnboarding, setShowOnboarding] = React.useState(true);

  // Called when onboarding is finished
  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
  };

  function RootStackScreenWithRestart() {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <RootStack.Screen name="OnboardingScreen">
            {props => <OnboardingScreen {...props} onFinish={handleOnboardingFinish} />}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        )}
        <RootStack.Screen name="MerchantMenuScreen" component={MerchantMenuScreen} />
        <RootStack.Screen name="QRScannerScreen" component={QRScannerScreen} />
        <RootStack.Screen name="BillScreen" component={BillScreen} />
        <RootStack.Screen name="OfflinePayment" component={OfflinePaymentStackScreen} />
        <RootStack.Screen name="CarWallet" component={CarWalletScreen} />
        <RootStack.Screen name="EKYCStep" component={EKYCStep} />
        <RootStack.Screen name="SSMUploadStep" component={SSMUploadStep} />
        <RootStack.Screen name="SSMSummaryStep" component={SSMSummaryStep} />
        <RootStack.Screen name="BankStatementUploadStep" component={BankStatementUploadStep} />
        <RootStack.Screen name="BankStatementSummaryStep" component={BankStatementSummaryStep} />
      </RootStack.Navigator>
    );
  }

  return (
    <OnboardingContext.Provider value={{ showOnboarding, setShowOnboarding }}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootStackScreenWithRestart />
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </OnboardingContext.Provider>
  );
}
