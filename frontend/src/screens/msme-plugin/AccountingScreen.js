import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Divider, Chip, List, SegmentedButtons, FAB, RadioButton, Modal, Portal, Avatar, Menu, Searchbar } from 'react-native-paper';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';

// Mock inventory and sales data (in a real app, this would come from an API or database)
const mockInventoryItems = [
    { id: '1', name: 'Nasi Lemak', costPrice: 4.50, sellingPrice: 8.00, stock: 45, category: 'Food' },
    { id: '2', name: 'Chicken Rice', costPrice: 5.20, sellingPrice: 9.50, stock: 32, category: 'Food' },
    { id: '3', name: 'Roti Canai', costPrice: 0.80, sellingPrice: 1.50, stock: 60, category: 'Food' },
    { id: '4', name: 'Milo Dinosaur', costPrice: 2.20, sellingPrice: 5.00, stock: 25, category: 'Beverage' },
    { id: '5', name: 'Teh Tarik', costPrice: 1.00, sellingPrice: 2.50, stock: 40, category: 'Beverage' },
];

const mockSalesData = {
    daily: [
        { date: '2023-05-01', totalSales: 450, itemsSold: 54, expenses: 230 },
        { date: '2023-05-02', totalSales: 520, itemsSold: 62, expenses: 260 },
        { date: '2023-05-03', totalSales: 380, itemsSold: 45, expenses: 190 },
        { date: '2023-05-04', totalSales: 620, itemsSold: 73, expenses: 310 },
        { date: '2023-05-05', totalSales: 580, itemsSold: 68, expenses: 290 },
    ],
    weekly: [
        { week: 'Week 1', totalSales: 2950, itemsSold: 350, expenses: 1475 },
        { week: 'Week 2', totalSales: 3200, itemsSold: 380, expenses: 1600 },
        { week: 'Week 3', totalSales: 2800, itemsSold: 330, expenses: 1400 },
        { week: 'Week 4', totalSales: 3500, itemsSold: 420, expenses: 1750 },
    ],
    monthly: [
        { month: 'Jan', totalSales: 12500, itemsSold: 1500, expenses: 6250 },
        { month: 'Feb', totalSales: 11800, itemsSold: 1400, expenses: 5900 },
        { month: 'Mar', totalSales: 13200, itemsSold: 1580, expenses: 6600 },
        { month: 'Apr', totalSales: 14500, itemsSold: 1720, expenses: 7250 },
        { month: 'May', totalSales: 12450, itemsSold: 1470, expenses: 6225 },
    ]
};

const AnimatedCard = Animated.createAnimatedComponent(Card);

const AccountingScreen = ({ navigation }) => {
    // Modal and item selection states
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // State for saved reports to display on home screen
    const [savedReports, setSavedReports] = useState([]);

    // All the calculator tool tiles
    const toolTiles = [
        {
            key: 'profit',
            title: 'Profit Estimator',
            description: 'Calculate daily profit from sales and expenses',
            icon: 'calculator-outline',
            color: MSMEColors.stockGood,
            onPress: () => navigation.navigate('ProfitCalculator'),
        },
        {
            key: 'pricing',
            title: 'Pricing Helper',
            description: 'Set optimal selling price based on margin',
            icon: 'pricetag-outline',
            color: MSMEColors.accounting,
            onPress: () => navigation.navigate('PricingCalculator'),
        },
        {
            key: 'breakeven',
            title: 'Break-even Calculator',
            description: 'Find units needed to cover fixed costs',
            icon: 'trending-up-outline',
            color: MSMEColors.stockOut,
            onPress: () => navigation.navigate('BreakEvenCalculator'),
        },
        {
            key: 'cashflow',
            title: 'Cash Flow Projection',
            description: 'Forecast end-of-month cash position',
            icon: 'cash-outline',
            color: MSMEColors.stockGood,
            onPress: () => navigation.navigate('CashFlowCalculator'),
        },
        {
            key: 'tax',
            title: 'Tax Helper',
            description: 'Estimate tax liability',
            icon: 'document-text-outline',
            color: MSMEColors.accounting,
            onPress: () => navigation.navigate('TaxCalculator'),
        },
        {
            key: 'forecast',
            title: 'Sales Forecast',
            description: 'Predict future sales',
            icon: 'analytics-outline',
            color: MSMEColors.stockGood,
            onPress: () => navigation.navigate('SalesForecast'),
        },
        {
            key: 'valuation',
            title: 'Business Valuation',
            description: 'Estimate business worth',
            icon: 'business-outline',
            color: MSMEColors.accounting,
            onPress: () => navigation.navigate('BusinessValuation'),
        },
    ];

    // Helper function to determine report icon (for saved reports)
    const getReportIcon = (reportType) => {
        switch (reportType) {
            case 'profit': return 'calculator-outline';
            case 'pricing': return 'pricetag-outline';
            case 'breakeven': return 'trending-up-outline';
            case 'cashflow': return 'cash-outline';
            case 'tax': return 'document-text-outline';
            case 'forecast': return 'analytics-outline';
            case 'valuation': return 'business-outline';
            default: return 'document-outline';
        }
    };

    // Helper functions for interacting with inventory and sales data
    const fetchInventoryItems = useCallback(() => {
        // In a real app, this would be an API call
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            setIsLoading(false);
            return mockInventoryItems;
        }, 500);
    }, []);

    const fetchSalesData = useCallback((timeFrame = 'week') => {
        // In a real app, this would be an API call
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            setIsLoading(false);
            return mockSalesData[timeFrame] || mockSalesData.daily;
        }, 500);
    }, []);

    const selectProductForCalculation = (product) => {
        setSelectedItems(prev => {
            // Check if product is already selected
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                // If already selected, update quantity
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            } else {
                // If not selected, add to list with quantity 1
                return [...prev, { ...product, quantity: 1 }];
            }
        });
    };

    // Profit Calculator State
    const [revenue, setRevenue] = useState('5000');
    const [expenses, setExpenses] = useState('3500');
    const [expenseBreakdown, setExpenseBreakdown] = useState({
        rent: '1000',
        utilities: '300',
        inventory: '1500',
        salaries: '500',
        other: '200'
    });

    // Tax Calculator State
    const [businessType, setBusinessType] = useState('soleProprietor');
    const [annualRevenue, setAnnualRevenue] = useState('60000');
    const [annualExpenses, setAnnualExpenses] = useState('42000');
    const [taxYear, setTaxYear] = useState('2025');

    // Business Valuation State
    const [monthlyProfit, setMonthlyProfit] = useState('1500');
    const [businessAge, setBusinessAge] = useState('2');
    const [industryMultiplier, setIndustryMultiplier] = useState('3');
    const [assets, setAssets] = useState('15000');

    // Sales Forecast State
    const [baseSales, setBaseSales] = useState('5000');
    const [growthRate, setGrowthRate] = useState('5');
    const [forecastMonths, setForecastMonths] = useState('12');
    const [seasonality, setSeasonality] = useState('none');

    // NEW: Pricing Calculator State
    const [costPrice, setCostPrice] = useState('10');
    const [targetMargin, setTargetMargin] = useState('30');
    const [sellingPrice, setSellingPrice] = useState('14.29');

    // NEW: Break-even Calculator State
    const [fixedCosts, setFixedCosts] = useState('2000');
    const [costPerUnit, setCostPerUnit] = useState('5');
    const [breakEvenPrice, setBreakEvenPrice] = useState('15');
    const [breakEvenUnits, setBreakEvenUnits] = useState('200');

    // NEW: Cash Flow State
    const [dailyIncome, setDailyIncome] = useState('200');
    const [recurringExpenses, setRecurringExpenses] = useState('1500');
    const [cashFlowDays, setCashFlowDays] = useState('30');

    // Local Storage State
    const [currentReport, setCurrentReport] = useState(null);

    // Calculate profit
    const calculatedProfit = Number(revenue) - Number(expenses);
    const profitMargin = revenue > 0 ? ((calculatedProfit / Number(revenue)) * 100).toFixed(1) : 0;

    // Calculate pricing
    const calculatePricing = () => {
        const cost = Number(costPrice);
        const margin = Number(targetMargin) / 100;
        const calculatedSellingPrice = cost / (1 - margin);
        setSellingPrice(calculatedSellingPrice.toFixed(2));
        return calculatedSellingPrice;
    };

    // Calculate break-even
    const calculateBreakEven = () => {
        const fixed = Number(fixedCosts);
        const unitCost = Number(costPerUnit);
        const price = Number(breakEvenPrice);

        const units = fixed / (price - unitCost);
        setBreakEvenUnits(units.toFixed(0));
        return units;
    };

    // Calculate cash flow
    const calculateCashFlow = () => {
        const daily = Number(dailyIncome);
        const expenses = Number(recurringExpenses);
        const days = Number(cashFlowDays);

        const totalIncome = daily * days;
        const netCashFlow = totalIncome - expenses;

        return {
            totalIncome: totalIncome.toFixed(2),
            netCashFlow: netCashFlow.toFixed(2),
            dailyAverage: (netCashFlow / days).toFixed(2)
        };
    };

    const cashFlow = calculateCashFlow();

    // Calculate estimated tax
    const calculateTax = () => {
        const profit = Number(annualRevenue) - Number(annualExpenses);
        let taxRate = 0;

        // Simple tax calculation based on business type
        // This is highly simplified and not accurate for real tax calculations
        switch (businessType) {
            case 'soleProprietor':
                taxRate = profit < 50000 ? 0.15 : 0.20;
                break;
            case 'partnership':
                taxRate = profit < 50000 ? 0.15 : 0.22;
                break;
            case 'corporation':
                taxRate = 0.24;
                break;
            default:
                taxRate = 0.15;
        }

        const estimatedTax = profit * taxRate;
        const netIncome = profit - estimatedTax;

        return {
            profit,
            taxRate: (taxRate * 100).toFixed(1),
            estimatedTax: estimatedTax.toFixed(2),
            netIncome: netIncome.toFixed(2)
        };
    };

    const taxCalculation = calculateTax();

    // Calculate business valuation
    const calculateValuation = () => {
        // Simple business valuation method
        // Annual profit × Industry multiplier + Assets
        const annualProfit = Number(monthlyProfit) * 12;
        const valuationByMultiple = annualProfit * Number(industryMultiplier);
        const totalValuation = valuationByMultiple + Number(assets);

        return {
            annualProfit: annualProfit.toFixed(2),
            valuationByMultiple: valuationByMultiple.toFixed(2),
            assetValue: Number(assets).toFixed(2),
            totalValuation: totalValuation.toFixed(2)
        };
    };

    const valuation = calculateValuation();

    // Calculate sales forecast
    const calculateForecast = () => {
        const base = Number(baseSales);
        const growth = Number(growthRate) / 100;
        const months = Number(forecastMonths);

        let forecast = [];
        let total = 0;

        for (let i = 0; i < months; i++) {
            let monthSales = base * Math.pow(1 + growth, i / 12);

            // Apply seasonal adjustments if selected
            if (seasonality === 'retail') {
                // Higher sales in months 10-11 (Nov-Dec)
                if (i % 12 === 10 || i % 12 === 11) {
                    monthSales *= 1.5;
                }
            } else if (seasonality === 'food') {
                // Higher sales in months 5-7 (Jun-Aug)
                if (i % 12 >= 5 && i % 12 <= 7) {
                    monthSales *= 1.3;
                }
            }

            forecast.push(monthSales);
            total += monthSales;
        }

        return {
            forecastData: forecast,
            totalForecast: total.toFixed(2),
            averageMonthly: (total / months).toFixed(2)
        };
    };

    const forecast = calculateForecast();

    // Format forecast data for chart
    const forecastChartData = {
        labels: Array.from({ length: Number(forecastMonths) }, (_, i) => `M${i + 1}`),
        datasets: [
            {
                data: forecast.forecastData.map(val => Math.round(val))
            }
        ]
    };

    // Expense breakdown pie chart data
    const expensesPieData = Object.keys(expenseBreakdown).map((key, index) => {
        const colors = ['#3388DD', '#28A86B', '#E57822', '#8B33D9', '#E03A3A', '#F7C234'];
        const labels = {
            rent: 'Rent',
            utilities: 'Utilities',
            inventory: 'Inventory',
            salaries: 'Salaries',
            other: 'Other'
        };
        return {
            name: labels[key],
            amount: Number(expenseBreakdown[key]),
            color: colors[index % colors.length],
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        };
    });

    // Save report to local storage
    const saveReport = (type, data) => {
        const report = {
            id: Date.now(),
            type,
            data,
            timestamp: new Date().toISOString(),
            title: `${type} Report - ${new Date().toLocaleDateString()}`
        };

        const updatedReports = [...savedReports, report];
        setSavedReports(updatedReports);

        // In real implementation, save to Supabase
        console.log('Saving report to local storage:', report);

        Alert.alert(
            'Report Saved',
            'Your financial report has been saved locally.',
            [{ text: 'OK' }]
        );
    };

    // Export report (mock implementation)
    const exportReport = (type, data) => {
        Alert.alert(
            'Export Report',
            'Report exported successfully! (Mock implementation)',
            [{ text: 'OK' }]
        );
    };

    // Product selection modal
    const renderProductSelectionModal = () => (
        <Portal>
            <Modal
                visible={productModalVisible}
                onDismiss={() => setProductModalVisible(false)}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Products</Text>
                    <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                        <Ionicons name="close-circle" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <Searchbar
                    placeholder="Search products..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.modalSearchbar}
                />

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={MSMEColors.accounting} />
                        <Text style={styles.loadingText}>Loading products...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={mockInventoryItems.filter(item =>
                            item.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                        keyExtractor={item => item.id}
                        style={styles.productList}
                        renderItem={({ item }) => {
                            const isSelected = selectedItems.some(selected => selected.id === item.id);
                            const selectedItem = selectedItems.find(selected => selected.id === item.id);
                            const quantity = selectedItem?.quantity || 0;

                            return (
                                <TouchableOpacity
                                    style={[styles.productItem, isSelected && styles.selectedProductItem]}
                                    onPress={() => selectProductForCalculation(item)}
                                >
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName}>{item.name}</Text>
                                        <Text style={styles.productPrice}>Cost: RM {item.costPrice.toFixed(2)} | Price: RM {item.sellingPrice.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.productActions}>
                                        {isSelected && (
                                            <Chip mode="outlined" style={styles.quantityChip}>
                                                {quantity}
                                            </Chip>
                                        )}
                                        <Ionicons
                                            name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                                            size={24}
                                            color={isSelected ? MSMEColors.accounting : "#666"}
                                        />
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}

                <View style={styles.modalActions}>
                    <Button
                        mode="contained"
                        onPress={() => setProductModalVisible(false)}
                        style={styles.modalActionButton}
                    >
                        Done
                    </Button>
                </View>
            </Modal>
        </Portal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header - Updated to match MerchantLoansScreen */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.textDark || "#374151"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Financial Tools</Text>
                <View style={styles.placeholderButton} />
            </View>

            {/* Main content - grid of tools */}
            <ScrollView style={styles.content}>
                <View style={styles.toolsGrid}>
                    {toolTiles.map(tile => (
                        <Animated.View
                            key={tile.key}
                            style={styles.toolCardContainer}
                            entering={FadeInDown.delay(150 + toolTiles.indexOf(tile) * 50).springify()}
                        >
                            <TouchableOpacity
                                style={[styles.toolCard, { shadowColor: tile.color }]}
                                onPress={tile.onPress}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.toolIconContainer, { backgroundColor: `${tile.color}15` }]}>
                                    <Ionicons name={tile.icon} size={28} color={tile.color} />
                                </View>
                                <Text style={styles.toolTitle}>{tile.title}</Text>
                                <Text style={styles.toolDescription}>{tile.description}</Text>
                                <Ionicons name="chevron-forward" size={18} color="#ccc" style={styles.toolArrow} />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {savedReports.length > 0 && (
                    <View style={styles.recentReports}>
                        <Text style={styles.sectionTitle}>Recent Reports</Text>
                        <AnimatedCard
                            mode="elevated"
                            style={styles.reportsCard}
                            entering={FadeInDown.delay(350).springify()}
                        >
                            {savedReports.slice(-3).map((report) => (
                                <TouchableOpacity
                                    key={report.id}
                                    style={styles.reportItem}
                                    onPress={() => {
                                        // Navigate to appropriate calculator based on report type
                                        const calculatorMap = {
                                            'profit': 'ProfitCalculator',
                                            'pricing': 'PricingCalculator',
                                            'breakeven': 'BreakEvenCalculator',
                                            'cashflow': 'CashFlowCalculator',
                                            'tax': 'TaxCalculator',
                                            'forecast': 'SalesForecast',
                                            'valuation': 'BusinessValuation'
                                        };

                                        if (calculatorMap[report.type]) {
                                            navigation.navigate(calculatorMap[report.type]);
                                        }
                                    }}
                                >
                                    <View style={[styles.reportIconContainer, {
                                        backgroundColor: getReportColor(report.type),
                                    }]}>
                                        <Ionicons
                                            name={getReportIcon(report.type)}
                                            size={20}
                                            color="white"
                                        />
                                    </View>
                                    <View style={styles.reportContent}>
                                        <Text style={styles.reportTitle}>{report.title}</Text>
                                        <Text style={styles.reportDate}>
                                            {new Date(report.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </AnimatedCard>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// Helper function for report colors
const getReportColor = (reportType) => {
    switch (reportType) {
        case 'profit':
        case 'cashflow':
        case 'forecast':
            return MSMEColors.stockGood;
        case 'pricing':
        case 'tax':
        case 'valuation':
            return MSMEColors.accounting;
        case 'breakeven':
            return MSMEColors.stockOut;
        default:
            return MSMEColors.community;
    }
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
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MSMEColors.textDark || "#374151",
    },
    placeholderButton: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    toolsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    toolCardContainer: {
        width: '48%',
        marginBottom: 16,
    },
    toolCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 18,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        height: 160,
        justifyContent: 'space-between',
    },
    toolIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    toolTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 4,
    },
    toolDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginRight: 20,
        lineHeight: 18,
    },
    toolArrow: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
        marginTop: 8,
    },
    recentReports: {
        marginBottom: 24,
    },
    reportsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reportIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    reportDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 24,
        margin: 20,
        borderRadius: 12,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MSMEColors.accounting,
    },
    modalSearchbar: {
        marginBottom: 16,
        borderRadius: 10,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
    },
    productList: {
        maxHeight: 400,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedProductItem: {
        backgroundColor: `${MSMEColors.accounting}10`,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    productPrice: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    productActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityChip: {
        marginRight: 10,
        height: 28,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    modalActionButton: {
        backgroundColor: MSMEColors.accounting,
    },
});

export default AccountingScreen; 