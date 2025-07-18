import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Linking,
    ScrollView,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { MSMEColors } from './MSMEToolsScreen';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const MSMEResourcesScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Grants');

    const tabs = ['Grants', 'Business Support', 'Women Programs', 'Training'];

    // Sample resource data
    const resources = {
        Grants: [
            {
                id: '1',
                title: 'MSME Digital Transformation Grant',
                organization: 'SME Corp Malaysia',
                description: 'Up to RM5,000 for digital tools, including e-commerce platforms, digital marketing, and automation tools.',
                deadline: 'Dec 31, 2025',
                eligibility: 'Registered businesses with annual sales below RM300,000',
                link: 'https://www.smecorp.gov.my/grants',
                icon: 'cash-outline',
            },
            {
                id: '2',
                title: 'Micro Financing Scheme',
                organization: 'Bank Rakyat',
                description: 'Financing up to RM50,000 with flexible repayment terms for micro businesses.',
                deadline: 'Ongoing',
                eligibility: 'Micro enterprises in operation for at least 6 months',
                link: 'https://www.bankrakyat.com.my',
                icon: 'card-outline',
            },
            {
                id: '3',
                title: 'Bumiputera Enterprise Enhancement Program',
                organization: 'MARA',
                description: 'Financial assistance, business premises and entrepreneurial training for Bumiputera entrepreneurs.',
                deadline: 'Ongoing',
                eligibility: 'Bumiputera-owned businesses',
                link: 'https://www.mara.gov.my',
                icon: 'business-outline',
            },
        ],
        'Business Support': [
            {
                id: '4',
                title: 'Business Advisory Services',
                organization: 'SME Corp Malaysia',
                description: 'Free consultation on business strategy, marketing, and financial management.',
                location: 'Nationwide SME Corp offices',
                contact: '1-800-88-SME (1-800-88-763)',
                link: 'https://www.smecorp.gov.my/advisory',
                icon: 'people-outline',
            },
            {
                id: '5',
                title: 'Digital Marketing Workshop',
                organization: 'MDEC',
                description: 'Learn to leverage social media and digital platforms to grow your business.',
                location: 'Online & major cities',
                schedule: 'Monthly sessions',
                link: 'https://www.mdec.my/workshops',
                icon: 'megaphone-outline',
            },
        ],
        'Women Programs': [
            {
                id: '6',
                title: 'Women Entrepreneur Financing Program',
                organization: 'Ministry of Women, Family and Community Development',
                description: 'Low interest financing up to RM30,000 for women-owned businesses.',
                deadline: 'Ongoing',
                eligibility: 'Women-owned businesses in operation for at least 1 year',
                link: 'https://www.kpwkm.gov.my',
                icon: 'female-outline',
            },
            {
                id: '7',
                title: 'Single Mothers Skills Training',
                organization: 'Women\'s Development Department',
                description: 'Free skills training in areas like crafts, culinary arts, and digital skills for income generation.',
                location: 'Community centers nationwide',
                eligibility: 'Single mothers with dependents',
                link: 'https://www.jpw.gov.my',
                icon: 'school-outline',
            },
        ],
        Training: [
            {
                id: '8',
                title: 'Digital Business Bootcamp',
                organization: 'MDEC',
                description: 'Intensive 2-day workshop on setting up and running an online business.',
                schedule: 'Monthly in KL, JB, and Penang',
                fee: 'RM50 (subsidized)',
                link: 'https://www.mdec.my/bootcamp',
                icon: 'laptop-outline',
            },
            {
                id: '9',
                title: 'Financial Literacy for Small Business',
                organization: 'Bank Negara Malaysia',
                description: 'Learn budgeting, cash flow management, and simple bookkeeping.',
                schedule: 'Online course, self-paced',
                fee: 'Free',
                link: 'https://www.bnm.gov.my/financialeducation',
                icon: 'calculator-outline',
            },
        ],
    };

    const renderResourceItem = ({ item, index }) => {
        const isGrant = activeTab === 'Grants';

        return (
            <AnimatedCard
                mode="elevated"
                style={styles.resourceCard}
                entering={FadeInRight.delay(100 * index).springify()}
            >
                <Card.Content style={styles.resourceCardContent}>
                    <View style={styles.resourceHeader}>
                        <LinearGradient
                            colors={MSMEColors.gradientCool}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.iconContainer}
                        >
                            <Ionicons name={item.icon} size={24} color={MSMEColors.white} />
                        </LinearGradient>
                        <View style={styles.resourceTitleContainer}>
                            <Text style={styles.resourceTitle} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
                            <Text style={styles.resourceOrg}>{item.organization}</Text>
                        </View>
                    </View>

                    <Text style={styles.resourceDescription} numberOfLines={3} ellipsizeMode="tail">{item.description}</Text>

                    <View style={styles.detailsContainer}>
                        {isGrant && item.deadline && (
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar-outline" size={16} color={MSMEColors.darkGray} />
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Deadline: </Text>
                                    {item.deadline}
                                </Text>
                            </View>
                        )}

                        {item.eligibility && (
                            <View style={styles.detailItem}>
                                <Ionicons name="checkmark-circle-outline" size={16} color={MSMEColors.darkGray} />
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Eligibility: </Text>
                                    {item.eligibility}
                                </Text>
                            </View>
                        )}

                        {item.location && (
                            <View style={styles.detailItem}>
                                <Ionicons name="location-outline" size={16} color={MSMEColors.darkGray} />
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Location: </Text>
                                    {item.location}
                                </Text>
                            </View>
                        )}

                        {item.schedule && (
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={16} color={MSMEColors.darkGray} />
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Schedule: </Text>
                                    {item.schedule}
                                </Text>
                            </View>
                        )}

                        {item.fee && (
                            <View style={styles.detailItem}>
                                <Ionicons name="pricetag-outline" size={16} color={MSMEColors.darkGray} />
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Fee: </Text>
                                    {item.fee}
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.linkButtonContainer}
                        onPress={() => Linking.openURL(item.link)}
                    >
                        <LinearGradient
                            colors={MSMEColors.gradientCool}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.linkButton}
                        >
                            <Text style={styles.linkButtonText}>Learn More & Apply</Text>
                            <Ionicons name="arrow-forward" size={16} color={MSMEColors.white} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Card.Content>
            </AnimatedCard>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with gradient */}
            <LinearGradient
                colors={MSMEColors.gradientCool}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <View style={styles.titleContainer}>
                            <Ionicons name="information-circle-outline" size={24} color="white" style={styles.titleIcon} />
                            <Text style={styles.headerTitle}>Support</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Grants and business resources</Text>
                    </View>
                    <TouchableOpacity style={styles.searchButton}>
                        <Ionicons name="search" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Stats Panel */}
            <View style={styles.statsPanel}>
                <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>12</Text>
                    <Text style={styles.statItemLabel}>Resources</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>3</Text>
                    <Text style={styles.statItemLabel}>For You</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>RM75K</Text>
                    <Text style={styles.statItemLabel}>Available</Text>
                </View>
            </View>

            {/* Tabs - Exact match to screenshot */}
            <View style={styles.tabScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.tabContainer}>
                        {tabs.map((tab, index) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    style={[
                                        styles.tab,
                                        isActive && styles.activeTab,
                                        index === 0 && { marginLeft: 0 }
                                    ]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            isActive && styles.activeTabText
                                        ]}
                                    >
                                        {tab}
                                    </Text>
                                    {isActive && <View style={styles.activeTabIndicator} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            <FlatList
                data={resources[activeTab]}
                renderItem={renderResourceItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            <AnimatedCard
                mode="elevated"
                style={styles.infoBox}
                entering={FadeIn.delay(300)}
            >
                <Card.Content style={styles.infoBoxContent}>
                    <Ionicons name="information-circle" size={24} color={MSMEColors.resources} />
                    <Text style={styles.infoText}>
                        Need help applying? Our smart assistant can guide you through the process.
                    </Text>
                    <TouchableOpacity>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color={MSMEColors.resources} />
                    </TouchableOpacity>
                </Card.Content>
            </AnimatedCard>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MSMEColors.background,
    },
    header: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleIcon: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MSMEColors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsPanel: {
        flexDirection: 'row',
        backgroundColor: MSMEColors.white,
        padding: 16,
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 12,
        ...MSMEColors.shadowCard,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16, // Add margin to separate from tabs
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statItemValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MSMEColors.resources,
    },
    statItemLabel: {
        fontSize: 12,
        color: MSMEColors.darkGray,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: MSMEColors.border,
    },
    tabScrollContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
        position: 'relative',
    },
    activeTab: {
        backgroundColor: 'transparent',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: MSMEColors.resources,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: MSMEColors.darkGray,
    },
    activeTabText: {
        color: MSMEColors.resources,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 100, // Space for infoBox
    },
    resourceCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    resourceCardContent: {
        padding: 16,
    },
    resourceHeader: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    resourceTitleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: MSMEColors.foreground,
    },
    resourceOrg: {
        fontSize: 13,
        color: MSMEColors.darkGray,
    },
    resourceDescription: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginBottom: 16,
        lineHeight: 20,
    },
    detailsContainer: {
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginLeft: 8,
        flex: 1,
    },
    detailLabel: {
        fontWeight: '600',
        color: MSMEColors.foreground,
    },
    linkButtonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 4,
    },
    linkButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkButtonText: {
        color: MSMEColors.white,
        fontWeight: '600',
        fontSize: 14,
        marginRight: 8,
    },
    infoBox: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        borderRadius: 12,
        backgroundColor: MSMEColors.white,
        ...MSMEColors.shadowFloating,
        elevation: 6, // Add elevation for Android
    },
    infoBoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12, // Increase padding for better spacing
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginHorizontal: 12,
    },
});

export default MSMEResourcesScreen; 