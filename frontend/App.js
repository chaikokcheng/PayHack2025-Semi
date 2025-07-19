import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
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
import OfflinePaymentScreen from './src/screens/offline-payment/OfflinePaymentScreen';
import ReceivePaymentScreen from './src/screens/offline-payment/ReceivePaymentScreen';
import PaymentTransferScreen from './src/screens/offline-payment/PaymentTransferScreen';
import PaymentSuccessScreen from './src/screens/offline-payment/PaymentSuccessScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import CarWalletScreen from './src/screens/CarWalletScreen';
import OnboardingScreen from './src/screens/Onboard/OnboardingScreen';
import EKYCStep from './src/screens/Onboard/EKYCStep';
import SSMUploadStep from './src/screens/Onboard/SSMUploadStep';
import SSMSummaryStep from './src/screens/Onboard/SSMSummaryStep';
import BankStatementUploadStep from './src/screens/Onboard/BankStatementUploadStep';
import BankStatementSummaryStep from './src/screens/Onboard/BankStatementSummaryStep';
import MerchantSummaryScreen, { AllTransactionsScreen, TransactionDetailScreen } from './src/screens/MerchantSummaryScreen';
import MerchantCreditScoreScreen from './src/screens/MerchantCreditScoreScreen';
import MerchantLoansScreen from './src/screens/MerchantLoansScreen';
import MerchantTaxScreen from './src/screens/MerchantTaxScreen';
import OldCreditScreen from './src/screens/OldCreditScreen';

// Onboarding Context
export const OnboardingContext = React.createContext();
import BulkPurchaseScreen from './src/screens/msme-plugin/BulkPurchaseScreen';
import CommunityScreen from './src/screens/msme-plugin/CommunityScreen';
import InventoryScreen from './src/screens/msme-plugin/InventoryScreen';
import MSMEToolsScreen from './src/screens/msme-plugin/MSMEToolsScreen';
import MSMEResourcesScreen from './src/screens/msme-plugin/MSMEResourcesScreen';
import AccountingScreen from './src/screens/msme-plugin/AccountingScreen';
import ProfitCalculatorScreen from './src/screens/msme-plugin/ProfitCalculatorScreen';
import PricingCalculatorScreen from './src/screens/msme-plugin/PricingCalculatorScreen';
import BreakEvenCalculatorScreen from './src/screens/msme-plugin/BreakEvenCalculatorScreen';
import CashFlowCalculatorScreen from './src/screens/msme-plugin/CashFlowCalculatorScreen';
import TaxCalculatorScreen from './src/screens/msme-plugin/TaxCalculatorScreen';
import SalesForecastScreen from './src/screens/msme-plugin/SalesForecastScreen';
import BusinessValuationScreen from './src/screens/msme-plugin/BusinessValuationScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const DiscoveryStack = createStackNavigator();
const MerchantStack = createStackNavigator();

// HomeStack Navigator
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Community" component={CommunityScreen} />
      <HomeStack.Screen name="Resources" component={MSMEResourcesScreen} />
      <HomeStack.Screen name= "Chatbot" component={ChatbotScreen} />
    </HomeStack.Navigator>
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

// Merchant Stack Navigator
function MerchantStackScreen() {
  return (
    <MerchantStack.Navigator screenOptions={{ headerShown: false }}>
      <MerchantStack.Screen name="MerchantSummaryScreen" component={MerchantSummaryScreen} />
      <MerchantStack.Screen name="MerchantCreditScoreScreen" component={MerchantCreditScoreScreen} />
      <MerchantStack.Screen name="MerchantLoansScreen" component={MerchantLoansScreen} />
      <MerchantStack.Screen name="MerchantTaxScreen" component={MerchantTaxScreen} />
      <MerchantStack.Screen name="MSMEToolsMain" component={MSMEToolsScreen} />
      <MerchantStack.Screen name="BulkPurchase" component={BulkPurchaseScreen} />
      <MerchantStack.Screen name="Inventory" component={InventoryScreen} />
      {/* Financial Tools screens as direct children */}
      <MerchantStack.Screen name="AccountingScreen" component={AccountingScreen} />
      <MerchantStack.Screen name="ProfitCalculatorScreen" component={ProfitCalculatorScreen} />
      <MerchantStack.Screen name="PricingCalculatorScreen" component={PricingCalculatorScreen} />
      <MerchantStack.Screen name="BreakEvenCalculatorScreen" component={BreakEvenCalculatorScreen} />
      <MerchantStack.Screen name="CashFlowCalculatorScreen" component={CashFlowCalculatorScreen} />
      <MerchantStack.Screen name="TaxCalculatorScreen" component={TaxCalculatorScreen} />
      <MerchantStack.Screen name="SalesForecastScreen" component={SalesForecastScreen} />
      <MerchantStack.Screen name="BusinessValuationScreen" component={BusinessValuationScreen} />
    </MerchantStack.Navigator>
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
          } else if (route.name === 'Merchant') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
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
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Merchant" component={MerchantStackScreen} options={{ title: 'Merchant', tabBarLabel: 'Merchant' }} />
      <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
      <Tab.Screen name="Discovery" component={DiscoveryStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
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
      <RootStack.Screen name="BillScreen" component={BillScreen} />
      <RootStack.Screen name="OfflinePayment" component={OfflinePaymentStackScreen} />
      <RootStack.Screen name="CarWallet" component={CarWalletScreen} />
      <RootStack.Screen name="AllTransactionsScreen" component={AllTransactionsScreen} />
      <RootStack.Screen name="TransactionDetailScreen" component={TransactionDetailScreen} />
      <RootStack.Screen name="OldCreditScreen" component={OldCreditScreen} />
      <RootStack.Screen name="ChatbotScreen" component={ChatbotScreen} />
    </RootStack.Navigator>
  );
}

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
        <RootStack.Screen name="AllTransactionsScreen" component={AllTransactionsScreen} />
        <RootStack.Screen name="TransactionDetailScreen" component={TransactionDetailScreen} />
        <RootStack.Screen name="OldCreditScreen" component={OldCreditScreen} />
      </RootStack.Navigator>
    );
  }

  return (
    <OnboardingContext.Provider value={{ showOnboarding, setShowOnboarding }}>
      <SafeAreaProvider>
        <PaperProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
              <StatusBar style="auto" />
              <RootStackScreenWithRestart />
            </NavigationContainer>
          </GestureHandlerRootView>
        </PaperProvider>
      </SafeAreaProvider>
    </OnboardingContext.Provider>
  );
}
