import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// Copy loanOffers mock data from MerchantCreditScoreScreen
const loanOffers = {
  suggested: [
    {
      provider: 'PayHack Capital',
      loanName: 'Working Capital Loan',
      amount: 'RM 50,000',
      rate: '3.5% p.a.',
      term: '12 months',
      description: 'Fast approval, no collateral required.',
      icon: 'cash-outline',
      partnership: true,
    },
    {
      provider: 'Maybank SME',
      loanName: 'SME Flexi Loan',
      amount: 'RM 30,000',
      rate: '4.2% p.a.',
      term: '18 months',
      description: 'Special SME partnership offer.',
      icon: 'business-outline',
      partnership: true,
    },
  ],
  all: [
    {
      provider: 'PayHack Capital',
      loanName: 'Working Capital Loan',
      amount: 'RM 50,000',
      rate: '3.5% p.a.',
      term: '12 months',
      description: 'Fast approval, no collateral required.',
      icon: 'cash-outline',
      partnership: true,
    },
    {
      provider: 'Maybank SME',
      loanName: 'SME Flexi Loan',
      amount: 'RM 30,000',
      rate: '4.2% p.a.',
      term: '18 months',
      description: 'Special SME partnership offer.',
      icon: 'business-outline',
      partnership: true,
    },
    {
      provider: 'CIMB BizLoan',
      loanName: 'BizLoan Express',
      amount: 'RM 20,000',
      rate: '4.8% p.a.',
      term: '24 months',
      description: 'Flexible repayment, instant disbursement.',
      icon: 'card-outline',
      partnership: true,
    },
    {
      provider: 'OCBC Partner',
      loanName: 'OCBC Short-Term Loan',
      amount: 'RM 15,000',
      rate: '5.0% p.a.',
      term: '6 months',
      description: 'Short-term working capital.',
      icon: 'briefcase-outline',
      partnership: true,
    },
    {
      provider: 'Other Fintech',
      loanName: 'Micro Loan',
      amount: 'RM 10,000',
      rate: '6.2% p.a.',
      term: '3 months',
      description: 'Quick micro-loan for urgent needs.',
      icon: 'flash-outline',
      partnership: true,
    },
  ],
};
const { width } = Dimensions.get('window');

const dashboardData = {
  sales: 1200 * 2 + 950 * 1.5 + 870 * 2.5 + 800 * 1.8, // RM 2400 + 1425 + 2175 + 1440 = RM 7430
  transactions: 400, // Example
  avgOrder: 18.60, // Example: total sales / transactions
  rating: 4.8,
  reviews: 1240,
  growth: 12.5,
  topProducts: [
    { name: 'Ondeh-ondeh', sales: 300 },
    { name: 'Kuih Lapis', sales: 950 },
    { name: 'Seri Muka', sales: 870 },
    { name: 'Kuih Talam', sales: 800 },
  ],
  salesTrend: [1200, 1750, 900, 2100, 1400, 1950, 1100],
  paymentMethods: [
    { name: 'SatuPay', percent: 70, color: '#E91E63', icon: 'satupay_logo' },
    { name: 'Card', percent: 20, color: '#F59E0B', icon: 'card-outline' },
    { name: 'Cash', percent: 10, color: '#6B7280', icon: 'cash-outline' },
  ],
  demographics: [
    { label: 'Male', percent: 54, color: '#6366F1' },
    { label: 'Female', percent: 46, color: '#F472B6' },
    { label: '18-25', percent: 22, color: '#F59E0B' },
    { label: '26-35', percent: 38, color: '#10B981' },
    { label: '36-50', percent: 28, color: '#6366F1' },
    { label: '50+', percent: 12, color: '#6B7280' },
  ],
  hourlySales: [110, 60, 30, 15, 10, 18, 25, 40, 30, 60, 80, 130, 110, 120, 100, 80, 60, 40, 55, 90, 120, 110, 130, 120],
  refundRate: 1.2, // %
  customerComplaints: 3, // mock value, number of complaints this month
  topCustomers: [
    { name: 'Alice Tan', spent: 1200 },
    { name: 'John Lee', spent: 950 },
    { name: 'Siti Rahman', spent: 870 },
  ],
  recentTransactions: [
    { id: 1, name: 'Alice Tan', amount: 6.80, method: 'SatuPay', time: '2 min ago' }, // 2x Seri Muka + 1x Kuih Talam
    { id: 2, name: 'John Lee', amount: 4.00, method: 'Card', time: '10 min ago' }, // 2x Ondeh-ondeh
    { id: 3, name: 'Siti Rahman', amount: 3.00, method: 'Cash', time: '30 min ago' }, // 2x Kuih Lapis
    { id: 4, name: 'Lim Wei', amount: 5.00, method: 'SatuPay', time: '1 hour ago' }, // 2x Seri Muka
  ],
};

const services = [
  {
    icon: 'star-half-outline',
    title: 'Credit Scoring',
    desc: 'AI-powered business credit score.',
    screen: 'MerchantCreditScoreScreen'
  },
  {
    icon: 'cash-outline',
    title: 'Business Funding',
    desc: 'Instant settlement, micro-loans, grants, and cash advance.',
    screen: 'MerchantLoansScreen'
  },
  {
    icon: 'cube-outline',
    title: 'Inventory Manager',
    desc: 'Track products, stock levels, and get restock alerts.',
    screen: 'InventoryScreen'
  },
  {
    icon: 'calculator-outline',
    title: 'Financial Tools',
    desc: 'Simple calculators and tools for business finances.',
    screen: 'AccountingScreen'
  },
  {
    icon: 'cart-outline',
    title: 'Save and Share',
    desc: 'Buy in bulk, swap ingredients, and sell excess stock to reduce costs.',
    screen: 'BulkPurchaseScreen'
  },
  { icon: 'megaphone-outline', title: 'Marketing Tools', desc: 'Campaigns, loyalty, and customer engagement.' },
  { icon: 'analytics-outline', title: 'Business Analytics', desc: 'Sales, customer, and product insights.' },
];

export default function MerchantSummaryScreen({ navigation: propNavigation }) {
  const navigation = propNavigation || useNavigation();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showCreditScore, setShowCreditScore] = useState(false);
  const [showLoans, setShowLoans] = useState(false);
  const [loanTab, setLoanTab] = useState('Suggested');

  // Add E-Invoicing & Taxation to the services array if not present
  if (!services.some(s => s.title === 'E-Invoicing & Taxation')) {
    services.push({
      icon: 'document-text-outline',
      title: 'E-Invoicing & Taxation',
      desc: 'Generate e-invoices, manage tax filing, and submit to authorities.'
    });
  }

  // Reorder services so that 'Credit Scoring', 'Business Funding', and 'E-Invoicing & Taxation' are the first three
  const orderedServices = [
    services.find(s => s.title === 'Credit Scoring'),
    services.find(s => s.title === 'Business Funding'),
    services.find(s => s.title === 'E-Invoicing & Taxation'),
    ...services.filter(s => !['Credit Scoring', 'Business Funding', 'E-Invoicing & Taxation'].includes(s.title)),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Business Hub</Text>
        <Text style={styles.headerSubtitle}>Manage your business with smart tools and insights</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['Dashboard', 'Service'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
            onPress={() => { setActiveTab(tab); setShowCreditScore(false); }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {activeTab === 'Dashboard' ? (
          <>
            {/* 1. Sales Overview */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Sales Overview</Text>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.salesTotalValue}>RM {dashboardData.sales.toLocaleString()}</Text>
                <Text style={styles.salesTotalLabel}>Total Sales</Text>
              </View>
              <View style={styles.row}>
                <View style={styles.metricBox}>
                  <Ionicons name="swap-horizontal-outline" size={28} color="#6366F1" />
                  <Text style={styles.metricValue}>{dashboardData.transactions}</Text>
                  <Text style={styles.metricLabel}>Transactions</Text>
                </View>
                <View style={styles.metricBox}>
                  <Ionicons name="trending-up-outline" size={28} color="#F59E0B" />
                  <Text style={styles.metricValue}>{dashboardData.growth}%</Text>
                  <Text style={styles.metricLabel}>Growth</Text>
                </View>
                <View style={styles.metricBox}>
                  <Ionicons name="star-outline" size={28} color="#FBBF24" />
                  <Text style={styles.metricValue}>{dashboardData.rating}</Text>
                  <Text style={styles.metricLabel}>Rating</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.metricBox}>
                  <Ionicons name="people-outline" size={28} color="#6366F1" />
                  <Text style={styles.metricValue}>{dashboardData.reviews}</Text>
                  <Text style={styles.metricLabel}>Reviews</Text>
                </View>
                <View style={styles.metricBox}>
                  <Ionicons name="receipt-outline" size={28} color="#10B981" />
                  <Text style={styles.metricValue}>RM {dashboardData.avgOrder}</Text>
                  <Text style={styles.metricLabel}>Avg. Order</Text>
                </View>
              </View>
            </View>
            {/* 2. Sales Trend (Mock Chart) */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Sales Trend</Text>
              <View style={styles.chartContainer}>
                <View style={styles.chartBarBg}>
                  {dashboardData.salesTrend.map((val, idx) => (
                    <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#222', fontWeight: '600', marginBottom: 2 }}>{val}</Text>
                      <View
                        style={{
                          height: 60 + val / 40,
                          width: '80%',
                          backgroundColor: '#6366F1',
                          borderRadius: 8,
                          marginHorizontal: 2,
                          opacity: 0.8,
                          minWidth: 0,
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View style={styles.chartLabels}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                    <Text key={i} style={styles.chartLabel}>{d}</Text>
                  ))}
                </View>
              </View>
            </View>
            {/* 3. Hourly Sales Heatmap */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Hourly Sales Heatmap</Text>
              <View style={styles.heatmapContainer}>
                <View style={styles.heatmapBarRow}>
                  {dashboardData.hourlySales.map((val, i) => (
                    <View key={i} style={{ flex: 1, height: val, backgroundColor: `rgba(99,102,241,${0.2 + val / 120})`, marginHorizontal: 1, borderRadius: 4, minWidth: 4, maxWidth: 12 }} />
                  ))}
                </View>
                <View style={styles.heatmapLabels}>
                  <Text style={styles.heatmapLabel}>0h</Text>
                  <Text style={styles.heatmapLabel}>6h</Text>
                  <Text style={styles.heatmapLabel}>12h</Text>
                  <Text style={styles.heatmapLabel}>18h</Text>
                  <Text style={styles.heatmapLabel}>24h</Text>
                </View>
              </View>
            </View>
            {/* 4. Payment Method Breakdown */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment Method Breakdown</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10 }}>
                {dashboardData.paymentMethods.map((pm, i) => (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    {pm.icon === 'satupay_logo' ? (
                      <Image source={require('../../assets/satupay_logo.png')} style={{ width: 28, height: 28, resizeMode: 'contain', marginBottom: 2 }} />
                    ) : (
                      <Ionicons name={pm.icon} size={28} color={pm.color} />
                    )}
                    <Text style={{ fontWeight: '700', color: pm.color, fontSize: 16 }}>{pm.percent}%</Text>
                    <Text style={{ color: '#222', fontSize: 13 }}>{pm.name}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginTop: 8 }}>
                {dashboardData.paymentMethods.map((pm, i) => (
                  <View key={i} style={{ flex: pm.percent, backgroundColor: pm.color }} />
                ))}
              </View>
            </View>
            {/* 5. Top Products */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Top Products</Text>
              {dashboardData.topProducts.map((p, i) => (
                <View key={i} style={styles.productRow}>
                  <Ionicons name="pricetag-outline" size={22} color="#6366F1" style={{ marginRight: 10 }} />
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productSales}>{p.sales} sold</Text>
                </View>
              ))}
            </View>
            {/* 6. Top Customers */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Top Customers</Text>
              {dashboardData.topCustomers.map((c, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="person-circle-outline" size={24} color="#6366F1" style={{ marginRight: 10 }} />
                  <Text style={{ fontWeight: '700', color: '#222', fontSize: 15, flex: 1 }}>{c.name}</Text>
                  <Text style={{ color: '#10B981', fontWeight: '700' }}>RM {c.spent}</Text>
                </View>
              ))}
            </View>
            {/* 7. Recent Transactions */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AllTransactionsScreen')} style={{ padding: 4, alignSelf: 'center' }}>
                  <Ionicons name="chevron-forward" size={22} color="#6366F1" style={{ marginTop: 1 }} />
                </TouchableOpacity>
              </View>
              {dashboardData.recentTransactions.map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="swap-horizontal-outline" size={20} color="#6366F1" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#222', fontWeight: '600', flex: 1 }}>{t.name}</Text>
                  <Text style={{ color: '#6366F1', marginRight: 8 }}>{t.method}</Text>
                  <Text style={{ color: '#10B981', fontWeight: '700', marginRight: 8 }}>RM {t.amount.toFixed(2)}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 12 }}>{t.time}</Text>
                </View>
              ))}
            </View>
            {/* 8. Refund & Customer Complaints */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Refund & Customer Complaints</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="refresh-circle-outline" size={32} color="#F59E0B" />
                  <Text style={{ fontWeight: '700', color: '#F59E0B', fontSize: 16 }}>{dashboardData.refundRate}%</Text>
                  <Text style={{ color: '#222', fontSize: 13 }}>Refund</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color="#EF4444" />
                  <Text style={{ fontWeight: '700', color: '#EF4444', fontSize: 16 }}>{dashboardData.customerComplaints}</Text>
                  <Text style={{ color: '#222', fontSize: 13 }}>Complaints</Text>
                </View>
              </View>
            </View>
            {/* 9. Customer Demographics */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Customer Demographics</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {dashboardData.demographics.map((d, i) => (
                  <View key={i} style={{ width: '48%', marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: d.color, marginRight: 8 }} />
                    <Text style={{ fontWeight: '700', color: '#222', fontSize: 15 }}>{d.label}</Text>
                    <Text style={{ color: '#6366F1', marginLeft: 6 }}>{d.percent}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Service List as Buttons (no card container) */}
            <Text style={styles.sectionTitle}>Merchant Services</Text>
            {/* Credit Scoring button at the top */}
            {orderedServices.map((s, i) => (
              s && (
                <TouchableOpacity
                  key={s.title}
                  style={styles.serviceButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (s.title === 'Credit Scoring') {
                      navigation.navigate('MerchantCreditScoreScreen');
                    } else if (s.title === 'Business Funding') {
                      navigation.navigate('MerchantLoansScreen');
                    } else if (s.title === 'E-Invoicing & Taxation') {
                      navigation.navigate('MerchantTaxScreen');
                    } else if (s.screen === 'InventoryScreen') {
                      navigation.navigate('Inventory');
                    } else if (s.screen === 'AccountingScreen') {
                      navigation.navigate('FinancialTools');
                    } else if (s.screen === 'BulkPurchaseScreen') {
                      navigation.navigate('BulkPurchase');
                    }
                  }}
                >
                  <Ionicons name={s.icon} size={24} color="#6366F1" style={{ marginRight: 14 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{s.title}</Text>
                    <Text style={styles.serviceDesc}>{s.desc}</Text>
                  </View>
                  {/* Add arrow for navigable services */}
                  {(s.title === 'Credit Scoring' || s.title === 'Business Funding' ||
                    s.title === 'E-Invoicing & Taxation' || s.screen) && (
                      <Ionicons name="chevron-forward" size={20} color="#6366F1" />
                    )}
                </TouchableOpacity>
              )
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  closeButton: {
    padding: 4,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#6366F1',
    backgroundColor: '#fff',
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  productSales: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  chartBarBg: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 8,
    width: '100%',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
    minWidth: 0,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  creditScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditScoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F59E0B',
  },
  creditScoreLevel: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
  creditFactors: {
    marginTop: 10,
  },
  creditFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  creditFactorLabel: {
    fontSize: 14,
    color: '#222',
    marginRight: 4,
  },
  creditFactorValue: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  creditScoreNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    fontStyle: 'italic',
  },
  salesTotalValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    textAlign: 'center',
  },
  salesTotalLabel: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  heatmapContainer: {
    marginTop: 60, // increased from 10
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  heatmapBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    width: '100%',
    marginBottom: 4,
    marginTop: 0, // ensure no negative margin
  },
  heatmapLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  heatmapLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
});

// Mock AllTransactionsScreen for navigation
export function AllTransactionsScreen({ navigation }) {
  // All transactions use only kuih items
  const transactions = [
    { id: 1, name: 'Alice Tan', amount: 6.80, method: 'SatuPay', date: '2024-07-01 10:15', time: '10:15', type: 'in' }, // 2x Seri Muka + 1x Kuih Talam
    { id: 2, name: 'John Lee', amount: 4.00, method: 'Card', date: '2024-07-01 09:50', time: '09:50', type: 'in' }, // 2x Ondeh-ondeh
    { id: 3, name: 'Siti Rahman', amount: 3.00, method: 'Cash', date: '2024-06-30 18:22', time: '18:22', type: 'in' }, // 2x Kuih Lapis
    { id: 4, name: 'Lim Wei', amount: 5.00, method: 'SatuPay', date: '2024-06-30 15:10', time: '15:10', type: 'in' }, // 2x Seri Muka
    { id: 5, name: 'Aisha Noor', amount: 4.50, method: 'Card', date: '2024-06-29 14:05', time: '14:05', type: 'in' }, // 3x Kuih Lapis
    { id: 6, name: 'Muthu Kumar', amount: 3.60, method: 'Cash', date: '2024-06-29 11:30', time: '11:30', type: 'in' }, // 2x Kuih Talam
    { id: 7, name: 'Siti Rahman', amount: 2.00, method: 'SatuPay', date: '2024-06-28 17:45', time: '17:45', type: 'in' }, // 1x Ondeh-ondeh
    { id: 8, name: 'Alice Tan', amount: 2.50, method: 'Card', date: '2024-06-28 10:00', time: '10:00', type: 'in' }, // 1x Seri Muka
    { id: 9, name: 'John Lee', amount: 1.80, method: 'Cash', date: '2024-06-27 19:20', time: '19:20', type: 'in' }, // 1x Kuih Talam
    { id: 10, name: 'Lim Wei', amount: 3.50, method: 'SatuPay', date: '2024-06-27 13:10', time: '13:10', type: 'in' }, // 1x Seri Muka + 1x Kuih Lapis
  ];
  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E5E7EB', elevation: 2 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={28} color="#6366F1" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#222' }}>All Transactions</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {transactions.map(txn => (
          <TouchableOpacity
            key={txn.id}
            style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 }}
            onPress={() => navigation.navigate('TransactionDetailScreen', { txn })}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: '#222', fontSize: 16 }}>{txn.name}</Text>
              <Text style={{ color: '#6B7280', fontSize: 13 }}>{txn.date} • {txn.method}</Text>
            </View>
            <Text style={{ fontWeight: '700', color: txn.type === 'in' ? '#22C55E' : '#EF4444', fontSize: 16, marginLeft: 12 }}>
              {txn.type === 'in' ? '+' : '-'}RM {txn.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// Mock TransactionDetailScreen for navigation
export function TransactionDetailScreen({ route, navigation }) {
  const { txn } = route.params || {};
  if (!txn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <Text style={{ color: '#888', fontSize: 16 }}>No transaction data.</Text>
      </View>
    );
  }
  const items = mockItems[txn.id] || [];
  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E5E7EB', elevation: 2 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={28} color="#6366F1" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#222' }}>Transaction Details</Text>
      </View>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 12 }}>{txn.name}</Text>
        <Text style={{ color: '#6B7280', fontSize: 15, marginBottom: 8 }}>Date: {txn.date}</Text>
        <Text style={{ color: '#6B7280', fontSize: 15, marginBottom: 8 }}>Time: {txn.time}</Text>
        <Text style={{ color: '#6B7280', fontSize: 15, marginBottom: 8 }}>Payment Method: {txn.method}</Text>
        <Text style={{ color: '#6B7280', fontSize: 15, marginBottom: 8 }}>Type: Received</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#22C55E', marginTop: 16 }}>
          +RM {txn.amount}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#222', marginTop: 24, marginBottom: 8 }}>Items Ordered</Text>
        {items.length === 0 ? (
          <Text style={{ color: '#888', fontSize: 15 }}>No items found.</Text>
        ) : (
          items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: '#222', fontSize: 15 }}>{item.name} x{item.qty}</Text>
              <Text style={{ color: '#6366F1', fontWeight: '700', fontSize: 15 }}>RM {(item.price * item.qty).toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

// Update mockItems mapping for each transaction
const mockItems = {
  1: [{ name: 'Seri Muka', qty: 2, price: 2.5 }, { name: 'Kuih Talam', qty: 1, price: 1.8 }],
  2: [{ name: 'Ondeh-ondeh', qty: 2, price: 2.0 }],
  3: [{ name: 'Kuih Lapis', qty: 2, price: 1.5 }],
  4: [{ name: 'Seri Muka', qty: 2, price: 2.5 }],
  5: [{ name: 'Kuih Lapis', qty: 3, price: 1.5 }],
  6: [{ name: 'Kuih Talam', qty: 2, price: 1.8 }],
  7: [{ name: 'Ondeh-ondeh', qty: 1, price: 2.0 }],
  8: [{ name: 'Seri Muka', qty: 1, price: 2.5 }],
  9: [{ name: 'Kuih Talam', qty: 1, price: 1.8 }],
  10: [{ name: 'Seri Muka', qty: 1, price: 2.5 }, { name: 'Kuih Lapis', qty: 1, price: 1.5 }],
}; 