import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const MerchantCreditScoreScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'History', 'Factors'];

  // Sample credit score data
  const creditScore = {
    score: 782,
    rating: 'Excellent',
    previousScore: 745,
    scoreChange: 37,
    lastUpdated: '2 weeks ago',
    historyData: [
      { month: 'Jul', score: 680 },
      { month: 'Aug', score: 710 },
      { month: 'Sep', score: 720 },
      { month: 'Oct', score: 745 },
      { month: 'Nov', score: 782 },
    ],
    factors: [
      {
        factor: 'Payment History',
        status: 'Excellent',
        score: 95,
        description: 'You have consistently made on-time payments to suppliers and lenders.',
        icon: 'checkmark-circle',
        color: '#10B981'
      },
      {
        factor: 'Credit Utilization',
        status: 'Very Good',
        score: 85,
        description: 'You are using a moderate amount of your available credit.',
        icon: 'trending-up',
        color: '#10B981'
      },
      {
        factor: 'Business Age',
        status: 'Good',
        score: 75,
        description: 'Your business has been operating for 2+ years.',
        icon: 'calendar',
        color: '#10B981'
      },
      {
        factor: 'Payment Volume',
        status: 'Good',
        score: 78,
        description: 'Your business has consistent payment transaction history.',
        icon: 'cash',
        color: '#10B981'
      },
      {
        factor: 'Industry Risk',
        status: 'Fair',
        score: 65,
        description: 'Your industry has moderate risk factors.',
        icon: 'business',
        color: '#F59E0B'
      }
    ]
  };

  // Loan data - credit score based offers (copied from MerchantLoansScreen)
  const loans = [
    {
      id: 'business-growth-loan',
      title: 'Business Growth Loan',
      amount: 'Up to RM 100,000',
      interest: '4.5% p.a.',
      term: '1-5 years',
      eligibility: 'Credit score 650+',
      status: 'Eligible',
      statusColor: '#10B981'
    },
    {
      id: 'working-capital-loan',
      title: 'Working Capital Loan',
      amount: 'Up to RM 50,000',
      interest: '5.2% p.a.',
      term: '6 months - 3 years',
      eligibility: 'Credit score 600+',
      status: 'Eligible',
      statusColor: '#10B981'
    },
    {
      id: 'equipment-financing',
      title: 'Equipment Financing',
      amount: 'Up to RM 200,000',
      interest: '4.8% p.a.',
      term: '3-7 years',
      eligibility: 'Credit score 700+',
      status: 'Review Needed',
      statusColor: '#F59E0B'
    }
  ];

  // Grant opportunities that don't require credit score
  const grantOpportunities = [
    {
      id: 'micro-biz-grant-gpm',
      title: 'Micro Business Grant (GPM)',
      provider: 'SME Corp Malaysia',
      amount: 'Up to RM 50,000',
      overview: 'Up to 70% subsidy for capacity building',
      deadline: 'Dec 31, 2025',
      icon: 'cash-outline'
    },
    {
      id: 'sme-digitalisation-initiative',
      title: 'SME Digitalisation Grant',
      provider: 'MDEC',
      amount: 'Up to RM 5,000',
      overview: '50% matching grant for digital tools',
      deadline: 'June 30, 2025',
      icon: 'laptop-outline'
    }
  ];

  // Render loan item (copied from MerchantLoansScreen)
  const renderLoanItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        { borderLeftColor: item.statusColor, borderLeftWidth: 4 }
      ]}
      onPress={() => { }}
    >
      <View style={styles.productHeader}>
        <View>
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productProvider}>{item.amount}</Text>
        </View>
        <View style={[styles.eligibilityBadge, { backgroundColor: item.statusColor + '20' }]}>
          <Text style={[styles.eligibilityBadgeText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.productDetailsContainer}>
        <View style={styles.productDetail}>
          <Text style={styles.detailLabel}>Interest Rate</Text>
          <Text style={styles.detailValue}>{item.interest}</Text>
        </View>
        <View style={styles.productDetail}>
          <Text style={styles.detailLabel}>Term</Text>
          <Text style={styles.detailValue}>{item.term}</Text>
        </View>
        <View style={styles.productDetail}>
          <Text style={styles.detailLabel}>Requirements</Text>
          <Text style={styles.detailValue}>{item.eligibility}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => { }}
      >
        <Text style={styles.viewAllButtonText}>Apply Now</Text>
        <Ionicons name="arrow-forward" size={16} color="#6366F1" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render grant item
  const renderGrantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.grantCard}
      onPress={() => navigation.navigate('MerchantLoansScreen', { initialTab: 'Grants' })}
    >
      <View style={styles.grantIconContainer}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={styles.grantIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={20} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <View style={styles.grantInfo}>
        <Text style={styles.grantTitle}>{item.title}</Text>
        <Text style={styles.grantProvider}>{item.provider}</Text>
        <Text style={styles.grantAmount}>{item.amount}</Text>
        <View style={styles.grantDeadlineContainer}>
          <Ionicons name="time-outline" size={12} color="#6B7280" />
          <Text style={styles.grantDeadline}>Deadline: {item.deadline}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFactorItem = ({ item }) => (
    <View style={styles.factorCard}>
      <View style={styles.factorHeader}>
        <Ionicons name={item.icon} size={24} color={item.color} />
        <Text style={styles.factorTitle}>{item.factor}</Text>
        <View style={[styles.factorBadge, { backgroundColor: `${item.color}20` }]}>
          <Text style={[styles.factorBadgeText, { color: item.color }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.factorScoreContainer}>
        <View style={styles.factorScoreBar}>
          <View
            style={[
              styles.factorScoreFill,
              { width: `${item.score}%`, backgroundColor: item.color }
            ]}
          />
        </View>
        <Text style={styles.factorScoreValue}>{item.score}/100</Text>
      </View>
      <Text style={styles.factorDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credit Score</Text>
        <View style={styles.placeholderButton} />
      </View>

      {/* Score Card */}
      <View style={styles.scoreCardContainer}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={styles.scoreCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>Your Business Credit Score</Text>
            <Text style={styles.scoreValue}>{creditScore.score}</Text>
            <Text style={styles.scoreRating}>{creditScore.rating}</Text>
            <View style={styles.scoreChangeBadge}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.scoreChangeText}>+{creditScore.scoreChange} since last month</Text>
            </View>
          </View>
          <View style={styles.scoreCircleContainer}>
            <View style={styles.scoreCircle}>
              <View style={styles.scoreCircleInner}>
                <Text style={styles.scoreCircleText}>{creditScore.score}</Text>
              </View>
            </View>
            <Text style={styles.lastUpdatedText}>Last updated {creditScore.lastUpdated}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'Overview' && (
          <ScrollView>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recommended Financial Products</Text>
              <Text style={styles.sectionSubtitle}>Based on your credit score</Text>

              {/* Render loans as in Business Funding page */}
              {loans.map((loan) => (
                <React.Fragment key={loan.id}>
                  {renderLoanItem({ item: loan })}
                </React.Fragment>
              ))}

              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('MerchantLoansScreen', { initialTab: 'Loans' })}
              >
                <Text style={styles.viewAllButtonText}>View All Financial Products</Text>
                <Ionicons name="arrow-forward" size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>

            {/* Grant Opportunities Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Grant Opportunities</Text>
                <Text style={styles.creditNotRequired}>No Credit Score Required</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Government grants available for your business</Text>

              <View style={styles.grantsContainer}>
                {grantOpportunities.map((grant) => (
                  <TouchableOpacity
                    key={grant.id}
                    style={styles.grantCard}
                    onPress={() => navigation.navigate('MerchantLoansScreen', { initialTab: 'Grants' })}
                  >
                    <View style={styles.grantIconContainer}>
                      <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        style={styles.grantIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name={grant.icon} size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <View style={styles.grantInfo}>
                      <Text style={styles.grantTitle}>{grant.title}</Text>
                      <Text style={styles.grantProvider}>{grant.provider}</Text>
                      <Text style={styles.grantAmount}>{grant.amount}</Text>
                      <View style={styles.grantDeadlineContainer}>
                        <Ionicons name="time-outline" size={12} color="#6B7280" />
                        <Text style={styles.grantDeadline}>Deadline: {grant.deadline}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('MerchantLoansScreen', { initialTab: 'Grants' })}
              >
                <Text style={styles.viewAllButtonText}>Explore Business Resources</Text>
                <Ionicons name="arrow-forward" size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>

            <View style={styles.tipContainer}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="bulb" size={24} color="#F59E0B" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>How to Improve Your Score</Text>
                <Text style={styles.tipText}>Make timely payments, keep credit utilization low, and maintain consistent business activity to boost your score.</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === 'History' && (
          <ScrollView style={styles.historyContainer}>
            <View style={styles.historyChart}>
              <View style={styles.chartBars}>
                {creditScore.historyData.map((item, index) => (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={styles.chartBarLabels}>
                      <Text style={styles.chartBarValue}>{item.score}</Text>
                    </View>
                    <View style={styles.chartBarWrapper}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: (item.score / 850) * 150,
                            backgroundColor: index === creditScore.historyData.length - 1 ? '#6366F1' : '#A5B4FC'
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.chartBarMonth}>{item.month}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.historyDetails}>
              <Text style={styles.historyTitle}>Score History</Text>
              <Text style={styles.historyDescription}>
                Your credit score has increased by {creditScore.scoreChange} points in the last month due to improved payment history and business activity.
              </Text>

              <View style={styles.historyTimelineContainer}>
                {creditScore.historyData.map((item, index) => (
                  <View key={index} style={styles.historyTimelineItem}>
                    <View style={[
                      styles.historyTimelineDot,
                      { backgroundColor: index === creditScore.historyData.length - 1 ? '#6366F1' : '#A5B4FC' }
                    ]} />
                    <View style={styles.historyTimelineContent}>
                      <Text style={styles.historyTimelineDate}>{item.month}, 2024</Text>
                      <Text style={styles.historyTimelineScore}>{item.score}</Text>
                      {index < creditScore.historyData.length - 1 && (
                        <Text style={styles.historyTimelineChange}>
                          {creditScore.historyData[index + 1].score - item.score > 0 ? '+' : ''}
                          {creditScore.historyData[index + 1].score - item.score}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === 'Factors' && (
          <FlatList
            data={creditScore.factors}
            renderItem={renderFactorItem}
            keyExtractor={(item) => item.factor}
            contentContainerStyle={styles.factorsContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  placeholderButton: {
    width: 40,
  },
  scoreCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  scoreRating: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  scoreChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  scoreChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  scoreCircleContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreCircleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  sectionContainer: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  creditNotRequired: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  productProvider: {
    fontSize: 13,
    color: Colors.textLight,
  },
  eligibilityBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  eligibilityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  productDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  productDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginRight: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  historyContainer: {
    padding: 16,
  },
  historyChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarLabels: {
    marginBottom: 8,
  },
  chartBarValue: {
    fontSize: 12,
    color: Colors.textLight,
  },
  chartBarWrapper: {
    width: 24,
    height: 150,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
  },
  chartBarMonth: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
  historyDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  historyDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  historyTimelineContainer: {
    marginTop: 8,
  },
  historyTimelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyTimelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  historyTimelineContent: {
    flex: 1,
  },
  historyTimelineDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 2,
  },
  historyTimelineScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 2,
  },
  historyTimelineChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  factorsContainer: {
    padding: 16,
  },
  factorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginLeft: 12,
  },
  factorBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  factorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  factorScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginRight: 12,
  },
  factorScoreFill: {
    height: 8,
    borderRadius: 4,
  },
  factorScoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  factorDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  grantsContainer: {
    marginBottom: 8,
  },
  grantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  grantIconContainer: {
    marginRight: 16,
  },
  grantIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantInfo: {
    flex: 1,
  },
  grantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  grantProvider: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  grantAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  grantDeadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grantDeadline: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
});

export default MerchantCreditScoreScreen; 