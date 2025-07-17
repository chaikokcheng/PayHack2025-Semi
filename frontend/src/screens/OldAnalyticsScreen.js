import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const expenseData = [
  { category: 'Groceries', amount: 450.75, icon: 'basket', color: '#FF6B6B' },
  { category: 'Transport', amount: 120.50, icon: 'car', color: '#4ECDC4' },
  { category: 'Dining', amount: 310.00, icon: 'restaurant', color: '#45B7D1' },
  { category: 'Shopping', amount: 650.25, icon: 'pricetag', color: '#F7B801' },
  { category: 'Utilities', amount: 180.00, icon: 'water', color: '#5F6368' },
];

const spendingTrendData = [
  { week: 'W1', amount: 350 },
  { week: 'W2', amount: 420 },
  { week: 'W3', amount: 390 },
  { week: 'W4', amount: 510 },
];

const topMerchantsData = [
  { name: 'Jaya Grocer', amount: 280.50, icon: 'basket' },
  { name: 'Shell', amount: 120.00, icon: 'car' },
  { name: 'Starbucks', amount: 95.70, icon: 'cafe' },
  { name: 'Uniqlo', amount: 250.00, icon: 'shirt' },
];

export default function OldAnalyticsScreen({ navigation }) {
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ScreenSafeArea style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Financial Insights</Text>
          <TouchableOpacity>
            <Ionicons name="filter-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Expense Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Expense Overview</Text>
          <View style={styles.expenseCard}>
            <Text style={styles.totalExpenseLabel}>Total Spending</Text>
            <Text style={styles.totalExpenseAmount}>RM {totalExpense.toFixed(2)}</Text>
            <View style={styles.expenseChart}>
              {expenseData.map((item, index) => {
                const percentage = (item.amount / totalExpense) * 100;
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: item.color,
                      width: `${percentage}%`,
                      height: 12,
                      borderTopLeftRadius: index === 0 ? 6 : 0,
                      borderBottomLeftRadius: index === 0 ? 6 : 0,
                      borderTopRightRadius: index === expenseData.length - 1 ? 6 : 0,
                      borderBottomRightRadius: index === expenseData.length - 1 ? 6 : 0,
                    }}
                  />
                );
              })}
            </View>
            <View style={styles.legendContainer}>
              {expenseData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.category}</Text>
                  <Text style={styles.legendAmount}>RM {item.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* AI Chatbot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Financial Assistant</Text>
          <TouchableOpacity
            style={styles.chatbotCard}
            onPress={() => navigation.navigate('Chatbot')}
          >
            <LinearGradient
              colors={Colors.gradientPurple}
              style={styles.chatbotGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.chatbotContent}>
                <Ionicons name="sparkles" size={28} color="white" />
                <View style={styles.chatbotTextContainer}>
                  <Text style={styles.chatbotTitle}>Ask SatuPay AI</Text>
                  <Text style={styles.chatbotSubtitle}>How can I save on groceries?</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Spending Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Spending Trend</Text>
          <View style={styles.chartCard}>
            {/* Simple Line Chart */}
          </View>
        </View>

        {/* Top Merchants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Merchants</Text>
          <View style={styles.chartCard}>
            {topMerchantsData.map((merchant, index) => (
              <View key={index} style={styles.merchantItem}>
                <Ionicons name={merchant.icon} size={20} color={Colors.primary} style={styles.merchantIcon} />
                <Text style={styles.merchantName}>{merchant.name}</Text>
                <Text style={styles.merchantAmount}>RM {merchant.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Smart Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="bulb-outline" size={24} color={Colors.primary} />
            <Text style={styles.insightText}>Your spending on <Text style={{ fontWeight: 'bold' }}>Dining</Text> is 15% higher this month. Consider checking out some deals in the app!</Text>
          </View>
        </View>

      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  expenseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalExpenseLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  totalExpenseAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.text,
    marginVertical: 8,
  },
  expenseChart: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  chatbotCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  chatbotGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  chatbotContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatbotTextContainer: {
    marginLeft: 16,
  },
  chatbotTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  chatbotSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  merchantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  merchantIcon: {
    marginRight: 16,
  },
  merchantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  merchantAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 16,
    padding: 20,
  },
  insightText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
}); 