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
import DateTimePicker from '@react-native-community/datetimepicker';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';
import { getAllInventory } from '../../models/inventory';
import { getProfit, getSalesSummary, getTransactions } from '../../models/msmeMockData';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const ProfitCalculatorScreen = ({ navigation }) => {
    // All state variables at top level
    const [timeFrame, setTimeFrame] = useState('week');
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [revenue, setRevenue] = useState('0');
    const [expenses, setExpenses] = useState('0');
    const [soldItems, setSoldItems] = useState('0');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('start');
    const [expenseBreakdown, setExpenseBreakdown] = useState({
        rent: '0',
        utilities: '0',
        inventory: '0',
        salaries: '0',
        other: '0'
    });

    // Replace mockInventoryItems with inventory from inventory.js
    const [inventoryItems, setInventoryItems] = useState(getAllInventory());

    // Helper functions
    const fetchInventoryItems = useCallback(() => {
        // In a real app, this would be an API call
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            setIsLoading(false);
            return inventoryItems;
        }, 500);
    }, [inventoryItems]);

    const fetchSalesData = useCallback((fromDate, toDate) => {
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            setIsLoading(false);
            const from = fromDate.toISOString().split('T')[0];
            const to = toDate.toISOString().split('T')[0];

            const salesData = getSalesSummary({ from, to });
            const profitData = getProfit({ from, to });
            const totalUnits = salesData.reduce((sum, day) => sum + (day.totalUnits || 0), 0);

            setRevenue(profitData.totalSales.toString());
            setSoldItems(totalUnits.toString());

            // Calculate actual sold quantities for each product
            const soldQuantities = {};
            const salesTransactions = getTransactions({ type: 'sale', from, to });

            salesTransactions.forEach(txn => {
                if (!soldQuantities[txn.productId]) {
                    soldQuantities[txn.productId] = 0;
                }
                soldQuantities[txn.productId] += txn.qty;
            });

            // Get all products that were sold in this period
            const soldProductIds = Object.keys(soldQuantities);
            const soldProducts = inventoryItems.filter(item => soldProductIds.includes(item.id));

            // Update selected items with actual sold quantities and add new sold products
            setSelectedItems(prev => {
                const updatedItems = prev.map(item => ({
                    ...item,
                    quantity: soldQuantities[item.id] || item.quantity || 0
                }));

                // Add products that were sold but not in selected items
                soldProducts.forEach(product => {
                    const exists = updatedItems.find(item => item.id === product.id);
                    if (!exists) {
                        updatedItems.push({
                            ...product,
                            quantity: soldQuantities[product.id] || 0
                        });
                    }
                });

                return updatedItems;
            });

            return { salesData, profitData };
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
    const rawProfitMargin = Number(revenue) > 0 ? (calculatedProfit / Number(revenue)) * 100 : null;
    const profitMargin = Number.isFinite(rawProfitMargin) ? rawProfitMargin.toFixed(1) : '-';

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

    // Update total expenses when breakdown changes or products are added
    useEffect(() => {
        // Calculate expenses from selected products (cost * quantity)
        const productsTotal = selectedItems.reduce((sum, item) => {
            const cost = typeof item.cost === 'number' ? item.cost : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            return sum + (cost * quantity);
        }, 0);

        // Calculate manual expenses (all fields including inventory)
        const manualExpenses = Object.values(expenseBreakdown).reduce((sum, value) => {
            return sum + Number(value);
        }, 0);

        // Total expenses = manual expenses + products
        const total = manualExpenses + productsTotal;
        setExpenses(total.toString());
    }, [expenseBreakdown, selectedItems]);

    // Update dates and fetch data when timeframe changes
    useEffect(() => {
        const today = new Date();
        let newStartDate, newEndDate;

        if (timeFrame === 'day') {
            newStartDate = newEndDate = today;
        } else if (timeFrame === 'week') {
            newEndDate = today;
            newStartDate = new Date(today);
            newStartDate.setDate(today.getDate() - 7);
        } else if (timeFrame === 'month') {
            newEndDate = today;
            newStartDate = new Date(today);
            newStartDate.setMonth(today.getMonth() - 1);
        } else if (timeFrame === 'custom') {
            // Keep existing dates for custom range
            return;
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
        fetchSalesData(newStartDate, newEndDate);
    }, [timeFrame, fetchSalesData]);

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

    // Date picker handlers
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (datePickerMode === 'start') {
                setStartDate(selectedDate);
                setTimeFrame('custom');
            } else {
                setEndDate(selectedDate);
                setTimeFrame('custom');
            }
            fetchSalesData(startDate, selectedDate);
        }
    };

    const showDatePickerModal = (mode) => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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
                        data={inventoryItems.filter(item =>
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
                                        <Text style={styles.productPrice}>Cost: RM {typeof item.cost === 'number' ? item.cost.toFixed(2) : '-'} | Price: RM {typeof item.price === 'number' ? item.price.toFixed(2) : '-'}</Text>
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
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.accounting} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profit Calculator</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Product Selection Modal */}
            {renderProductSelectionModal()}

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={datePickerMode === 'start' ? startDate : endDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {/* Content */}
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
                                    { value: 'custom', label: 'Custom' },
                                ]}
                                style={styles.segmentButtons}
                            />
                        </View>

                        {timeFrame === 'custom' && (
                            <View style={styles.dateRangeContainer}>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => showDatePickerModal('start')}
                                >
                                    <Ionicons name="calendar-outline" size={16} color={MSMEColors.accounting} />
                                    <Text style={styles.dateButtonText}>From: {formatDate(startDate)}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => showDatePickerModal('end')}
                                >
                                    <Ionicons name="calendar-outline" size={16} color={MSMEColors.accounting} />
                                    <Text style={styles.dateButtonText}>To: {formatDate(endDate)}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.salesDataContainer}>
                            <View style={styles.dataCard}>
                                <Ionicons name="cash-outline" size={24} color={MSMEColors.accounting} />
                                <Text style={styles.dataLabel}>Sales</Text>
                                <Text style={styles.dataValue}>RM {revenue}</Text>
                                <Text style={styles.dataTrend}>↑ 12%</Text>
                            </View>

                            <View style={styles.dataCard}>
                                <Ionicons name="trending-up-outline" size={24} color={MSMEColors.stockGood} />
                                <Text style={styles.dataLabel}>Sold Items</Text>
                                <Text style={styles.dataValue}>{soldItems}</Text>
                                <Text style={styles.dataTrend}>↑ 8%</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Revenue (RM)</Text>
                            <View style={styles.inputWithIcon}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    value={revenue}
                                    onChangeText={setRevenue}
                                    keyboardType="numeric"
                                    placeholder="Enter your revenue"
                                    editable={revenue === '0'}
                                />
                                {revenue !== '0' && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color={MSMEColors.stockGood}
                                        style={styles.inputIcon}
                                    />
                                )}
                            </View>
                            {revenue !== '0' && (
                                <Text style={styles.inputHelperText}>
                                    Revenue fetched from sales data
                                </Text>
                            )}
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
                                        {item.name} ({item.quantity} sold) - RM{typeof item.cost === 'number' && typeof item.quantity === 'number' ? (item.cost * item.quantity).toFixed(2) : '-'}
                                    </Chip>
                                ))}
                                <Text style={styles.inputHelperText}>
                                    Quantities updated from actual sales data
                                </Text>
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
                                {key === 'inventory' && selectedItems.length > 0 && (
                                    <Text style={styles.inputHelperText}>
                                        Additional to products: RM {selectedItems.reduce((sum, item) => {
                                            const cost = typeof item.cost === 'number' ? item.cost : 0;
                                            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                                            return sum + (cost * quantity);
                                        }, 0).toFixed(2)}
                                    </Text>
                                )}
                            </View>
                        ))}

                        <Divider style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Total Expenses (RM)</Text>
                            <View style={styles.inputWithIcon}>
                                <Text style={[styles.calculatedValue, { flex: 1 }]}>{expenses}</Text>
                                {selectedItems.length > 0 && (
                                    <Ionicons
                                        name="cube"
                                        size={20}
                                        color={MSMEColors.accounting}
                                        style={styles.inputIcon}
                                    />
                                )}
                            </View>
                            {selectedItems.length > 0 && (
                                <Text style={styles.inputHelperText}>
                                    Manual expenses: RM {Object.values(expenseBreakdown).reduce((sum, value) => sum + Number(value), 0).toFixed(2)} + Products: RM {selectedItems.reduce((sum, item) => {
                                        const cost = typeof item.cost === 'number' ? item.cost : 0;
                                        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                                        return sum + (cost * quantity);
                                    }, 0).toFixed(2)}
                                </Text>
                            )}
                        </View>

                        <View style={styles.resultsSection}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Profit:</Text>
                                <Text style={[
                                    styles.resultValue,
                                    calculatedProfit >= 0 ? styles.positiveValue : styles.negativeValue
                                ]}>
                                    RM {Number.isFinite(calculatedProfit) ? calculatedProfit.toFixed(2) : '-'}
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
        color: MSMEColors.accounting,
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
    dateRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 4,
    },
    dateButtonText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 6,
        fontWeight: '500',
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
    inputHelperText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
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