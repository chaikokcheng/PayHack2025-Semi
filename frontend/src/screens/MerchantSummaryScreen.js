import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  sales: 12850.75,
  transactions: 342,
  avgOrder: 37.6,
  rating: 4.8,
  reviews: 1240,
  growth: 12.5,
  topProducts: [
    { name: 'Nasi Lemak', sales: 1200 },
    { name: 'Teh Tarik', sales: 950 },
    { name: 'Roti Canai', sales: 870 },
  ],
  salesTrend: [1200, 1350, 1400, 1500, 1600, 1700, 1800],
  paymentMethods: [
    { name: 'QR Pay', percent: 45, color: '#6366F1', icon: 'qr-code-outline' },
    { name: 'eWallet', percent: 30, color: '#10B981', icon: 'wallet-outline' },
    { name: 'Card', percent: 20, color: '#F59E0B', icon: 'card-outline' },
    { name: 'Cash', percent: 5, color: '#6B7280', icon: 'cash-outline' },
  ],
  demographics: [
    { label: 'Male', percent: 54, color: '#6366F1' },
    { label: 'Female', percent: 46, color: '#F472B6' },
    { label: '18-25', percent: 22, color: '#F59E0B' },
    { label: '26-35', percent: 38, color: '#10B981' },
    { label: '36-50', percent: 28, color: '#6366F1' },
    { label: '50+', percent: 12, color: '#6B7280' },
  ],
  hourlySales: [2, 4, 8, 12, 18, 22, 30, 40, 55, 60, 70, 80, 90, 100, 110, 120, 100, 80, 60, 40, 30, 20, 10, 5],
  refundRate: 1.2, // %
  customerComplaints: 3, // mock value, number of complaints this month
  topCustomers: [
    { name: 'Alice Tan', spent: 1200 },
    { name: 'John Lee', spent: 950 },
    { name: 'Siti Rahman', spent: 870 },
  ],
  recentTransactions: [
    { id: 1, name: 'Alice Tan', amount: 120, method: 'QR Pay', time: '2 min ago' },
    { id: 2, name: 'John Lee', amount: 85, method: 'eWallet', time: '10 min ago' },
    { id: 3, name: 'Siti Rahman', amount: 60, method: 'Card', time: '30 min ago' },
    { id: 4, name: 'Lim Wei', amount: 45, method: 'Cash', time: '1 hour ago' },
  ],
};

const services = [
  { icon: 'card-outline', title: 'Payment Solutions', desc: 'Accept QR, eWallet, card, and offline payments.' },
  { icon: 'megaphone-outline', title: 'Marketing Tools', desc: 'Campaigns, loyalty, and customer engagement.' },
  { icon: 'cash-outline', title: 'Finance & Loans', desc: 'Instant settlement, micro-loans, and cash advance.' },
  { icon: 'analytics-outline', title: 'Business Analytics', desc: 'Sales, customer, and product insights.' },
  { icon: 'shield-checkmark-outline', title: 'Fraud Protection', desc: 'AI-powered risk and fraud detection.' },
  { icon: 'cloud-upload-outline', title: 'Cloud Backup', desc: 'Secure data backup and export.' },
  { icon: 'medal-outline', title: 'Merchant Rewards', desc: 'Earn points and unlock exclusive perks.' },
  { icon: 'star-half-outline', title: 'Credit Scoring', desc: 'AI-powered business credit score.' },
];

const creditScore = {
  score: 782,
  level: 'Excellent',
  factors: [
    { label: 'Sales Volume', value: 'High', icon: 'trending-up-outline' },
    { label: 'Transaction Count', value: 'Frequent', icon: 'repeat-outline' },
    { label: 'Disputes', value: 'Low', icon: 'shield-checkmark-outline' },
    { label: 'Customer Rating', value: '4.8/5', icon: 'star-outline' },
    { label: 'Repayment', value: 'On Time', icon: 'time-outline' },
  ],
};

export default function MerchantSummaryScreen({ navigation }) {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
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
                    <View
                      key={idx}
                      style={{
                        flex: 1,
                        height: 60 + val / 40,
                        backgroundColor: '#6366F1',
                        borderRadius: 8,
                        marginHorizontal: 2,
                        opacity: 0.8,
                        minWidth: 0,
                      }}
                    />
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
                    <View key={i} style={{ flex: 1, height: val, backgroundColor: `rgba(99,102,241,${0.2 + val/120})`, marginHorizontal: 1, borderRadius: 4, minWidth: 4, maxWidth: 12 }} />
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
                    <Ionicons name={pm.icon} size={28} color={pm.color} />
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
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {dashboardData.recentTransactions.map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="swap-horizontal-outline" size={20} color="#6366F1" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#222', fontWeight: '600', flex: 1 }}>{t.name}</Text>
                  <Text style={{ color: '#6366F1', marginRight: 8 }}>{t.method}</Text>
                  <Text style={{ color: '#10B981', fontWeight: '700', marginRight: 8 }}>RM {t.amount}</Text>
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
            <TouchableOpacity
              style={styles.serviceButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MerchantCreditScoreScreen')}
            >
              <Ionicons name="star-half-outline" size={24} color="#6366F1" style={{ marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>Credit Scoring</Text>
                <Text style={styles.serviceDesc}>AI-powered business credit score.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6366F1" />
            </TouchableOpacity>
            {/* Render the rest of the services except Credit Scoring */}
            {services.filter(s => s.title !== 'Credit Scoring').map((s, i) => (
              <React.Fragment key={i}>
                <TouchableOpacity
                  style={styles.serviceButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (s.title === 'Finance & Loans') {
                      navigation.navigate('MerchantLoansScreen');
                    }
                    if (s.title === 'E-Invoicing & Taxation') {
                      navigation.navigate('MerchantTaxScreen');
                    }
                  }}
                >
                  <Ionicons name={s.icon} size={24} color="#6366F1" style={{ marginRight: 14 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{s.title}</Text>
                    <Text style={styles.serviceDesc}>{s.desc}</Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
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