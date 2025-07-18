import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Linking,
    ScrollView,
    Modal,
    TextInput,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const MSMEColors = {
    primary: '#3F51B5',
    secondary: '#00BCD4',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    resources: '#7752BE',
    background: '#F9F9FB',
    white: '#FFFFFF',
    darkGray: '#666666',
    lightGray: '#E5E5E5',
    border: '#EEEEEE',
    foreground: '#333333',
    shadowCard: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    shadowFloating: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gradientWarm: ['#FF9966', '#FF5E62'],
    gradientCool: ['#7752BE', '#5E72EB'],
};

const MSMEResourcesScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Business Support');
    const [resources, setResources] = useState([]);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Tabs based on available categories
    const [tabs, setTabs] = useState([]);

    useEffect(() => {
        // Fetch resources - in a real app, this would be an API call
        fetchResources();
    }, []);

    const fetchResources = () => {
        // This simulates fetching the data from an API
        const resourcesData = [
            {
                "id": "myassist-msme",
                "category": "Business Support",
                "title": "MyAssist MSME Advisory",
                "overview": "Online SME advisory, mentoring & business matching",
                "icon": "people-outline",
                "type": "Advisory",
                "provider": "SME Corp Malaysia",
                "eligibility": {
                    "registeredSMEStatus": true,
                    "no_other_criteria": true
                },
                "labels": {
                    "registeredSMEStatus": "Registered SME",
                    "no_other_criteria": "Open to all"
                },
                "link": "https://myassist-msme.gov.my"
            },
            {
                "id": "msme-hub",
                "category": "Business Support",
                "title": "MSME Hub Centre",
                "overview": "Knowledge hub, info counters, live chat & advisory",
                "icon": "information-circle-outline",
                "type": "Advisory",
                "provider": "SME Corp Malaysia",
                "eligibility": {
                    "registeredSMEStatus": true,
                    "malaysianOwned": true
                },
                "labels": {
                    "registeredSMEStatus": "Registered SME",
                    "malaysianOwned": "Malaysian-owned business"
                },
                "link": "https://www.smeinfo.com.my/institutional-support/sme-hub/"
            },
            {
                "id": "growbiz-2025",
                "category": "Training",
                "title": "GrowBiz Programme 2025",
                "overview": "90% subsidised coaching for micro enterprises",
                "icon": "school-outline",
                "type": "Training",
                "provider": "SME Corp Malaysia",
                "eligibility": {
                    "microEnterprise": true,
                    "malaysianOwned": true,
                    "registeredSSM": true
                },
                "labels": {
                    "microEnterprise": "Turnover < RM300k / ≤5 emp",
                    "malaysianOwned": "Malaysian-owned",
                    "registeredSSM": "SSM registered"
                },
                "link": "https://www.smecorp.gov.my/index.php/en/programmes1/2015-12-21-09-53-14/growbiz-programme"
            },
            {
                "id": "digital-skills-workshop",
                "category": "Training",
                "title": "Digital Marketing Skills",
                "overview": "Free workshops on social media and online marketing",
                "icon": "laptop-outline",
                "type": "Training",
                "provider": "MDEC",
                "eligibility": {
                    "registeredBusiness": true,
                    "malaysianOwned": true,
                    "operatingBusiness": true
                },
                "labels": {
                    "registeredBusiness": "Registered business",
                    "malaysianOwned": "Malaysian-owned",
                    "operatingBusiness": "Currently operating"
                },
                "link": "https://www.mdec.my/digital-skills"
            },
            {
                "id": "women-entrepreneurship",
                "category": "Women Programs",
                "title": "Women Entrepreneurship Network",
                "overview": "Networking and mentorship for women business owners",
                "icon": "female-outline",
                "type": "Networking",
                "provider": "Women Entrepreneur Network Association",
                "eligibility": {
                    "womenOwned": true,
                    "registeredBusiness": true
                },
                "labels": {
                    "womenOwned": "Women-owned business",
                    "registeredBusiness": "Registered business"
                },
                "link": "https://www.wena.my"
            },
            {
                "id": "industry4-readiness",
                "category": "Training",
                "title": "Industry 4.0 Readiness",
                "overview": "Assessment and training for digital transformation",
                "icon": "trending-up-outline",
                "type": "Training",
                "provider": "MITI",
                "eligibility": {
                    "manufacturingSector": true,
                    "registeredBusiness": true,
                    "malaysianOwned": true
                },
                "labels": {
                    "manufacturingSector": "Manufacturing sector",
                    "registeredBusiness": "Registered business",
                    "malaysianOwned": "Malaysian-owned"
                },
                "link": "https://www.miti.gov.my/industry4-0"
            },
            {
                "id": "export-readiness-program",
                "category": "Business Support",
                "title": "Export Readiness Program",
                "overview": "Prepare your business for international markets",
                "icon": "globe-outline",
                "type": "Advisory",
                "provider": "MATRADE",
                "eligibility": {
                    "registeredBusiness": true,
                    "businessAge2Years": true,
                    "exportReady": null // Uncertain criteria - needs assessment
                },
                "labels": {
                    "registeredBusiness": "Registered business",
                    "businessAge2Years": "Business age ≥ 2 years",
                    "exportReady": "Export ready product/service"
                },
                "link": "https://www.matrade.gov.my/en/malaysian-exporters/going-global/exporters-development"
            },
            {
                "id": "business-accelerator-program",
                "category": "Business Support",
                "title": "Business Accelerator Program",
                "overview": "Strategic development for high-growth businesses",
                "icon": "rocket-outline",
                "type": "Advisory",
                "provider": "SME Corp Malaysia",
                "eligibility": {
                    "highGrowthPotential": null, // Uncertain criteria - needs assessment
                    "businessPlan": true,
                    "registeredSME": true
                },
                "labels": {
                    "highGrowthPotential": "High growth potential",
                    "businessPlan": "Has business plan",
                    "registeredSME": "Registered SME"
                },
                "link": "https://www.smecorp.gov.my/index.php/en/programmes1/2015-12-21-09-53-11/business-accelerator-programme"
            },
            {
                "id": "halal-certification",
                "category": "Business Support",
                "title": "Halal Certification Support",
                "overview": "Assistance with Halal certification process",
                "icon": "checkmark-circle-outline",
                "type": "Advisory",
                "provider": "HDC",
                "eligibility": {
                    "foodOrConsumerGoods": true,
                    "registeredBusiness": true,
                    "shariahCompliant": null // Uncertain until assessment
                },
                "labels": {
                    "foodOrConsumerGoods": "Food/Consumer goods",
                    "registeredBusiness": "Registered business",
                    "shariahCompliant": "Shariah compliant processes"
                },
                "link": "https://www.hdcglobal.com"
            },
            {
                "id": "women-leadership-workshop",
                "category": "Women Programs",
                "title": "Women Leadership Workshop",
                "overview": "Leadership skill development for women entrepreneurs",
                "icon": "people-outline",
                "type": "Training",
                "provider": "Women Development Department",
                "eligibility": {
                    "womenOwned": true,
                    "businessAge1Year": true,
                    "previousTraining": null // Uncertain criteria - preferred but not required
                },
                "labels": {
                    "womenOwned": "Women-owned business",
                    "businessAge1Year": "Business age ≥ 1 year",
                    "previousTraining": "Previous leadership training"
                },
                "link": "https://www.jpw.gov.my"
            },
            {
                "id": "e-commerce-onboarding",
                "category": "Training",
                "title": "E-Commerce Onboarding",
                "overview": "Get your business online with e-commerce platforms",
                "icon": "cart-outline",
                "type": "Training",
                "provider": "MDEC",
                "eligibility": {
                    "physicalProducts": true,
                    "registeredBusiness": true,
                    "digitalReadiness": null // Uncertain criteria - varies by business
                },
                "labels": {
                    "physicalProducts": "Sells physical products",
                    "registeredBusiness": "Registered business",
                    "digitalReadiness": "Basic digital literacy"
                },
                "link": "https://www.mdec.my/ecommerce"
            },
            {
                "id": "networking-events",
                "category": "Events & Networking",
                "title": "Industry Networking Events",
                "overview": "Connect with industry leaders and potential partners",
                "icon": "people-outline",
                "type": "Networking",
                "provider": "Various",
                "eligibility": {
                    "registeredBusiness": true,
                    "membershipFee": false,
                    "invitationOnly": null // Uncertain - some events by invitation only
                },
                "labels": {
                    "registeredBusiness": "Registered business",
                    "membershipFee": "Membership fee required",
                    "invitationOnly": "Invitation only events"
                },
                "link": "https://www.businessevents.my"
            },
            {
                "id": "rural-digitalization",
                "category": "Training",
                "title": "Rural Digitalization Program",
                "overview": "Digital skills training for rural businesses",
                "icon": "wifi-outline",
                "type": "Training",
                "provider": "Ministry of Rural Development",
                "eligibility": {
                    "ruralLocation": null, // Uncertain - definition of rural varies
                    "registeredBusiness": true,
                    "noDigitalPresence": null // Uncertain - subjective assessment
                },
                "labels": {
                    "ruralLocation": "Rural business location",
                    "registeredBusiness": "Registered business",
                    "noDigitalPresence": "Limited digital presence"
                },
                "link": "https://www.rurallink.gov.my"
            }
        ];

        setResources(resourcesData);

        // Extract unique categories for tabs
        const categories = [...new Set(resourcesData.map(item => item.category))];
        setTabs(categories);

        // Set default active tab to first category
        if (categories.length > 0) {
            setActiveTab(categories[0]);
        }
    };

    // Get filtered and sorted resources
    const getFilteredResources = () => {
        // First filter by active tab
        let filtered = resources.filter(item => item.category === activeTab);

        // Apply search filter if query exists
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                item =>
                    item.title.toLowerCase().includes(query) ||
                    item.overview.toLowerCase().includes(query) ||
                    // Search in labels
                    Object.values(item.labels || {}).some(
                        label => label.toLowerCase().includes(query)
                    )
            );
        }

        // Sort by eligibility status - uncertain eligibility in the middle
        return filtered.sort((a, b) => {
            // Count eligible criteria for both resources
            const aEligibleCount = Object.values(a.eligibility).filter(value => value === true).length;
            const bEligibleCount = Object.values(b.eligibility).filter(value => value === true).length;

            const aUncertainCount = Object.values(a.eligibility).filter(value => value === null).length;
            const bUncertainCount = Object.values(b.eligibility).filter(value => value === null).length;

            const aTotalCriteria = Object.values(a.eligibility).length;
            const bTotalCriteria = Object.values(b.eligibility).length;

            // Check for disqualifying criteria
            const aHasDisqualifying = Object.values(a.eligibility).some(value => value === false);
            const bHasDisqualifying = Object.values(b.eligibility).some(value => value === false);

            // First prioritize: no disqualifying criteria
            if (aHasDisqualifying && !bHasDisqualifying) return 1;
            if (!aHasDisqualifying && bHasDisqualifying) return -1;

            // Then prioritize: fully eligible over uncertain over partially eligible
            const aFullyEligible = aEligibleCount === aTotalCriteria;
            const bFullyEligible = bEligibleCount === bTotalCriteria;

            if (aFullyEligible && !bFullyEligible) return -1;
            if (!aFullyEligible && bFullyEligible) return 1;

            // Then prioritize resources with fewer uncertain criteria
            return aUncertainCount - bUncertainCount;
        });
    };

    const toggleCardExpansion = (id) => {
        setExpandedCardId(expandedCardId === id ? null : id);
    };

    const openResourceModal = (resource) => {
        setSelectedResource(resource);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const getEligibilityStatusIcon = (status) => {
        if (status === true) {
            return <Ionicons name="checkmark-circle" size={16} color={MSMEColors.success} />;
        } else if (status === false) {
            return <Ionicons name="close-circle" size={16} color={MSMEColors.danger} />;
        } else {
            return <Ionicons name="alert-circle" size={16} color={MSMEColors.warning} />;
        }
    };

    // Toggle search input visibility
    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (showSearch) {
            setSearchQuery(''); // Clear search when hiding
        }
    };

    const renderResourceItem = ({ item, index }) => {
        const isExpanded = expandedCardId === item.id;

        // Count eligible criteria
        const eligibilityCount = Object.values(item.eligibility).filter(value => value === true).length;
        const totalCriteria = Object.values(item.eligibility).length;

        // Check if eligible for all criteria
        const isFullyEligible = eligibilityCount === totalCriteria;

        // Check if has any false criteria
        const hasDisqualifyingCriteria = Object.values(item.eligibility).some(value => value === false);

        return (
            <AnimatedCard
                mode="elevated"
                style={[
                    styles.resourceCard,
                    isFullyEligible && styles.eligibleResourceCard,
                    hasDisqualifyingCriteria && styles.ineligibleResourceCard
                ]}
                entering={FadeInRight.delay(100 * index).springify()}
            >
                <TouchableOpacity onPress={() => toggleCardExpansion(item.id)}>
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
                                <View style={styles.titleContainer}>
                                    <Text style={styles.resourceTitle} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
                                    {isFullyEligible && (
                                        <View style={styles.eligibilityTag}>
                                            <Ionicons name="checkmark-circle" size={14} color={MSMEColors.success} />
                                            <Text style={styles.eligibilityTagText}>Fully Eligible</Text>
                                        </View>
                                    )}
                                    {hasDisqualifyingCriteria && (
                                        <View style={styles.ineligibilityTag}>
                                            <Ionicons name="close-circle" size={14} color={MSMEColors.danger} />
                                            <Text style={styles.ineligibilityTagText}>Not Eligible</Text>
                                        </View>
                                    )}
                                    {!isFullyEligible && !hasDisqualifyingCriteria && (
                                        <View style={styles.partialEligibilityTag}>
                                            <Ionicons name="alert-circle" size={14} color={MSMEColors.warning} />
                                            <Text style={styles.partialEligibilityTagText}>Potentially Eligible</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.resourceOverview}>{item.overview}</Text>

                                {/* Quick eligibility view */}
                                {!isExpanded && (
                                    <View style={styles.quickEligibilityContainer}>
                                        <View style={[
                                            styles.eligibilityBadge,
                                            isFullyEligible && styles.eligibilityBadgeSuccess,
                                            hasDisqualifyingCriteria && styles.eligibilityBadgeDanger
                                        ]}>
                                            <Text style={[
                                                styles.eligibilityBadgeText,
                                                isFullyEligible && styles.eligibilityBadgeTextSuccess,
                                                hasDisqualifyingCriteria && styles.eligibilityBadgeTextDanger
                                            ]}>
                                                {eligibilityCount}/{totalCriteria} criteria met
                                            </Text>
                                        </View>
                                        <View style={styles.eligibilityIconsContainer}>
                                            {Object.entries(item.eligibility).slice(0, 3).map(([key, value], idx) => (
                                                <View key={key} style={styles.smallEligibilityIcon}>
                                                    {getEligibilityStatusIcon(value)}
                                                </View>
                                            ))}
                                            {Object.entries(item.eligibility).length > 3 && (
                                                <Text style={styles.moreEligibilityText}>+{Object.entries(item.eligibility).length - 3}</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        {isExpanded && (
                            <View style={[
                                styles.eligibilityContainer,
                                isFullyEligible && styles.eligibilityContainerSuccess,
                                hasDisqualifyingCriteria && styles.eligibilityContainerDanger
                            ]}>
                                <Text style={styles.eligibilityTitle}>Eligibility:</Text>
                                {Object.keys(item.eligibility).map((key) => (
                                    <View key={key} style={styles.eligibilityItem}>
                                        {getEligibilityStatusIcon(item.eligibility[key])}
                                        <Text style={styles.eligibilityText}>
                                            {item.labels[key]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {isExpanded && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.linkButtonContainer, { flex: 1, marginRight: 8 }]}
                                    onPress={() => Linking.openURL(item.link)}
                                >
                                    <LinearGradient
                                        colors={MSMEColors.gradientCool}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.linkButton}
                                    >
                                        <Text style={styles.linkButtonText}>Apply Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color={MSMEColors.white} />
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.infoButton, { flex: 1 }]}
                                    onPress={() => openResourceModal(item)}
                                >
                                    <Text style={styles.infoButtonText}>More Info</Text>
                                    <Ionicons name="information-circle-outline" size={16} color={MSMEColors.resources} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Card.Content>
                </TouchableOpacity>
            </AnimatedCard>
        );
    };

    // Modal component for resource details
    const ResourceDetailsModal = () => {
        if (!selectedResource) return null;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedResource.title}</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close" size={24} color={MSMEColors.darkGray} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Overview</Text>
                                <Text style={styles.modalText}>{selectedResource.overview}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Eligibility Requirements</Text>
                                {Object.keys(selectedResource.eligibility).map((key) => (
                                    <View key={key} style={styles.modalEligibilityItem}>
                                        {getEligibilityStatusIcon(selectedResource.eligibility[key])}
                                        <Text style={styles.modalEligibilityText}>
                                            {selectedResource.labels[key]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                Linking.openURL(selectedResource.link);
                                closeModal();
                            }}
                        >
                            <LinearGradient
                                colors={MSMEColors.gradientCool}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.modalButtonGradient}
                            >
                                <Text style={styles.modalButtonText}>Visit Website & Apply</Text>
                                <Ionicons name="open-outline" size={18} color={MSMEColors.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Simple header matching other pages */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Business Resources</Text>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={toggleSearch}
                >
                    <Ionicons name={showSearch ? "close" : "search"} size={24} color={MSMEColors.darkGray} />
                </TouchableOpacity>
            </View>

            {/* Search bar */}
            {showSearch && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={MSMEColors.darkGray} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={MSMEColors.darkGray} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Tabs - Categories */}
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
                data={getFilteredResources()}
                renderItem={renderResourceItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color={MSMEColors.lightGray} />
                        <Text style={styles.emptyText}>No resources found.</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your search or category.</Text>
                    </View>
                }
                ListFooterComponent={
                    <TouchableOpacity
                        style={styles.financialSupportButton}
                        onPress={() => navigation.navigate('MerchantLoansScreen')}
                    >
                        <Ionicons name="cash-outline" size={20} color={MSMEColors.resources} style={styles.buttonIcon} />
                        <Text style={styles.financialSupportText}>Looking for grants or financial support?</Text>
                        <Ionicons name="arrow-forward" size={16} color={MSMEColors.resources} />
                    </TouchableOpacity>
                }
            />

            <ResourceDetailsModal />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MSMEColors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
        backgroundColor: MSMEColors.white,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MSMEColors.foreground,
    },
    emptyContainer: {
        width: 40,
    },
    tabScrollContainer: {
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
        backgroundColor: MSMEColors.white,
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
        paddingBottom: 16, // Reduced padding now that we've removed the infoBox
    },
    resourceCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderLeftWidth: 0,
    },
    eligibleResourceCard: {
        borderLeftWidth: 4,
        borderLeftColor: MSMEColors.success,
    },
    ineligibleResourceCard: {
        borderLeftWidth: 4,
        borderLeftColor: MSMEColors.danger,
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: MSMEColors.foreground,
        flex: 1,
    },
    eligibilityTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 4,
    },
    eligibilityTagText: {
        fontSize: 10,
        color: MSMEColors.success,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    ineligibilityTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 4,
    },
    ineligibilityTagText: {
        fontSize: 10,
        color: MSMEColors.danger,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    partialEligibilityTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 4,
    },
    partialEligibilityTagText: {
        fontSize: 10,
        color: MSMEColors.warning,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    resourceOverview: {
        fontSize: 13,
        color: MSMEColors.darkGray,
        marginBottom: 4,
    },
    quickEligibilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    eligibilityBadge: {
        backgroundColor: MSMEColors.background,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: MSMEColors.border,
    },
    eligibilityBadgeText: {
        fontSize: 10,
        color: MSMEColors.darkGray,
        fontWeight: '500',
    },
    eligibilityIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    smallEligibilityIcon: {
        marginLeft: 4,
    },
    moreEligibilityText: {
        fontSize: 10,
        color: MSMEColors.darkGray,
        marginLeft: 4,
    },
    eligibilityContainer: {
        marginTop: 8,
        marginBottom: 16,
        padding: 12,
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        borderLeftWidth: 0,
    },
    eligibilityContainerSuccess: {
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        borderLeftWidth: 4,
        borderLeftColor: MSMEColors.success,
    },
    eligibilityContainerDanger: {
        backgroundColor: 'rgba(244, 67, 54, 0.05)',
        borderLeftWidth: 4,
        borderLeftColor: MSMEColors.danger,
    },
    eligibilityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: MSMEColors.foreground,
        marginBottom: 8,
    },
    eligibilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    eligibilityText: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginLeft: 8,
    },
    buttonContainer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    linkButtonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
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
    infoButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: MSMEColors.resources,
        borderRadius: 8,
    },
    infoButtonText: {
        color: MSMEColors.resources,
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
        elevation: 6,
    },
    infoBoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginHorizontal: 12,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: MSMEColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MSMEColors.foreground,
    },
    modalBody: {
        padding: 16,
        maxHeight: '70%',
    },
    modalSection: {
        marginBottom: 16,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: MSMEColors.foreground,
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        lineHeight: 20,
    },
    modalEligibilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalEligibilityText: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginLeft: 8,
    },
    modalButton: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalButtonGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        color: MSMEColors.white,
        fontWeight: '600',
        fontSize: 16,
        marginRight: 8,
    },
    eligibilityBadgeSuccess: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: MSMEColors.success,
    },
    eligibilityBadgeDanger: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderColor: MSMEColors.danger,
    },
    eligibilityBadgeTextSuccess: {
        color: MSMEColors.success,
    },
    eligibilityBadgeTextDanger: {
        color: MSMEColors.danger,
    },
    searchButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: MSMEColors.white,
        borderBottomWidth: 1,
        borderBottomColor: MSMEColors.border,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MSMEColors.background,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: MSMEColors.foreground,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: MSMEColors.darkGray,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: MSMEColors.darkGray,
        marginTop: 8,
        textAlign: 'center',
    },
    financialSupportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(119, 82, 190, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(119, 82, 190, 0.2)',
        borderRadius: 12,
        marginTop: 24,
        marginBottom: 16,
        padding: 16,
    },
    buttonIcon: {
        marginRight: 12,
    },
    financialSupportText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: MSMEColors.resources,
    },
});

export default MSMEResourcesScreen; 