import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  Animated,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const qrScaleAnim = useRef(new Animated.Value(0)).current;

  // QR animation functions
  const openQRModal = () => {
    setQrModalVisible(true);
    Animated.spring(qrScaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeQRModal = () => {
    Animated.timing(qrScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setQrModalVisible(false));
  };

  // Merchant bank account data
  const merchantAccount = {
    bankName: "Maybank Business",
    accountNumber: "5123 4567 8912 3456",
    balance: 5432.10,
    accountHolder: "Kok Cheng Enterprise",
  };

  // Business Insights data with enhanced fields (renamed from AI Insights)
  const businessInsights = [
    {
      title: "Credit Score Improved",
      description: "Your business credit score has improved by 35 points due to consistent payments and positive transaction history.",
      actionLabel: "View Score",
      actionScreen: "MerchantCreditScoreScreen",
      icon: "trending-up",
      color: "#10B981",
      gradient: ['#10B981', '#059669'],
      iconBackground: '#ECFDF5',
      illustration: '📈'
    },
    {
      title: "MSME Resources Available",
      description: "New government grants are available for businesses like yours. Apply before the deadline to secure funding.",
      actionLabel: "Learn More",
      actionScreen: "msme-plugin/MSMEResourcesScreen",
      icon: "book",
      color: "#6366F1",
      gradient: ['#6366F1', '#4F46E5'],
      iconBackground: '#EEF2FF',
      illustration: '📚'
    },
    {
      title: "Cash Flow Alert",
      description: "Your expenses are trending 15% higher than last month. Take action now to maintain healthy financial balance.",
      actionLabel: "View Details",
      actionScreen: "msme-plugin/AccountingScreen",
      icon: "alert-circle",
      color: "#F59E0B",
      gradient: ['#F59E0B', '#D97706'],
      iconBackground: '#FFFBEB',
      illustration: '💸'
    }
  ];

  // Hot topics for community
  const hotTopics = [
    {
      title: "Bulk purchasing group",
      participants: 24,
      active: true
    },
    {
      title: "Supply chain disruption",
      participants: 18,
      active: true
    }
  ];

  // Recent resource programs - Updated with more relevant information and eligibility indicators
  const recentPrograms = [
    {
      title: "MSME Digital Grant",
      deadline: "June 30, 2025",
      amount: "Up to RM 5,000",
      status: "Eligible",
      statusColor: "#10B981",
      icon: "laptop-outline",
      eligible: true
    },
    {
      title: "Business Growth Fund",
      deadline: "July 15, 2025",
      amount: "Up to RM 10,000",
      status: "Review",
      statusColor: "#F59E0B",
      icon: "trending-up",
      eligible: null
    },
    {
      title: "Women Entrepreneur Program",
      deadline: "August 1, 2025",
      amount: "Up to RM 8,000",
      status: "Eligible",
      statusColor: "#10B981",
      icon: "female",
      eligible: true
    }
  ];

  // Business tools with vibrant design - focused on resources and community
  const businessTools = [
    {
      id: 1,
      title: "Community",
      description: "Connect with local businesses",
      icon: "people",
      color: "#10B981",
      gradient: ['#10B981', '#059669'],
      screen: "msme-plugin/CommunityScreen",
      hotTopics: hotTopics
    },
    {
      id: 2,
      title: "Resources",
      description: "Access grants & support",
      icon: "book",
      color: "#6366F1",
      gradient: ['#6366F1', '#4F46E5'],
      screen: "msme-plugin/MSMEResourcesScreen"
    },
    {
      id: 3,
      title: "Accounting",
      description: "Financial tracking & reports",
      icon: "bar-chart",
      color: "#EC4899",
      gradient: ['#EC4899', '#DB2777'],
      screen: "msme-plugin/AccountingScreen"
    },
    {
      id: 4,
      title: "Bulk Purchase",
      description: "Group buy with other MSMEs",
      icon: "cart",
      color: "#F59E0B",
      gradient: ['#F59E0B', '#D97706'],
      screen: "msme-plugin/BulkPurchaseScreen"
    }
  ];

  // Business metrics data for analytics
  const businessMetrics = {
    salesToday: 1245.80,
    transactionsToday: 42,
    averageOrder: 29.66,
    repeatCustomers: '68%',
    monthlySales: [4200, 4800, 5100, 5400, 5200, 6100, 5800, 6200, 6400, 7100, 7300, 7500]
  };

  // Effect for animating insights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInsightIndex(prev => (prev + 1) % businessInsights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScreenSafeArea style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Animated Header */}
        <Animated.View style={[
          styles.header,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -50],
                  extrapolate: 'clamp',
                }),
              }
            ],
          }
        ]}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.userName}>Kok Cheng</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('ChatbotScreen')}
            >
              <Ionicons name="chatbubble" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications" size={24} color={Colors.primary} />
                <View style={styles.notificationDot} />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Merchant Account with QR Section - Updated so QR is directly scannable */}
        <View style={styles.accountSection}>
          <View style={styles.accountCard}>
            <View style={styles.accountDetails}>
              <View style={styles.bankInfo}>
                <Text style={styles.bankName}>{merchantAccount.bankName}</Text>
                <Text style={styles.accountHolderName}>{merchantAccount.accountHolder}</Text>
                <Text style={styles.accountNumber}>{merchantAccount.accountNumber}</Text>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  RM {merchantAccount.balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.qrContainer}>
                <TouchableOpacity
                  style={styles.qrPlaceholder}
                  onPress={openQRModal}
                >
                  <Image
                    source={require('../../assets/QR.png')}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={openQRModal}
                >
                  <Text style={styles.expandButtonText}>Expand</Text>
                  <Ionicons name="resize" size={12} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Analytics and Credit Score Section - New combined section with modern two-column layout */}
        <View style={styles.analyticsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Performance</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AnalyticsScreen')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Credit Score & Analytics combined card */}
          <TouchableOpacity
            style={styles.analyticsCard}
            onPress={() => navigation.navigate('MerchantCreditScoreScreen')}
          >
            <View style={styles.analyticsContent}>
              {/* Left Column - Chart/Big Number */}
              <View style={styles.analyticsLeftColumn}>
                <View style={styles.creditScoreCircleContainer}>
                  <View style={styles.creditScoreCircle}>
                    <Text style={styles.creditScoreValue}>782</Text>
                  </View>
                  <Text style={styles.creditScoreLevel}>Excellent</Text>
                  <Text style={styles.creditScoreTitle}>Credit Score</Text>
                </View>

                <View style={styles.miniChartContainer}>
                  <Text style={styles.miniChartLabel}>Monthly Sales</Text>
                  <View style={styles.barChart}>
                    {businessMetrics.monthlySales.map((value, index) => (
                      <View
                        key={index}
                        style={[
                          styles.barChartBar,
                          {
                            height: (value / Math.max(...businessMetrics.monthlySales)) * 40,
                            backgroundColor: index === businessMetrics.monthlySales.length - 1 ? Colors.primary : '#A7F3D0'
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Right Column - Data Points */}
              <View style={styles.analyticsRightColumn}>
                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>RM {businessMetrics.salesToday}</Text>
                    <Text style={styles.metricLabel}>Today's Sales</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{businessMetrics.transactionsToday}</Text>
                    <Text style={styles.metricLabel}>Transactions</Text>
                  </View>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>RM {businessMetrics.averageOrder}</Text>
                    <Text style={styles.metricLabel}>Average Order</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{businessMetrics.repeatCustomers}</Text>
                    <Text style={styles.metricLabel}>Repeat Customers</Text>
                  </View>
                </View>

                <View style={styles.creditFactors}>
                  <Text style={styles.creditFactorsTitle}>Credit Score Factors</Text>
                  <View style={styles.factorBadges}>
                    <View style={styles.factorBadge}>
                      <Ionicons name="time" size={12} color="#10B981" />
                      <Text style={styles.factorBadgeText}>On-Time Payments</Text>
                    </View>
                    <View style={styles.factorBadge}>
                      <Ionicons name="trending-up" size={12} color="#10B981" />
                      <Text style={styles.factorBadgeText}>Growing Sales</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Business Insights Carousel - Renamed from AI Business Insights */}
        <View style={styles.insightsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Insights</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.insightsCarousel}
            snapToInterval={width - 32}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const index = Math.floor(e.nativeEvent.contentOffset.x / (width - 48));
              setActiveInsightIndex(index);
            }}
          >
            {businessInsights.map((insight, index) => (
              <TouchableOpacity
                key={index}
                style={styles.insightCard}
                onPress={() => navigation.navigate(insight.actionScreen)}
              >
                <LinearGradient
                  colors={insight.gradient}
                  style={styles.insightGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.insightContent}>
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIconContainer, { backgroundColor: insight.iconBackground }]}>
                        <Ionicons name={insight.icon} size={24} color={insight.color} />
                      </View>
                      <View style={styles.insightIllustration}>
                        <Text style={styles.insightEmoji}>{insight.illustration}</Text>
                      </View>
                    </View>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                    <View style={styles.insightActionContainer}>
                      <Text style={styles.insightActionText}>{insight.actionLabel}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Carousel Indicator */}
          <View style={styles.carouselIndicator}>
            {businessInsights.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  index === activeInsightIndex ? styles.indicatorActive : {}
                ]}
              />
            ))}
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.communitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Discussion</Text>
            <TouchableOpacity onPress={() => navigation.navigate('msme-plugin/CommunityScreen')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topicsContainer}>
            {hotTopics.map((topic, index) => (
              <TouchableOpacity
                key={index}
                style={styles.topicCard}
                onPress={() => navigation.navigate('msme-plugin/CommunityScreen')}
              >
                <View style={styles.topicHeader}>
                  <View style={styles.activeIndicator} />
                  <Text style={styles.activeText}>Active now</Text>
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <View style={styles.topicFooter}>
                  <View style={styles.participantCircle}>
                    <Ionicons name="people" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.participantText}>{topic.participants} participants</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resources Section - Updated to match Community Section style */}
        <View style={styles.resourcesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Resources</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MSMETools', { screen: 'Resources' })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resourcesContainer}>
            {recentPrograms.slice(0, 2).map((program, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceCard}
                onPress={() => navigation.navigate('MSMETools', { screen: 'Resources' })}
              >
                <View style={styles.resourceHeader}>
                  <View style={[styles.resourceStatusIndicator, { backgroundColor: program.statusColor }]} />
                  <Text style={styles.resourceStatusText}>{program.status}</Text>
                </View>
                <Text style={styles.resourceTitle}>{program.title}</Text>
                <View style={styles.resourceInfo}>
                  <View style={styles.resourceIconContainer}>
                    <LinearGradient
                      colors={['#6366F1', '#4F46E5']}
                      style={styles.resourceIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={program.icon} size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.resourceDetails}>
                    <Text style={styles.resourceAmount}>{program.amount}</Text>
                    <View style={styles.resourceDeadline}>
                      <Ionicons name="time-outline" size={12} color="#6B7280" />
                      <Text style={styles.resourceDeadlineText}>Ends: {program.deadline}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewMoreResourcesButton}
            onPress={() => navigation.navigate('MSMETools', { screen: 'Resources' })}
          >
            <Text style={styles.viewMoreResourcesText}>Explore All Resources</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </Animated.ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeQRModal}
      >
        <TouchableOpacity
          style={styles.qrModalOverlay}
          activeOpacity={1}
          onPress={closeQRModal}
        >
          <Animated.View
            style={[
              styles.qrModalContent,
              {
                transform: [
                  { scale: qrScaleAnim },
                ]
              }
            ]}
          >
            <Image
              source={require('../../assets/QR.png')}
              style={styles.expandedQrImage}
              resizeMode="contain"
            />
            <Text style={styles.qrModalText}>Merchant Payment QR Code</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeQRModal}
            >
              <Ionicons name="close-circle" size={36} color={Colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    zIndex: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    marginLeft: 8,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  accountSection: {
    paddingTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankInfo: {
    flex: 2,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  accountHolderName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  accountNumber: {
    fontSize: 15,
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  qrPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  qrImage: {
    width: 90,
    height: 90,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  expandButtonText: {
    fontSize: 10,
    color: Colors.primary,
    marginRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightsCarousel: {
    paddingHorizontal: 16,
  },
  insightCard: {
    width: width - 32,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  insightContent: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightIllustration: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightEmoji: {
    fontSize: 36,
  },
  insightTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  insightDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  insightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  insightActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  carouselIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: Colors.primary,
    width: 16,
  },
  // New Analytics Section styles
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  analyticsContent: {
    flexDirection: 'row',
    padding: 16,
  },
  analyticsLeftColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    paddingRight: 12,
  },
  analyticsRightColumn: {
    flex: 1.5,
    paddingLeft: 12,
  },
  creditScoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  creditScoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.primary,
    marginBottom: 8,
  },
  creditScoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  creditScoreTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  creditScoreLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  miniChartContainer: {
    alignItems: 'center',
  },
  miniChartLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    width: '100%',
    justifyContent: 'space-between',
  },
  barChartBar: {
    width: 4,
    backgroundColor: '#A7F3D0',
    borderRadius: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    paddingHorizontal: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  creditFactors: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
  },
  creditFactorsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  factorBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  factorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  factorBadgeText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  toolsSection: {
    marginBottom: 24,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginRight: '4%',
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  hotTopicsContainer: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 8,
  },
  hotTopicsTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  hotTopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hotTopicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  hotTopicText: {
    fontSize: 10,
    color: '#4B5563',
    flex: 1,
  },
  hotTopicCount: {
    fontSize: 9,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
  },
  resourcesPreview: {
    marginTop: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  resourcesPreviewText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '500',
  },
  footerSpace: {
    height: 60,
  },
  qrModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  qrModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expandedQrImage: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 300,
    maxHeight: 300,
  },
  qrModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  closeButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: 'white',
    borderRadius: 18,
  },
  communitySection: {
    marginBottom: 24,
  },
  resourcesSection: {
    marginBottom: 24,
  },
  topicsContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  topicFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  participantText: {
    fontSize: 12,
    color: '#4B5563',
  },
  resourcesContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  resourceStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIconContainer: {
    marginRight: 12,
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceDetails: {
    flex: 1,
  },
  resourceAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  resourceDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceDeadlineText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  viewMoreResourcesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  viewMoreResourcesText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
  programsContainer: {
    paddingHorizontal: 16,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  programIconContainer: {
    marginRight: 16,
  },
  programIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programContent: {
    flex: 1,
  },
  programTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  programAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  programDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programDeadlineText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  programStatusBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  programStatusText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '500',
  },
}); 