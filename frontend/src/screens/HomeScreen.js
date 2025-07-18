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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { OnboardingContext } from '../../App';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const { setShowOnboarding } = React.useContext(OnboardingContext);

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
      useNativeDriverF: true,
    }).start();
  };

  const closeQRModal = () => {
    Animated.timing(qrScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setQrModalVisible(false));
  };

  // For demo: allow restarting onboarding via navigation param or fallback
  const restartOnboarding = route?.params?.restartOnboarding;

  useEffect(() => {
    if (restartOnboarding) {
      navigation.setParams({ restartOnboarding });
    }
  }, [navigation, restartOnboarding]);

  // Merchant bank account data
  const merchantAccount = {
    bankName: "Maybank Business",
    accountNumber: "5123 4567 8912 3456",
    balance: 5432.10,
    accountHolder: "Fatimah's Kuih",
  };

  // Business Insights data - Update to AI Insights
  const aiInsights = [
    {
      title: "Best Seller Today",
      description: "Kuih Lapis sold the most today – 28 pieces!",
      actionLabel: "Create Promo",
      actionScreen: "MerchantMenuScreen",
      icon: "trending-up",
      color: "#10B981",
      gradient: ['#10B981', '#059669'],
      iconBackground: '#ECFDF5',
      type: "positive"
    },
    {
      title: "Sales Drop Alert",
      description: "Ondeh-ondeh sold 35% less than last week. Consider a discount?",
      actionLabel: "Add Promo",
      actionScreen: "MerchantMenuScreen",
      icon: "trending-down",
      color: "#EF4444",
      gradient: ['#EF4444', '#DC2626'],
      iconBackground: '#FEF2F2',
      type: "problem"
    },
    {
      title: "Estimated Profit",
      description: "You've earned RM187.50 so far today. 45 orders of kuih completed!",
      actionLabel: "View Report",
      actionScreen: "AnalyticsScreen",
      icon: "cash",
      color: "#3B82F6",
      gradient: ['#3B82F6', '#2563EB'],
      iconBackground: '#EFF6FF',
      type: "info"
    },
    {
      title: "Peak Time Reminder",
      description: "Most kuih sales between 7-9am. Ensure you're fully stocked for morning rush!",
      actionLabel: "Set Reminder",
      actionScreen: "MerchantMenuScreen",
      icon: "time",
      color: "#F59E0B",
      gradient: ['#F59E0B', '#D97706'],
      iconBackground: '#FFFBEB',
      type: "suggestion"
    },
    {
      title: "Low Stock Alert",
      description: "Kuih ondeh-ondeh stock low (5 left). Prepare more before tomorrow.",
      actionLabel: "Update Stock",
      actionScreen: "Inventory",
      icon: "warning",
      color: "#EF4444",
      gradient: ['#EF4444', '#DC2626'],
      iconBackground: '#FEF2F2',
      type: "problem"
    },
    {
      title: "You're Growing!",
      description: "Your kuih sales increased 12% compared to last week. Great job!",
      actionLabel: "See Details",
      actionScreen: "MerchantSummaryScreen",
      icon: "stats-chart",
      color: "#10B981",
      gradient: ['#10B981', '#059669'],
      iconBackground: '#ECFDF5',
      type: "positive"
    }
  ];

  // Recent resource programs 
  const recentPrograms = [
    {
      title: "Business Advisory Service",
      category: "Business Support",
      overview: "Free consultation on business strategy and growth",
      provider: "SME Corp Malaysia",
      deadline: "Ongoing",
      status: "Eligible",
      statusColor: "#10B981",
      icon: "people-outline",
      eligible: true
    },
    {
      title: "Digital Skills Workshop",
      category: "Training",
      overview: "Free workshops on social media marketing",
      provider: "MDEC",
      deadline: "Monthly sessions",
      status: "Review",
      statusColor: "#F59E0B",
      icon: "laptop-outline",
      eligible: null
    },
    {
      title: "Women Entrepreneurship Network",
      category: "Women Programs",
      overview: "Networking and mentorship opportunities",
      provider: "Women Entrepreneur Network",
      deadline: "Open membership",
      status: "Eligible",
      statusColor: "#10B981",
      icon: "female",
      eligible: true
    }
  ];

  // Business metrics data for analytics
  const businessMetrics = {
    salesToday: 1245.80,
    transactionsToday: 42,
    averageOrder: 3.66,
    repeatCustomers: '68%',
    monthlySales: [4200, 4800, 5100, 5400, 5200, 6100, 5800, 6200, 6400, 7100, 7300, 7500]
  };

  // Effect for animating insights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInsightIndex(prev => (prev + 1) % aiInsights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // CommunityPosts
  const communityPosts = [
    {
      id: 1,
      author: "Sarah Lee",
      avatar: require('../../assets/default.jpg'), // Would be user avatar
      authorPosition: "Small Business Owner",
      timeAgo: "2 hours ago",
      topic: "Marketing",
      title: "Tips for promoting your business on social media",
      content: "I've found that posting consistently at the same time every day has really helped grow my audience. Also, engaging with comments quickly shows customers you care.",
      likes: 24,
      comments: 7,
      tags: ["social media", "growth"]
    },
    {
      id: 2,
      author: "Ahmad Rizal",
      avatar: require('../../assets/default.jpg'), // Would be user avatar
      authorPosition: "F&B Entrepreneur",
      timeAgo: "5 hours ago",
      topic: "Digital Payments",
      title: "DuitNow QR implementation experience",
      content: "Just implemented DuitNow QR for my cafe and it's boosted sales by 15%! The setup process was simple but had a few challenges with the bank integration.",
      likes: 31,
      comments: 12,
      tags: ["payments", "digital", "DuitNow"]
    }
  ];

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
            <Text style={styles.userName}>Fatimah</Text>
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

        {/* Merchant Account Section */}
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

        {/* Analytics and Credit Score Section */}
        <View style={styles.analyticsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Business Pulse</Text>
          </View>

          <View style={styles.analyticsCard}>
            <TouchableOpacity
              style={styles.pulseContent}
              onPress={() => navigation.navigate('Merchant', { screen: 'MerchantSummaryScreen' })}
            >
              {/* Left Column - Score Ring */}
              <View style={styles.pulseLeftColumn}>
                <View style={styles.creditScoreCircleContainer}>
                  <View style={styles.creditScoreCircle}>
                    <Text style={styles.creditScoreValue}>782</Text>
                  </View>
                  <Text style={styles.creditScoreLevel}>Excellent</Text>
                  <Text style={styles.creditScoreTitle}>Credit Score</Text>
                </View>
              </View>

              {/* Middle Column - Today's Metrics */}
              <View style={styles.pulseMiddleColumn}>
                <View style={styles.metricContainer}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="cash-outline" size={16} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>RM {businessMetrics.salesToday}</Text>
                    <Text style={styles.metricLabel}>Today's Sales</Text>
                  </View>
                </View>

                <View style={styles.metricContainer}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="receipt-outline" size={16} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{businessMetrics.transactionsToday}</Text>
                    <Text style={styles.metricLabel}>Orders</Text>
                  </View>
                </View>

                <View style={styles.metricContainer}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="repeat-outline" size={16} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{businessMetrics.repeatCustomers}</Text>
                    <Text style={styles.metricLabel}>Repeat Customers</Text>
                  </View>
                </View>
              </View>

              {/* Right Column - Mini Chart */}
              <View style={styles.pulseRightColumn}>
                <Text style={styles.miniChartLabel}>7-Day Sales</Text>
                <View style={styles.sparklineChart}>
                  {businessMetrics.monthlySales.slice(-7).map((value, index) => (
                    <View
                      key={index}
                      style={[
                        styles.sparklineBar,
                        {
                          height: (value / Math.max(...businessMetrics.monthlySales.slice(-7))) * 40,
                          backgroundColor: index === 6 ? Colors.primary : '#A7F3D0'
                        }
                      ]}
                    />
                  ))}
                </View>
              </View>
            </TouchableOpacity>

            {/* Smart Action CTA */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Merchant', { screen: 'MerchantLoansScreen' })}
            >
              <LinearGradient
                colors={['#F0FDF4', '#DCFCE7']}
                style={styles.smartActionContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.smartActionContent}>
                  <View style={styles.smartActionLeft}>
                    <View style={styles.smartActionIconContainer}>
                      <LinearGradient
                        colors={['#22C55E', '#16A34A']}
                        style={styles.smartActionIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name="cash-outline" size={18} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <View style={styles.smartActionTextContainer}>
                      <Text style={styles.smartActionTitle}>SME Working Capital Loan</Text>
                      <Text style={styles.smartActionSubtitle}>Pre-approved for up to RM50K</Text>
                    </View>
                  </View>
                  <View style={styles.smartActionArrow}>
                    <Ionicons name="arrow-forward" size={20} color="#16A34A" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Insights Carousel - Redesigned for compactness */}
        <View style={styles.insightsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.insightsCarousel}
            snapToInterval={width - 120}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const index = Math.floor(e.nativeEvent.contentOffset.x / (width - 120));
              setActiveInsightIndex(index);
            }}
          >
            {aiInsights.map((insight, index) => {
              // Determine if insight is clickable
              const isClickable =
                (insight.title === "Low Stock Alert" && insight.icon === "warning") ||
                (insight.title === "You're Growing!" && insight.icon === "stats-chart");

              // Wrap content in TouchableOpacity only if clickable
              const CardComponent = isClickable ? TouchableOpacity : View;

              return (
                <CardComponent
                  key={index}
                  style={styles.insightCardCompact}
                  onPress={isClickable ? () => {
                    if (insight.title === "Low Stock Alert") {
                      navigation.navigate('Merchant', { screen: 'Inventory' });
                    } else if (insight.title === "You're Growing!") {
                      navigation.navigate('Merchant', { screen: 'MerchantSummaryScreen' });
                    }
                  } : undefined}
                >
                  <LinearGradient
                    colors={insight.gradient}
                    style={styles.insightGradientCompact}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.insightContentCompact}>
                      <View style={styles.insightHeaderCompact}>
                        <View style={[styles.insightIconContainerCompact, { backgroundColor: insight.iconBackground }]}>
                          <Ionicons name={insight.icon} size={16} color={insight.color} />
                        </View>
                        <Text style={styles.insightTitleCompact}>{insight.title}</Text>
                      </View>
                      <Text style={styles.insightDescriptionCompact}>{insight.description}</Text>
                      <View style={[
                        styles.insightActionContainerCompact,
                        isClickable ? styles.clickableInsightAction : styles.nonClickableInsightAction
                      ]}>
                        <Text style={styles.insightActionTextCompact}>{insight.actionLabel}</Text>
                        {isClickable && <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />}
                      </View>
                    </View>
                  </LinearGradient>
                </CardComponent>
              );
            })}
          </ScrollView>

          {/* Carousel Indicator */}
          <View style={styles.carouselIndicator}>
            {aiInsights.map((_, index) => (
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

        {/* Community Section - Updated with real posts */}
        <View style={styles.communitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Discussion</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Community' })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postsContainer}>
            {communityPosts.slice(0, 1).map((post, index) => (
              <TouchableOpacity
                key={index}
                style={styles.postCard}
                onPress={() => navigation.navigate('Home', { screen: 'Community' })}
              >
                <View style={styles.postHeader}>
                  <View style={styles.postAuthorSection}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>{post.author.split(' ').map(name => name[0]).join('')}</Text>
                    </View>
                    <View style={styles.authorInfo}>
                      <Text style={styles.authorName}>{post.author}</Text>
                      <Text style={styles.postTime}>{post.timeAgo}</Text>
                      <View style={styles.topicTagHome}>
                        <Text style={styles.topicTextHome} numberOfLines={1} ellipsizeMode="tail">{post.topic}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.postTitle} numberOfLines={2} ellipsizeMode="tail">{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={2} ellipsizeMode="tail">{post.content}</Text>

                <View style={styles.postFooter}>
                  <View style={styles.postTags}>
                    {post.tags.map((tag, idx) => (
                      <View key={idx} style={styles.tagContainer}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.postStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="thumbs-up-outline" size={14} color="#6B7280" />
                      <Text style={styles.statText}>{post.likes}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
                      <Text style={styles.statText}>{post.comments}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate('Home', { screen: 'Community' })}
          >
            <Text style={styles.viewMoreButtonText}>Join the Discussion</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Resources Section - Updated to match Community Section style with non-financial resources */}
        <View style={styles.resourcesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Resources</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Resources' })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resourcesContainer}>
            {recentPrograms.slice(0, 2).map((program, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceCard}
                onPress={() => navigation.navigate('Home', { screen: 'Resources' })}
              >
                <View style={styles.resourceHeader}>
                  <View style={[styles.resourceStatusIndicator, { backgroundColor: program.statusColor }]} />
                  <Text style={styles.resourceStatusText} numberOfLines={1}>{program.status}</Text>
                  <Text style={styles.resourceCategoryTag} numberOfLines={1}>{program.category}</Text>
                </View>
                <Text style={styles.resourceTitle} numberOfLines={2} ellipsizeMode="tail">{program.title}</Text>
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
                    <Text style={styles.resourceOverview} numberOfLines={2} ellipsizeMode="tail">{program.overview}</Text>
                    <View style={styles.resourceDeadline}>
                      <Ionicons name="time-outline" size={12} color="#6B7280" />
                      <Text style={styles.resourceDeadlineText} numberOfLines={1} ellipsizeMode="tail">Available: {program.deadline}</Text>
                    </View>
                    <Text style={styles.resourceProvider} numberOfLines={1} ellipsizeMode="tail">{program.provider}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewMoreResourcesButton}
            onPress={() => navigation.navigate('Home', { screen: 'Resources' })}
          >
            <Text style={styles.viewMoreResourcesText}>Explore All Resources</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

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
      {/* Floating restart onboarding button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowOnboarding(true)}
        activeOpacity={0.8}
      >
        <View style={styles.fabCircle}>
          <Ionicons name="refresh" size={28} color="white" />
        </View>
      </TouchableOpacity>
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
  pulseContent: {
    flexDirection: 'row',
    padding: 16,
  },
  pulseLeftColumn: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseMiddleColumn: {
    width: '45%',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  pulseRightColumn: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditScoreCircleContainer: {
    alignItems: 'center',
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
    marginBottom: 4,
  },
  creditScoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  creditScoreTitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  creditScoreLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 2,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  miniChartLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  sparklineChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    width: '100%',
    justifyContent: 'space-between',
  },
  sparklineBar: {
    width: 4,
    backgroundColor: '#A7F3D0',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  smartActionContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  smartActionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smartActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smartActionIconContainer: {
    marginRight: 12,
  },
  smartActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smartActionTextContainer: {
    flex: 1,
  },
  smartActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  smartActionSubtitle: {
    fontSize: 11,
    color: '#16A34A',
  },
  smartActionArrow: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 190,
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
    flexWrap: 'nowrap',
  },
  resourceStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    flexShrink: 0,
  },
  resourceStatusText: {
    fontSize: 10,
    fontWeight: '500',
    flexShrink: 1,
  },
  resourceCategoryTag: {
    fontSize: 10,
    color: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    height: 40, // Fixed height for 2 lines
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIconContainer: {
    marginRight: 12,
    flexShrink: 0,
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
  resourceOverview: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 16,
  },
  resourceDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  resourceDeadlineText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flexShrink: 1,
  },
  resourceProvider: {
    fontSize: 11,
    color: '#6366F1',
    marginTop: 2,
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
  postsContainer: {
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postAuthorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  topicTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tagContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  viewMoreButton: {
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
  viewMoreButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
  topicTagHome: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
    maxWidth: 120,
  },
  topicTextHome: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '500',
  },
  // New compact insight card styles
  insightCardCompact: {
    width: width - 120,
    height: 130,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightGradientCompact: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
  },
  insightContentCompact: {
    padding: 14,
    height: '100%',
    justifyContent: 'space-between',
  },
  insightHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIconContainerCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  insightTitleCompact: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  insightDescriptionCompact: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  insightActionContainerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  clickableInsightAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  nonClickableInsightAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  insightActionTextCompact: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    zIndex: 100,
    elevation: 10,
  },
  fabCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
}); 