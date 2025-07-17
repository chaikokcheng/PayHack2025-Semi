import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polygon } from 'react-native-svg';

const creditScore = {
  score: 782,
  level: 'Excellent',
  factors: [
    { label: 'Sales Volume', value: 'High', icon: 'trending-up-outline' },
    { label: 'Transaction Count', value: 'Frequent', icon: 'repeat-outline' },
    { label: 'Customer Rating', value: '4.8/5', icon: 'star-outline' },
    { label: 'Repayment', value: 'On Time', icon: 'time-outline' },
  ],
};

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

export default function MerchantCreditScoreScreen({ navigation }) {
  const [loanTab, setLoanTab] = useState('Suggested');
  const [gaugeBarWidth, setGaugeBarWidth] = useState(0);

  const loansToShow = loanTab === 'Suggested' ? loanOffers.suggested : loanOffers.all;

  // Gauge configuration
  const minScore = 300;
  const maxScore = 850;
  const score = creditScore.score;
  const scorePercent = (score - minScore) / (maxScore - minScore);
  const gaugeSegments = [
    { label: 'Poor', color: '#ef4444', range: [300, 579] },
    { label: 'Fair', color: '#f97316', range: [580, 669] },
    { label: 'Good', color: '#fde047', range: [670, 739] },
    { label: 'Very Good', color: '#22c55e', range: [740, 799] },
    { label: 'Excellent', color: '#166534', range: [800, 850] },
  ];

  // Find the current level and color
  const currentSegment = gaugeSegments.find(seg => score >= seg.range[0] && score <= seg.range[1]);
  const currentLevel = currentSegment?.label || '';
  const currentColor = currentSegment?.color || '#6366F1';

  // Calculate marker position: center of the current segment
  let markerLeft = 0;
  if (gaugeBarWidth > 0 && currentSegment) {
    const segmentIndex = gaugeSegments.findIndex(seg => seg.label === currentLevel);
    const segmentWidth = gaugeBarWidth / gaugeSegments.length;
    markerLeft = segmentIndex * segmentWidth + segmentWidth / 2 - 12; // 12 is half marker width
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={28} color="#6366F1" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Merchant Credit Score</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Merchant Credit Score</Text>
          {/* Score and Level above the gauge */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={[styles.creditScoreValue, { color: currentColor }]}>{score}</Text>
            <Text style={[styles.creditScoreLevel, { color: currentColor }]}>{currentLevel}</Text>
          </View>
          {/* Horizontal Gauge Bar */}
          <View style={styles.gaugeContainer}>
            <View
              style={styles.gaugeBarBg}
              onLayout={e => setGaugeBarWidth(e.nativeEvent.layout.width)}
            >
              {gaugeSegments.map((seg, i) => (
                <View
                  key={i}
                  style={[
                    styles.gaugeSegment,
                    {
                      backgroundColor: seg.color,
                      borderTopLeftRadius: i === 0 ? 20 : 0,
                      borderBottomLeftRadius: i === 0 ? 20 : 0,
                      borderTopRightRadius: i === gaugeSegments.length - 1 ? 20 : 0,
                      borderBottomRightRadius: i === gaugeSegments.length - 1 ? 20 : 0,
                    },
                  ]}
                />
              ))}
              {/* Score Marker */}
              <View
                style={[
                  styles.gaugeMarker,
                  { left: markerLeft, top: -18 },
                ]}
              >
               {/* SVG Downward-pointing triangle */}
               <Svg width={24} height={14} style={{ alignSelf: 'center' }}>
                 <Polygon points="12,14 0,0 24,0" fill="black" />
               </Svg>
              </View>
            </View>
            {/* Labels below segments */}
            <View style={styles.gaugeLabelsRow}>
              {gaugeSegments.map((seg, i) => (
                <Text key={i} style={[styles.gaugeLabel, { color: seg.color }]}>{seg.label}</Text>
              ))}
            </View>
          </View>
          <View style={styles.creditFactors}>
            {creditScore.factors.map((f, i) => (
              <View key={i} style={styles.creditFactor}>
                <Ionicons name={f.icon} size={20} color="#6366F1" style={{ marginRight: 8 }} />
                <Text style={styles.creditFactorLabel}>{f.label}:</Text>
                <Text style={styles.creditFactorValue}>{f.value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.creditScoreNote}>AI-powered credit scoring based on business performance and payment history. Accepted by all our partner loan providers.</Text>
        </View>
        {/* Loan Offers Section */}
        <View style={styles.loanSection}>
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
          {loansToShow.map((loan, i) => (
            <View key={i} style={styles.loanCard}>
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
  loanSection: {
    marginTop: 10,
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
  // Add styles for gauge
  gaugeContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  gaugeBarBg: {
    flexDirection: 'row',
    height: 28,
    borderRadius: 20,
    backgroundColor: '#eee',
    position: 'relative',
    overflow: 'visible',
  },
  gaugeSegment: {
    flex: 1,
    height: '100%',
  },
  gaugeMarker: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 44,
    alignItems: 'center',
    zIndex: 2,
  },
  gaugeMarkerTick: {
    width: 4,
    height: 28,
    borderRadius: 2,
    marginBottom: -6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  gaugeMarkerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    marginTop: -8,
    alignSelf: 'center',
  },
  gaugeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gaugeLabel: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  gaugeMarkerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'black',
    alignSelf: 'center',
},
  gaugeMarkerTriangleInverted: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'black',
    alignSelf: 'center',
},
  gaugeMarkerTriangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'black',
    borderTopWidth: 0,
    alignSelf: 'center',
},
}); 