import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function MerchantLoansScreen({ navigation }) {
  const [loanTab, setLoanTab] = useState('Suggested');

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={28} color="#6366F1" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Finance & Loans</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <View style={styles.loanTabBar}>
            {['Suggested', 'All'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.loanTab, loanTab === tab && styles.activeLoanTab]}
                onPress={() => setLoanTab(tab)}
              >
                <Text style={[styles.loanTabText, loanTab === tab && styles.activeLoanTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {loanOffers[loanTab.toLowerCase()].map((loan, idx) => (
            <View key={idx} style={styles.loanCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name={loan.icon} size={28} color="#6366F1" style={{ marginRight: 12 }} />
                <Text style={styles.loanProvider}>{loan.loanName}</Text>
                {loan.partnership && (
                  <View style={styles.partnerBadge}>
                    <Text style={styles.partnerBadgeText}>Partner</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={styles.loanAmount}>{loan.amount}</Text>
                <Text style={styles.loanRate}> • {loan.rate}</Text>
                <Text style={styles.loanTerm}> • {loan.term}</Text>
              </View>
              <Text style={styles.loanDesc}>{loan.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
  loanTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  loanTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  activeLoanTab: {
    backgroundColor: '#fff',
    borderBottomWidth: 3,
    borderColor: '#6366F1',
  },
  loanTabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeLoanTabText: {
    color: '#6366F1',
    fontWeight: '700',
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  loanProvider: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  partnerBadge: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  partnerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  loanAmount: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
  loanRate: {
    fontSize: 15,
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 8,
  },
  loanTerm: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  loanDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
}); 