import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

const MerchantLoansScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Grants');

  const tabs = ['Grants', 'Loans'];

  // Grant data - non-credit based financial resources
  const grants = [
    {
      id: 'micro-biz-grant-gpm',
      title: 'Micro Business Grant (GPM)',
      amount: 'Up to RM 50,000',
      overview: 'Up to 70% subsidy for capacity building & ICT adoption',
      deadline: 'Dec 31, 2025',
      provider: 'SME Corp Malaysia',
      icon: 'cash-outline',
      status: 'Eligible',
      statusColor: '#10B981',
      eligibility: {
        microEnterprise: true,
        localEquity60: true,
        validPremiseLicense: false,
        operating6months: true,
        excludedSector: false
      },
      labels: {
        microEnterprise: "Micro-enterprise",
        localEquity60: "≥ 60% local equity",
        validPremiseLicense: "Valid premise licence",
        operating6months: "Operating ≥ 6 months",
        excludedSector: "Not in excluded sectors"
      },
      link: "https://www.smecorp.gov.my/index.php/en/initiatives/2023-09-19-05-15-27/micro-business-grant-gpm"
    },
    {
      id: 'sme-digitalisation-initiative',
      title: 'SME Digitalisation Grant',
      amount: 'Up to RM 5,000',
      overview: '50% matching grant for digital tools & software',
      deadline: 'June 30, 2025',
      provider: 'MDEC',
      icon: 'laptop-outline',
      status: 'Eligible',
      statusColor: '#10B981',
      eligibility: {
        registeredSME: true,
        malaysianOwned: true,
        operating6months: true,
        turnoverMin50k: true
      },
      labels: {
        registeredSME: "Registered SME/Co-op",
        malaysianOwned: "Malaysian-owned",
        operating6months: "Operating ≥ 6 months",
        turnoverMin50k: "Turnover ≥ RM50k"
      },
      link: "https://www.mdec.my/msme-digitalisation-initiative"
    },
    {
      id: 'women-entrepreneur-funding',
      title: 'Women Entrepreneur Financing',
      amount: 'Up to RM 30,000',
      overview: 'Low interest financing for women-owned businesses',
      deadline: 'Ongoing',
      provider: 'Ministry of Women',
      icon: 'female-outline',
      status: 'Eligible',
      statusColor: '#10B981',
      eligibility: {
        womenOwned: true,
        businessAge1Year: true,
        malaysianCitizen: true
      },
      labels: {
        womenOwned: "Women-owned business",
        businessAge1Year: "Business age ≥ 1 year",
        malaysianCitizen: "Malaysian citizen"
      },
      link: "https://www.kpwkm.gov.my"
    },
    {
      id: 'penjana-tourism-financing',
      title: 'PENJANA Tourism Financing',
      amount: 'Up to RM 300,000',
      overview: 'Financing facility for tourism sector businesses',
      deadline: 'Sept 30, 2025',
      provider: 'Bank Negara Malaysia',
      icon: 'airplane-outline',
      status: 'Not Eligible',
      statusColor: '#F43F5E',
      eligibility: {
        tourismSector: false,
        affectedByPandemic: true,
        viableBusinessModel: true
      },
      labels: {
        tourismSector: "Tourism sector business",
        affectedByPandemic: "Affected by pandemic",
        viableBusinessModel: "Viable business model"
      },
      link: "https://www.bnm.gov.my"
    }
  ];

  // Loan data - credit score based offers
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

  // Partner offers - special financing options from platform partners
  const partnerOffers = [
    {
      id: 'partner-maybank',
      title: 'Maybank SME Financing',
      amount: 'Up to RM 500,000',
      interest: 'From 3.99% p.a.',
      requirements: 'Min. 2 years in business',
      logo: require('../../assets/default.jpg') // This would be the bank logo
    },
    {
      id: 'partner-alliance',
      title: 'Alliance CashFirst',
      amount: 'Up to RM 300,000',
      interest: 'From 4.25% p.a.',
      requirements: 'Min. annual turnover RM 120,000',
      logo: require('../../assets/default.jpg')
    }
  ];

  const getEligibilityStatusIcon = (status) => {
    if (status === true) {
      return <Ionicons name="checkmark-circle" size={16} color="#10B981" />;
    } else if (status === false) {
      return <Ionicons name="close-circle" size={16} color="#F43F5E" />;
    } else {
      return <Ionicons name="alert-circle" size={16} color="#F59E0B" />;
    }
  };

  const renderGrantItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.grantCard,
        { borderLeftColor: item.statusColor, borderLeftWidth: 4 }
      ]}
      onPress={() => { }}
    >
      <View style={styles.grantHeader}>
        <View style={styles.grantTitleSection}>
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.grantIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={item.icon} size={20} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={styles.grantTitle}>{item.title}</Text>
            <Text style={styles.grantProvider}>{item.provider}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.grantDetails}>
        <Text style={styles.grantOverview}>{item.overview}</Text>
        <View style={styles.grantInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.amount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Deadline: {item.deadline}</Text>
          </View>
        </View>
      </View>

      <View style={styles.eligibilitySection}>
        <Text style={styles.eligibilityTitle}>Eligibility:</Text>
        <View style={styles.eligibilityGrid}>
          {Object.entries(item.eligibility).slice(0, 3).map(([key, value]) => (
            <View key={key} style={styles.eligibilityItem}>
              {getEligibilityStatusIcon(value)}
              <Text style={styles.eligibilityText} numberOfLines={1}>{item.labels[key]}</Text>
            </View>
          ))}
        </View>
        {Object.keys(item.eligibility).length > 3 && (
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View all requirements</Text>
            <Ionicons name="chevron-down" size={16} color="#6366F1" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => { }}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderLoanItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.loanCard,
        { borderLeftColor: item.statusColor, borderLeftWidth: 4 }
      ]}
      onPress={() => { }}
    >
      <View style={styles.loanHeader}>
        <View>
          <Text style={styles.loanTitle}>{item.title}</Text>
          <Text style={styles.loanAmount}>{item.amount}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <View style={styles.loanDetailRow}>
          <View style={styles.loanDetailItem}>
            <Text style={styles.loanDetailLabel}>Interest Rate</Text>
            <Text style={styles.loanDetailValue}>{item.interest}</Text>
          </View>
          <View style={styles.loanDetailItem}>
            <Text style={styles.loanDetailLabel}>Term</Text>
            <Text style={styles.loanDetailValue}>{item.term}</Text>
          </View>
          <View style={styles.loanDetailItem}>
            <Text style={styles.loanDetailLabel}>Requirements</Text>
            <Text style={styles.loanDetailValue}>{item.eligibility}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => { }}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPartnerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partnerCard}
      onPress={() => { }}
    >
      <View style={styles.partnerHeader}>
        <Image source={item.logo} style={styles.partnerLogo} />
        <Text style={styles.partnerTitle}>{item.title}</Text>
      </View>

      <View style={styles.partnerDetails}>
        <View style={styles.partnerDetail}>
          <Text style={styles.partnerDetailLabel}>Amount</Text>
          <Text style={styles.partnerDetailValue}>{item.amount}</Text>
        </View>
        <View style={styles.partnerDetail}>
          <Text style={styles.partnerDetailLabel}>Interest</Text>
          <Text style={styles.partnerDetailValue}>{item.interest}</Text>
        </View>
        <View style={styles.partnerDetail}>
          <Text style={styles.partnerDetailLabel}>Requirements</Text>
          <Text style={styles.partnerDetailValue}>{item.requirements}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.learnMoreButton}
        onPress={() => { }}
      >
        <Text style={styles.learnMoreText}>Learn More</Text>
        <Ionicons name="arrow-forward" size={16} color="#6366F1" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Funding</Text>
        <View style={styles.placeholderButton} />
      </View>

      {/* Credit Score Banner */}
      <TouchableOpacity
        style={styles.creditScoreBanner}
        onPress={() => navigation.navigate('MerchantCreditScoreScreen')}
      >
        <View>
          <Text style={styles.creditScoreLabel}>Your Credit Score</Text>
          <Text style={styles.creditScoreValue}>782</Text>
          <Text style={styles.creditScoreRating}>Excellent</Text>
        </View>
        <View style={styles.creditScoreArrow}>
          <Ionicons name="arrow-forward-circle" size={32} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Tabs for different funding types */}
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

      {/* Content based on active tab */}
      <View style={styles.contentContainer}>
        {activeTab === 'Grants' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
            <FlatList
              data={grants}
              renderItem={renderGrantItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.tabContentHeader}>
                  <Text style={styles.tabContentTitle}>Available Grants</Text>
                  <Text style={styles.tabContentDescription}>
                    Government grants and subsidies that don't require credit score approval
                  </Text>
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => navigation.navigate('MSMETools', { screen: 'Resources' })}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#6366F1" style={styles.buttonIcon} />
                  <Text style={styles.linkButtonText}>Looking for business support resources?</Text>
                  <Ionicons name="arrow-forward" size={16} color="#6366F1" />
                </TouchableOpacity>
              }
            />
          </Animated.View>
        )}

        {activeTab === 'Loans' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
            <FlatList
              data={loans}
              renderItem={renderLoanItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.tabContentHeader}>
                  <Text style={styles.tabContentTitle}>Available Loans</Text>
                  <Text style={styles.tabContentDescription}>
                    Pre-approved loans based on your business credit score
                  </Text>
                </View>
              }
            />
          </Animated.View>
        )}

        {activeTab === 'Partner Offers' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
            <FlatList
              data={partnerOffers}
              renderItem={renderPartnerItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.tabContentHeader}>
                  <Text style={styles.tabContentTitle}>Partner Financing</Text>
                  <Text style={styles.tabContentDescription}>
                    Special financing options from our banking partners
                  </Text>
                </View>
              }
            />
          </Animated.View>
        )}
      </View>
    </View>
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
  creditScoreBanner: {
    margin: 16,
    padding: 20,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditScoreLabel: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  creditScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  creditScoreRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A5B4FC',
  },
  creditScoreArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
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
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  tabContentHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabContentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  tabContentDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  grantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  grantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  grantTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  grantIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  grantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  grantProvider: {
    fontSize: 13,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grantDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  grantOverview: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 12,
    lineHeight: 20,
  },
  grantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 13,
    color: Colors.textLight,
  },
  eligibilitySection: {
    marginBottom: 16,
  },
  eligibilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  eligibilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eligibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  eligibilityText: {
    marginLeft: 6,
    fontSize: 13,
    color: Colors.textLight,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewMoreText: {
    fontSize: 13,
    color: '#6366F1',
    marginRight: 4,
  },
  applyButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  loanAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  loanDetails: {
    marginBottom: 16,
  },
  loanDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loanDetailItem: {
    flex: 1,
  },
  loanDetailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  loanDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  partnerDetails: {
    marginBottom: 16,
  },
  partnerDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partnerDetailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  partnerDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 12,
  },
  learnMoreText: {
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
  },
  buttonIcon: {
    marginRight: 12,
  },
  linkButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
});

export default MerchantLoansScreen; 