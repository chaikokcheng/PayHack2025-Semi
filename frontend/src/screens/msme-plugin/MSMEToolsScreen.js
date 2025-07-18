import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ImageBackground
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Default placeholder image
const heroBackgroundImage = 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=1287&auto=format&fit=crop';

// Microbiz-Super-Friend colors - defined inline to avoid modifying Colors.js
export const MSMEColors = {
    primary: '#8B33D9',
    primaryForeground: '#FFFFFF',

    secondary: '#F8E4F0',
    secondaryForeground: '#2D262A',

    background: '#FAFBFD',
    foreground: '#2D262A',

    white: '#FFFFFF',
    black: '#000000',
    darkGray: '#666666',

    muted: '#F7EFF6',
    mutedForeground: '#8A7C85',

    accent: '#F3E6FB',
    accentForeground: '#8B33D9',

    destructive: '#E03A3A',

    // Module colors
    inventory: '#28A86B',
    inventoryForeground: '#FFFFFF',

    accounting: '#3388DD',
    accountingForeground: '#FFFFFF',

    community: '#8B33D9',
    communityForeground: '#FFFFFF',

    groupBuy: '#E57822',
    groupBuyForeground: '#FFFFFF',

    resources: '#2294CC',
    resourcesForeground: '#FFFFFF',

    // Status colors
    stockGood: '#28A86B',
    stockLow: '#F7C234',
    stockOut: '#E03A3A',

    // Gradients as arrays for LinearGradient
    gradientPrimary: ['#8B33D9', '#D04D89'],
    gradientSuccess: ['#28A86B', '#29A898'],
    gradientWarm: ['#E57822', '#F7C234'],
    gradientCool: ['#3388DD', '#2294CC'],

    border: '#F0E5EF',

    // Shadows (converted to values that work with React Native)
    shadowCard: {
        shadowColor: '#8B33D9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    shadowFloating: {
        shadowColor: '#8B33D9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 8,
    }
};

const ModuleCard = ({ title, iconName, description, count, status, variant, onPress }) => (
    <TouchableOpacity
        style={[styles.card, styles.elevation]}
        onPress={onPress}
        activeOpacity={0.9}
    >
        <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, getVariantStyle(variant).background]}>
                <Ionicons name={iconName} size={32} color={getVariantStyle(variant).foreground} />
            </View>
            {status && (
                <View style={[
                    styles.badge,
                    status === 'recommended' ? styles.badgeRecommended :
                        status === 'new' ? styles.badgeNew :
                            styles.badgeActive
                ]}>
                    <Text style={styles.badgeText}>
                        {status === 'recommended' ? '✨ Recommended' :
                            status === 'new' ? '🆕 New' :
                                '✓ Active'}
                    </Text>
                </View>
            )}
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        {count && (
            <Text style={styles.cardCount}>{count}</Text>
        )}
        <Text style={styles.cardDescription}>{description}</Text>
        <View style={{ height: 8 }} />
        <LinearGradient
            colors={getVariantGradient(variant)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardButton}
        >
            <Text style={styles.cardButtonText}>Open {title}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

// Helper function to get variant-specific styles
const getVariantStyle = (variant) => {
    switch (variant) {
        case 'inventory':
            return {
                background: { backgroundColor: 'rgba(40, 168, 107, 0.1)' },
                foreground: MSMEColors.inventory
            };
        case 'accounting':
            return {
                background: { backgroundColor: 'rgba(51, 136, 221, 0.1)' },
                foreground: MSMEColors.accounting
            };
        case 'community':
            return {
                background: { backgroundColor: 'rgba(139, 51, 217, 0.1)' },
                foreground: MSMEColors.community
            };
        case 'group-buy':
            return {
                background: { backgroundColor: 'rgba(229, 120, 34, 0.1)' },
                foreground: MSMEColors.groupBuy
            };
        case 'resources':
            return {
                background: { backgroundColor: 'rgba(34, 148, 204, 0.1)' },
                foreground: MSMEColors.resources
            };
        default:
            return {
                background: { backgroundColor: 'rgba(139, 51, 217, 0.1)' },
                foreground: MSMEColors.primary
            };
    }
};

// Helper function to get variant-specific gradient
const getVariantGradient = (variant) => {
    switch (variant) {
        case 'inventory':
            return MSMEColors.gradientSuccess;
        case 'accounting':
            return MSMEColors.gradientCool;
        case 'community':
            return MSMEColors.gradientPrimary;
        case 'group-buy':
            return MSMEColors.gradientWarm;
        case 'resources':
            return MSMEColors.gradientCool;
        default:
            return MSMEColors.gradientPrimary;
    }
};

const MSMEToolsScreen = ({ navigation }) => {
    const modules = [
        {
            id: 'inventory',
            title: "Stock",
            iconName: "cube-outline",
            description: "Track your products and inventory",
            count: "12 items",
            status: "active",
            variant: "inventory",
            screen: 'Inventory'
        },
        {
            id: 'accounting',
            title: "Money",
            iconName: "calculator-outline",
            description: "Simple accounting and expenses",
            count: "RM1,240",
            status: "recommended",
            variant: "accounting",
            screen: 'Accounting'
        },
        {
            id: 'community',
            title: "Community",
            iconName: "people-outline",
            description: "Ask questions and share tips",
            count: "5 new",
            status: "active",
            variant: "community",
            screen: 'Community'
        },
        {
            id: 'bulk-purchase',
            title: "Save and Share",
            iconName: "cart-outline",
            description: "Group buy, swap and sell excess",
            count: "3 deals",
            status: "new",
            variant: "group-buy",
            screen: 'BulkPurchase'
        },
        {
            id: 'resources',
            title: "Support",
            iconName: "information-circle-outline",
            description: "Find grants and business help",
            count: "2 matches",
            status: "recommended",
            variant: "resources",
            screen: 'Resources'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Business Tools</Text>
                    <Text style={styles.headerSubtitle}>Everything you need to grow your business</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <ImageBackground
                        source={{ uri: heroBackgroundImage }}
                        style={styles.heroBg}
                        imageStyle={styles.heroBgImage}
                    >
                        <LinearGradient
                            colors={['rgba(139, 51, 217, 0.8)', 'rgba(139, 51, 217, 0.5)']}
                            style={styles.heroGradient}
                        >
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>Hello! Ready to grow your business?</Text>
                                <Text style={styles.heroSubtitle}>Choose a tool to get started</Text>

                                <TouchableOpacity style={styles.heroButton}>
                                    <Ionicons name="add" size={20} color={MSMEColors.primary} style={styles.heroButtonIcon} />
                                    <Text style={styles.heroButtonText}>Add New Tool</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.elevation]}>
                        <Text style={[styles.statValue, { color: MSMEColors.inventory }]}>12</Text>
                        <Text style={styles.statLabel}>Products</Text>
                    </View>
                    <View style={[styles.statCard, styles.elevation]}>
                        <Text style={[styles.statValue, { color: MSMEColors.accounting }]}>RM1K</Text>
                        <Text style={styles.statLabel}>This Week</Text>
                    </View>
                    <View style={[styles.statCard, styles.elevation]}>
                        <Text style={[styles.statValue, { color: MSMEColors.community }]}>5</Text>
                        <Text style={styles.statLabel}>New Posts</Text>
                    </View>
                    <View style={[styles.statCard, styles.elevation]}>
                        <Text style={[styles.statValue, { color: MSMEColors.groupBuy }]}>RM45</Text>
                        <Text style={styles.statLabel}>Saved</Text>
                    </View>
                </View>

                {/* Recommended Section */}
                <View style={styles.recommendedSection}>
                    <Text style={styles.sectionTitle}>✨ Recommended for You</Text>
                    <LinearGradient
                        colors={MSMEColors.gradientWarm}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.recommendedCard, styles.elevation]}
                    >
                        <View style={styles.recommendedContent}>
                            <View>
                                <Text style={styles.recommendedTitle}>Track your expenses</Text>
                                <Text style={styles.recommendedSubtitle}>See where your money goes each week</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.recommendedButton}
                                onPress={() => navigation.navigate('Accounting')}
                            >
                                <Text style={styles.recommendedButtonText}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                {/* Modules Grid */}
                <View style={styles.modulesSection}>
                    <Text style={styles.sectionTitle}>Your Business Tools</Text>
                    <View style={styles.modulesGrid}>
                        {modules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                title={module.title}
                                iconName={module.iconName}
                                description={module.description}
                                count={module.count}
                                status={module.status}
                                variant={module.variant}
                                onPress={() => navigation.navigate(module.screen)}
                            />
                        ))}
                    </View>
                </View>

            </ScrollView>
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
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: MSMEColors.primary,
    },
    backButton: {
        marginRight: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MSMEColors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    heroSection: {
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 24,
        overflow: 'hidden',
        height: 180,
    },
    heroBg: {
        flex: 1,
    },
    heroBgImage: {
        borderRadius: 24,
    },
    heroGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    heroContent: {
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: MSMEColors.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
        textAlign: 'center',
    },
    heroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MSMEColors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    heroButtonIcon: {
        marginRight: 8,
    },
    heroButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: MSMEColors.primary,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    statCard: {
        width: '23%',
        backgroundColor: MSMEColors.white,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: MSMEColors.mutedForeground,
        marginTop: 4,
    },
    recommendedSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: MSMEColors.foreground,
    },
    recommendedCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    recommendedContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    recommendedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MSMEColors.white,
    },
    recommendedSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    recommendedButton: {
        backgroundColor: MSMEColors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    recommendedButtonText: {
        color: MSMEColors.groupBuy,
        fontWeight: '600',
    },
    modulesSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    modulesGrid: {
        flexDirection: 'column',
    },
    card: {
        backgroundColor: MSMEColors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeRecommended: {
        backgroundColor: MSMEColors.primary,
    },
    badgeNew: {
        backgroundColor: MSMEColors.secondary,
    },
    badgeActive: {
        backgroundColor: 'rgba(139, 51, 217, 0.1)',
    },
    badgeText: {
        color: MSMEColors.primaryForeground,
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: MSMEColors.foreground,
    },
    cardCount: {
        fontSize: 14,
        color: MSMEColors.mutedForeground,
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: MSMEColors.mutedForeground,
        marginBottom: 16,
    },
    cardButton: {
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    cardButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: MSMEColors.primaryForeground,
    },
    helpSection: {
        paddingHorizontal: 16,
        marginBottom: 40,
    },
    helpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MSMEColors.white,
        padding: 16,
        borderRadius: 16,
    },
    helpText: {
        flex: 1,
        fontSize: 16,
        color: MSMEColors.foreground,
        marginLeft: 12,
    },
    elevation: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default MSMEToolsScreen; 