import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// MSMEColors for consistency
const MSMEColors = {
    accounting: '#28A86B',
    inventory: '#3388DD',
    breakeven: '#E57822',
    tax: '#8B33D9',
    forecast: '#F7C234',
    background: '#F9FAFB',
    card: '#FFFFFF',
};

const AccountingScreen = ({ navigation }) => {
    // All the calculator tool tiles
    const toolTiles = [
        {
            key: 'profit',
            title: 'Profit Estimator',
            description: 'Calculate daily profit from sales and expenses',
            icon: 'calculator-outline',
            color: MSMEColors.accounting,
            onPress: () => navigation.navigate('ProfitCalculatorScreen'),
        },
        {
            key: 'pricing',
            title: 'Pricing Helper',
            description: 'Set optimal selling price based on margin',
            icon: 'pricetag-outline',
            color: MSMEColors.inventory,
            onPress: () => navigation.navigate('PricingCalculatorScreen'),
        },
        {
            key: 'breakeven',
            title: 'Break-even Calculator',
            description: 'Find units needed to cover fixed costs',
            icon: 'trending-up-outline',
            color: MSMEColors.breakeven,
            onPress: () => navigation.navigate('BreakEvenCalculatorScreen'),
        },
        {
            key: 'cashflow',
            title: 'Cash Flow Projection',
            description: 'Forecast end-of-month cash position',
            icon: 'cash-outline',
            color: MSMEColors.accounting,
            onPress: () => navigation.navigate('CashFlowCalculatorScreen'),
        },
        {
            key: 'tax',
            title: 'Tax Helper',
            description: 'Estimate tax liability',
            icon: 'document-text-outline',
            color: MSMEColors.inventory,
            onPress: () => navigation.navigate('TaxCalculatorScreen'),
        },
        {
            key: 'forecast',
            title: 'Sales Forecast',
            description: 'Predict future sales',
            icon: 'analytics-outline',
            color: MSMEColors.accounting,
            onPress: () => navigation.navigate('SalesForecastScreen'),
        },
        {
            key: 'valuation',
            title: 'Business Valuation',
            description: 'Estimate business worth',
            icon: 'business-outline',
            color: MSMEColors.inventory,
            onPress: () => navigation.navigate('BusinessValuationScreen'),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Financial Tools</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introduction}>
                    <Text style={styles.introTitle}>Manage Your Finances</Text>
                    <Text style={styles.introText}>
                        Simple tools to help you make financial decisions for your business.
                    </Text>
                </View>

                <View style={styles.toolsGrid}>
                    {toolTiles.map(tool => (
                        <TouchableOpacity
                            key={tool.key}
                            style={styles.toolCard}
                            onPress={tool.onPress}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: tool.color + '15' }]}>
                                <Ionicons name={tool.icon} size={24} color={tool.color} />
                            </View>
                            <Text style={styles.toolTitle}>{tool.title}</Text>
                            <Text style={styles.toolDescription} numberOfLines={2}>{tool.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    introduction: {
        marginBottom: 24,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    introText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    toolsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    toolCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    toolTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 6,
    },
    toolDescription: {
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 16,
    },
});

export default AccountingScreen; 