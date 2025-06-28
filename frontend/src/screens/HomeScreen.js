import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const linkedWallets = [
    {
      id: 1,
      name: 'Touch \'n Go eWallet',
      balance: 156.80,
      icon: 'card',
      color: ['#6366F1', '#8B5CF6'],
      isPrimary: true,
    },
    {
      id: 2,
      name: 'Maybank Account',
      balance: 2847.50,
      icon: 'card-outline',
      color: ['#10B981', '#059669'],
      isPrimary: false,
    },
    {
      id: 3,
      name: 'GrabPay',
      balance: 89.20,
      icon: 'wallet',
      color: ['#3B82F6', '#1D4ED8'],
      isPrimary: false,
    },
  ];

  const supportedWallets = [
    { name: 'PromptPay', logo: '🇹🇭', country: 'Thailand' },
    { name: 'GoPay', logo: '🇮🇩', country: 'Indonesia' },
    { name: 'PayNow', logo: '🇸🇬', country: 'Singapore' },
    { name: 'DuitNow', logo: '🇲🇾', country: 'Malaysia' },
    { name: 'GCash', logo: '🇵🇭', country: 'Philippines' },
    { name: 'MoMo', logo: '🇻🇳', country: 'Vietnam' },
    { name: 'Paymi', logo: '🇰🇭', country: 'Cambodia' },
    { name: 'Alipay', logo: '🇨🇳', country: 'China' },
    { name: 'Paytm', logo: '🇮🇳', country: 'India' },
    { name: 'KakaoPay', logo: '🇰🇷', country: 'South Korea' },
  ];

  const transactions = [
    { id: 1, name: 'Jaya Grocer', amount: -85.50, type: 'grocery', time: '2 min ago' },
    { id: 2, name: 'John Doe', amount: 200.00, type: 'transfer', time: '1 hour ago' },
    { id: 3, name: 'Parking Fee', amount: -5.00, type: 'parking', time: '3 hours ago' },
    { id: 4, name: 'Coffee Bean', amount: -15.90, type: 'food', time: '5 hours ago' },
  ];

  const quickActions = [
    { icon: 'qr-code-outline', label: 'QR Pay', action: () => navigation.navigate('QR Scanner'), color: ['#6366F1', '#8B5CF6'] },
    { icon: 'paper-plane-outline', label: 'Transfer', action: () => navigation.navigate('Analytics', { screen: 'Transfer' }), color: ['#10B981', '#059669'] },
    { icon: 'storefront-outline', label: 'Shop', action: () => navigation.navigate('Shopping'), color: ['#3B82F6', '#1D4ED8'] },
    { icon: 'car-outline', label: 'Car Pay', action: () => { }, color: ['#F59E0B', '#D97706'] },
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'grocery': return 'basket';
      case 'transfer': return 'swap-horizontal';
      case 'parking': return 'car';
      case 'food': return 'cafe';
      default: return 'card';
    }
  };

  return (
    <ScreenSafeArea style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.userName}>Kok Cheng</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications-outline" size={22} color="#6B7280" />
                <View style={styles.notificationDot} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                onPress={action.action}
              >
                <LinearGradient
                  colors={action.color}
                  style={styles.quickActionIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={action.icon} size={24} color="white" />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Linked Wallets */}
        <View style={styles.walletsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Wallets</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletsContainer}>
            {linkedWallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={styles.walletCard}
                onPress={() => navigation.navigate('Analytics')}
              >
                <LinearGradient
                  colors={wallet.color}
                  style={styles.walletGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.walletHeader}>
                    <Ionicons name={wallet.icon} size={24} color="white" />
                    {wallet.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Text style={styles.walletBalance}>RM {wallet.balance.toFixed(2)}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addWalletCard}>
              <View style={styles.addWalletContent}>
                <Ionicons name="add" size={32} color="#9CA3AF" />
                <Text style={styles.addWalletText}>Link Wallet</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Supported E-Wallets */}
        <View style={styles.supportedSection}>
          <View style={styles.supportedHeader}>
            <Text style={styles.sectionTitle}>E-Wallets & QR Payments</Text>
            <Text style={styles.supportedSubtitle}>Accepted worldwide</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.supportedWalletsContainer}
          >
            {supportedWallets.map((wallet, index) => (
              <View key={index} style={styles.supportedWalletItem}>
                <View style={styles.supportedWalletIcon}>
                  <Text style={styles.supportedWalletLogo}>{wallet.logo}</Text>
                </View>
                <Text style={styles.supportedWalletName}>{wallet.name}</Text>
                <Text style={styles.supportedWalletCountry}>{wallet.country}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsContainer}>
            {transactions.slice(0, 3).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={getTransactionIcon(transaction.type)}
                    size={20}
                    color="#6366F1"
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionName}>{transaction.name}</Text>
                  <Text style={styles.transactionTime}>{transaction.time}</Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.amount > 0 ? '#10B981' : '#374151' }
                ]}>
                  {transaction.amount > 0 ? '+' : ''}RM {Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Smart Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Smart Features</Text>

          <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('Shopping')}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.featureGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureContent}>
                <Text style={styles.featureEmoji}>🛍️</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Smart Shopping</Text>
                  <Text style={styles.featureSubtitle}>Discover deals at Jaya Grocer & more</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('CarWallet')}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.featureGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureContent}>
                <Text style={styles.featureEmoji}>🚗</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Car-as-Wallet</Text>
                  <Text style={styles.featureSubtitle}>Auto-pay for parking, tolls & charging</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIconContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  walletsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  walletsContainer: {
    paddingHorizontal: 24,
  },
  walletCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  walletGradient: {
    padding: 24,
    height: 160,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  primaryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  walletName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 8,
  },
  walletBalance: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  addWalletCard: {
    width: 160,
    height: 160,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addWalletContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWalletText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  supportedSection: {
    marginBottom: 40,
  },
  supportedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  supportedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  supportedWalletsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  supportedWalletItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    width: 96,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  supportedWalletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportedWalletLogo: {
    fontSize: 24,
  },
  supportedWalletName: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  supportedWalletCountry: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  transactionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
  },
}); 