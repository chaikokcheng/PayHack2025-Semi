import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Platform,
    Alert,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Divider, Chip, SegmentedButtons, Modal, Portal, Searchbar } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PieChart } from 'react-native-chart-kit';

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

const ProfitCalculatorScreen = ({ navigation }) => {
    // All state variables at top level
    const [timeFrame, setTimeFrame] = useState('week');
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [revenue, setRevenue] = useState('5000');
    const [expenses, setExpenses] = useState('3500');
    const [expenseBreakdown, setExpenseBreakdown] = useState({
        rent: '1000',
        utilities: '300',
        inventory: '1500',
        salaries: '500',
        other: '200'
    });

    // Helper functions
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

    // Calculate profit
    const calculatedProfit = Number(revenue) - Number(expenses);
    const profitMargin = revenue > 0 ? ((calculatedProfit / Number(revenue)) * 100).toFixed(1) : 0;

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

    // Update total expenses when breakdown changes
    useEffect(() => {
        const total = Object.values(expenseBreakdown).reduce((sum, val) => sum + Number(val), 0);
        setExpenses(total.toString());
    }, [expenseBreakdown]);

    // Save report to local storage
    const saveReport = (type, data) => {
        // In real implementation, save to Supabase
        console.log('Saving report to local storage:', {
            id: Date.now(),
            type,
            data,
            timestamp: new Date().toISOString(),
            title: `${type} Report - ${new Date().toLocaleDateString()}`
        });

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

    // Helper function to get icons for expense categories
    const getExpenseIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'rent': return 'home-outline';
            case 'utilities': return 'flash-outline';
            case 'inventory': return 'cube-outline';
            case 'salaries': return 'people-outline';
            case 'other': return 'ellipsis-horizontal-outline';
            default: return 'cash-outline';
        }
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
            {/* Header */}
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
                            <Ionicons name="calculator-outline" size={24} color="white" style={styles.titleIcon} />
                            <Text style={styles.headerTitle}>Profit Calculator</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Calculate profit from sales and expenses</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Product Selection Modal */}
            {renderProductSelectionModal()}

            <ScrollView style={styles.content}>
                <AnimatedCard
                    mode="elevated"
                    style={styles.calculatorCard}
                    entering={FadeInDown.delay(100).springify()}
                >
                    <Card.Content>
                        <Text style={styles.calculatorTitle}>Profit Calculator</Text>
                        <Text style={styles.calculatorSubtitle}>Calculate profit from sales and expenses</Text>

                        <View style={styles.segmentContainer}>
                            <SegmentedButtons
                                value={timeFrame}
                                onValueChange={setTimeFrame}
                                buttons={[
                                    { value: 'day', label: 'Today' },
                                    { value: 'week', label: 'Week' },
                                    { value: 'month', label: 'Month' },
                                ]}
                                style={styles.segmentButtons}
                            />
                        </View>

                        <View style={styles.salesDataContainer}>
                            <View style={styles.dataCard}>
                                <Ionicons name="cash-outline" size={24} color={MSMEColors.accounting} />
                                <Text style={styles.dataLabel}>Sales</Text>
                                <Text style={styles.dataValue}>RM 5,800</Text>
                                <Text style={styles.dataTrend}>↑ 12%</Text>
                            </View>

                            <View style={styles.dataCard}>
                                <Ionicons name="trending-up-outline" size={24} color={MSMEColors.stockGood} />
                                <Text style={styles.dataLabel}>Sold Items</Text>
                                <Text style={styles.dataValue}>680</Text>
                                <Text style={styles.dataTrend}>↑ 8%</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroupWithButton}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Revenue (RM)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={revenue}
                                    onChangeText={setRevenue}
                                    keyboardType="numeric"
                                    placeholder="Enter your revenue"
                                />
                            </View>
                            <Button
                                mode="contained"
                                onPress={() => {
                                    // Use actual sales data based on timeframe
                                    const salesData = fetchSalesData(timeFrame);
                                    const latestDay = salesData[salesData.length - 1];
                                    setRevenue(latestDay.totalSales.toString());
                                }}
                                style={styles.fetchButton}
                            >
                                Fetch Sales
                            </Button>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionSubtitle}>Expenses Breakdown</Text>
                            <TouchableOpacity
                                style={styles.addProductButton}
                                onPress={() => setProductModalVisible(true)}
                            >
                                <Ionicons name="cart-outline" size={20} color={MSMEColors.accounting} />
                                <Text style={styles.addProductText}>Add Products</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedItems.length > 0 && (
                            <View style={styles.selectedProductsContainer}>
                                {selectedItems.map(item => (
                                    <Chip
                                        key={item.id}
                                        style={styles.selectedProductChip}
                                        icon="tag"
                                        onClose={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                                    >
                                        {item.name} ({item.quantity}) - RM{(item.costPrice * item.quantity).toFixed(2)}
                                    </Chip>
                                ))}
                            </View>
                        )}

                        {Object.keys(expenseBreakdown).map((key) => (
                            <View key={key} style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)} (RM)
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <TextInput
                                        style={[styles.textInput, { flex: 1 }]}
                                        value={expenseBreakdown[key]}
                                        onChangeText={(value) => setExpenseBreakdown({ ...expenseBreakdown, [key]: value })}
                                        keyboardType="numeric"
                                        placeholder={`Enter ${key} expense`}
                                    />
                                    <Ionicons
                                        name={getExpenseIcon(key)}
                                        size={20}
                                        color="#666"
                                        style={styles.inputIcon}
                                    />
                                </View>
                            </View>
                        ))}

                        <Divider style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Total Expenses (RM)</Text>
                            <Text style={styles.calculatedValue}>{expenses}</Text>
                        </View>

                        <View style={styles.resultsSection}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Profit:</Text>
                                <Text style={[
                                    styles.resultValue,
                                    calculatedProfit >= 0 ? styles.positiveValue : styles.negativeValue
                                ]}>
                                    RM {calculatedProfit.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Profit Margin:</Text>
                                <Text style={[
                                    styles.resultValue,
                                    calculatedProfit >= 0 ? styles.positiveValue : styles.negativeValue
                                ]}>
                                    {profitMargin}%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <Button
                                mode="contained"
                                onPress={() => saveReport('profit', { revenue, expenses, calculatedProfit, profitMargin, expenseBreakdown, selectedItems })}
                                style={[styles.actionButton, { backgroundColor: MSMEColors.stockGood }]}
                            >
                                Save Report
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => exportReport('profit', { revenue, expenses, calculatedProfit, profitMargin, expenseBreakdown, selectedItems })}
                                style={styles.actionButton}
                            >
                                Export
                            </Button>
                        </View>
                    </Card.Content>
                </AnimatedCard>

                <AnimatedCard
                    mode="elevated"
                    style={styles.chartCard}
                    entering={FadeInDown.delay(200).springify()}
                >
                    <Card.Content>
                        <Text style={styles.chartTitle}>Expense Breakdown</Text>

                        {Number(expenses) > 0 ? (
                            <View style={styles.pieChartContainer}>
                                <PieChart
                                    data={expensesPieData}
                                    width={Dimensions.get('window').width - 64}
                                    height={220}
                                    chartConfig={{
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    }}
                                    accessor="amount"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                />
                            </View>
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>Add expenses to see breakdown</Text>
                            </View>
                        )}
                    </Card.Content>
                </AnimatedCard>
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
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    calculatorCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    calculatorTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        color: MSMEColors.accounting,
    },
    calculatorSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    chartCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    divider: {
        marginVertical: 20,
    },
    resultsSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
        marginVertical: 16,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    resultLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    resultValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '700',
    },
    positiveValue: {
        color: MSMEColors.stockGood,
    },
    negativeValue: {
        color: MSMEColors.stockOut,
    },
    calculatedValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    segmentContainer: {
        marginBottom: 16,
    },
    segmentButtons: {
        backgroundColor: '#f0f0f0',
    },
    salesDataContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dataCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        width: '48%',
    },
    dataLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    dataValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginVertical: 2,
    },
    dataTrend: {
        fontSize: 12,
        color: MSMEColors.stockGood,
    },
    inputGroupWithButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
        gap: 8,
    },
    fetchButton: {
        backgroundColor: MSMEColors.accounting,
        height: 50,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addProductButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addProductText: {
        color: MSMEColors.accounting,
        marginLeft: 4,
        fontWeight: '500',
    },
    selectedProductsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    selectedProductChip: {
        margin: 4,
        backgroundColor: `${MSMEColors.accounting}15`,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        marginLeft: 10,
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
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    pieChartContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    noDataContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        color: '#6B7280',
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 10,
    },
});

export default ProfitCalculatorScreen; 