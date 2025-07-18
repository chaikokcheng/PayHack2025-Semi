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
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Divider, Chip, List, SegmentedButtons, FAB } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LineChart, PieChart } from 'react-native-chart-kit';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const AccountingScreen = ({ navigation }) => {
    const [timeFrame, setTimeFrame] = useState('week');
    const [transactionFilter, setTransactionFilter] = useState('all');

    // Sample finance data
    const financeData = {
        week: {
            income: 350,
            expenses: 180,
            balance: 170,
            transactions: [
                { id: '1', type: 'income', amount: 150, description: 'Sales - Food stall', category: 'Sales', date: '2025-08-15', time: '14:30' },
                { id: '2', type: 'income', amount: 200, description: 'Online orders', category: 'Sales', date: '2025-08-16', time: '18:45' },
                { id: '3', type: 'expense', amount: 50, description: 'Raw ingredients', category: 'Inventory', date: '2025-08-16', time: '09:15' },
                { id: '4', type: 'expense', amount: 30, description: 'Packaging materials', category: 'Supplies', date: '2025-08-17', time: '11:20' },
                { id: '5', type: 'expense', amount: 100, description: 'Rent', category: 'Rent', date: '2025-08-18', time: '16:00' },
            ],
            lineData: [120, 80, 180, 90, 150, 230, 350]
        },
        month: {
            income: 1250,
            expenses: 780,
            balance: 470,
            transactions: [
                { id: '6', type: 'income', amount: 350, description: 'Weekly sales', category: 'Sales', date: '2025-08-07', time: '20:00' },
                { id: '7', type: 'income', amount: 400, description: 'Weekly sales', category: 'Sales', date: '2025-08-14', time: '20:00' },
                { id: '8', type: 'income', amount: 350, description: 'Weekly sales', category: 'Sales', date: '2025-08-21', time: '20:00' },
                { id: '9', type: 'expense', amount: 150, description: 'Weekly supplies', category: 'Supplies', date: '2025-08-05', time: '10:30' },
                { id: '10', type: 'expense', amount: 280, description: 'Equipment repair', category: 'Equipment', date: '2025-08-12', time: '14:15' },
                { id: '11', type: 'expense', amount: 350, description: 'Rent', category: 'Rent', date: '2025-08-01', time: '09:00' },
            ],
            lineData: [200, 450, 280, 350, 400, 320, 480, 500, 350, 300, 410, 550]
        },
        year: {
            income: 12800,
            expenses: 9600,
            balance: 3200,
            transactions: [
                { id: '12', type: 'income', amount: 1200, description: 'Monthly sales', category: 'Sales', date: '2025-07-31', time: '23:59' },
                { id: '13', type: 'income', amount: 1450, description: 'Monthly sales', category: 'Sales', date: '2025-06-30', time: '23:59' },
                { id: '14', type: 'expense', amount: 850, description: 'Monthly expenses', category: 'Various', date: '2025-07-31', time: '23:59' },
                { id: '15', type: 'expense', amount: 920, description: 'Monthly expenses', category: 'Various', date: '2025-06-30', time: '23:59' },
            ],
            lineData: [800, 950, 1100, 900, 1200, 1000, 1300, 1250, 1400, 1500, 1550, 1600]
        }
    };

    // Get active data based on selected timeframe
    const activeData = financeData[timeFrame];

    // Filter transactions based on selected filter
    const filteredTransactions = activeData.transactions.filter(transaction => {
        if (transactionFilter === 'income') return transaction.type === 'income';
        if (transactionFilter === 'expense') return transaction.type === 'expense';
        return true; // 'all' filter
    });

    // Data for pie chart
    const expensesByCategory = {};
    activeData.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!expensesByCategory[t.category]) {
                expensesByCategory[t.category] = 0;
            }
            expensesByCategory[t.category] += t.amount;
        });

    const pieChartData = Object.keys(expensesByCategory).map((category, index) => {
        const colors = ['#3388DD', '#28A86B', '#E57822', '#8B33D9', '#E03A3A', '#F7C234'];
        return {
            name: category,
            amount: expensesByCategory[category],
            color: colors[index % colors.length],
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        };
    });

    // Line chart configuration
    const lineChartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(51, 136, 221, ${opacity})`,
        strokeWidth: 2,
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#fff'
        }
    };

    const lineChartLabels = {
        week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        month: ['W1', 'W2', 'W3', 'W4'],
        year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };

    const lineChartData = {
        labels: lineChartLabels[timeFrame],
        datasets: [
            {
                data: activeData.lineData.length > lineChartLabels[timeFrame].length ?
                    activeData.lineData.slice(0, lineChartLabels[timeFrame].length) :
                    activeData.lineData
            }
        ],
    };

    // Helper function for formatting amounts
    const formatAmount = (amount) => {
        return `RM ${amount.toFixed(2)}`;
    };

    // Calculate stats
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = filteredTransactions.length > 0 ?
        filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length :
        0;

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
                            <Text style={styles.headerTitle}>Money Manager</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Track income & expenses</Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Time frame selector */}
                <SegmentedButtons
                    value={timeFrame}
                    onValueChange={setTimeFrame}
                    buttons={[
                        { value: 'week', label: 'Week' },
                        { value: 'month', label: 'Month' },
                        { value: 'year', label: 'Year' },
                    ]}
                    style={styles.timeFrameSelector}
                />

                {/* Summary Card */}
                <AnimatedCard
                    mode="elevated"
                    style={styles.summaryCard}
                    entering={FadeInDown.delay(100).springify()}
                >
                    <Card.Content style={styles.summaryContent}>
                        <View style={styles.balanceSection}>
                            <Text style={styles.balanceLabel}>Current Balance</Text>
                            <Text style={styles.balanceAmount}>{formatAmount(activeData.balance)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Ionicons name="arrow-down-circle" size={24} color={MSMEColors.stockGood} style={styles.summaryIcon} />
                                <Text style={styles.summaryValue}>{formatAmount(activeData.income)}</Text>
                                <Text style={styles.summaryLabel}>Income</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.summaryItem}>
                                <Ionicons name="arrow-up-circle" size={24} color={MSMEColors.stockOut} style={styles.summaryIcon} />
                                <Text style={styles.summaryValue}>{formatAmount(activeData.expenses)}</Text>
                                <Text style={styles.summaryLabel}>Expenses</Text>
                            </View>
                        </View>
                    </Card.Content>
                </AnimatedCard>

                {/* Charts Section */}
                <View style={styles.chartsContainer}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <AnimatedCard
                        mode="elevated"
                        style={styles.chartCard}
                        entering={FadeInDown.delay(200).springify()}
                    >
                        <Card.Content>
                            <Text style={styles.chartTitle}>Income Trend</Text>
                            <View style={styles.chartContainer}>
                                <LineChart
                                    data={lineChartData}
                                    width={Dimensions.get('window').width - 64}
                                    height={180}
                                    chartConfig={lineChartConfig}
                                    bezier
                                    style={styles.chart}
                                />
                            </View>
                        </Card.Content>
                    </AnimatedCard>

                    {pieChartData.length > 0 && (
                        <AnimatedCard
                            mode="elevated"
                            style={styles.chartCard}
                            entering={FadeInDown.delay(300).springify()}
                        >
                            <Card.Content>
                                <Text style={styles.chartTitle}>Expense Breakdown</Text>
                                <View style={styles.pieChartContainer}>
                                    <PieChart
                                        data={pieChartData}
                                        width={Dimensions.get('window').width - 64}
                                        height={180}
                                        chartConfig={lineChartConfig}
                                        accessor="amount"
                                        backgroundColor="transparent"
                                        paddingLeft="10"
                                        center={[10, 0]}
                                        absolute
                                    />
                                </View>
                            </Card.Content>
                        </AnimatedCard>
                    )}
                </View>

                {/* Transactions Section */}
                <View style={styles.transactionsSection}>
                    <View style={styles.transactionHeader}>
                        <Text style={styles.sectionTitle}>Transactions</Text>
                        <View style={styles.transactionFilters}>
                            <Chip
                                selected={transactionFilter === 'all'}
                                onPress={() => setTransactionFilter('all')}
                                style={[styles.filterChip, transactionFilter === 'all' && styles.selectedChip]}
                                textStyle={[styles.filterChipText, transactionFilter === 'all' && styles.selectedChipText]}
                            >
                                All
                            </Chip>
                            <Chip
                                selected={transactionFilter === 'income'}
                                onPress={() => setTransactionFilter('income')}
                                style={[styles.filterChip, transactionFilter === 'income' && styles.incomeSelectedChip]}
                                textStyle={[styles.filterChipText, transactionFilter === 'income' && styles.selectedChipText]}
                            >
                                Income
                            </Chip>
                            <Chip
                                selected={transactionFilter === 'expense'}
                                onPress={() => setTransactionFilter('expense')}
                                style={[styles.filterChip, transactionFilter === 'expense' && styles.expenseSelectedChip]}
                                textStyle={[styles.filterChipText, transactionFilter === 'expense' && styles.selectedChipText]}
                            >
                                Expense
                            </Chip>
                        </View>
                    </View>

                    <AnimatedCard
                        mode="elevated"
                        style={styles.statsCard}
                        entering={FadeInDown.delay(400).springify()}
                    >
                        <Card.Content style={styles.statsContent}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totalTransactions}</Text>
                                <Text style={styles.statLabel}>Transactions</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{formatAmount(averageTransaction)}</Text>
                                <Text style={styles.statLabel}>Average</Text>
                            </View>
                        </Card.Content>
                    </AnimatedCard>

                    {filteredTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyStateText}>No transactions found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Add your first transaction to start tracking
                            </Text>
                        </View>
                    ) : (
                        <AnimatedCard
                            mode="elevated"
                            style={styles.transactionsCard}
                            entering={FadeInDown.delay(500).springify()}
                        >
                            {filteredTransactions.map((transaction, index) => {
                                const isIncome = transaction.type === 'income';
                                return (
                                    <React.Fragment key={transaction.id}>
                                        {index > 0 && <Divider style={styles.transactionDivider} />}
                                        <List.Item
                                            title={transaction.description}
                                            description={`${transaction.category} • ${transaction.date}`}
                                            left={props => (
                                                <View style={[
                                                    styles.transactionIconContainer,
                                                    isIncome ? styles.incomeIconContainer : styles.expenseIconContainer
                                                ]}>
                                                    <Ionicons
                                                        name={isIncome ? "arrow-down" : "arrow-up"}
                                                        size={16}
                                                        color={isIncome ? MSMEColors.stockGood : MSMEColors.stockOut}
                                                    />
                                                </View>
                                            )}
                                            right={props => (
                                                <Text style={[
                                                    styles.transactionAmount,
                                                    isIncome ? styles.incomeAmount : styles.expenseAmount
                                                ]}>
                                                    {isIncome ? '+' : '-'} {formatAmount(transaction.amount)}
                                                </Text>
                                            )}
                                            style={styles.transactionItem}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </AnimatedCard>
                    )}
                </View>
            </ScrollView>

            {/* FABs */}
            <FAB
                icon="plus"
                label="Add Income"
                color="#FFF"
                style={[styles.fab, styles.incomeFab]}
                customSize={48}
                onPress={() => console.log('Add Income')}
            />

            <FAB
                icon="minus"
                label="Add Expense"
                color="#FFF"
                style={[styles.fab, styles.expenseFab]}
                customSize={48}
                onPress={() => console.log('Add Expense')}
            />
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
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    timeFrameSelector: {
        marginBottom: 16,
    },
    summaryCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    summaryContent: {
        padding: 8,
    },
    balanceSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: MSMEColors.accounting,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryIcon: {
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    chartsContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: MSMEColors.foreground,
    },
    chartCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: MSMEColors.foreground,
    },
    chartContainer: {
        alignItems: 'center',
    },
    chart: {
        borderRadius: 8,
    },
    pieChartContainer: {
        alignItems: 'center',
        marginLeft: -20,
    },
    transactionsSection: {
        marginBottom: 80, // Space for FABs
    },
    transactionHeader: {
        marginBottom: 12,
    },
    transactionFilters: {
        flexDirection: 'row',
        marginTop: 8,
    },
    filterChip: {
        marginRight: 8,
        backgroundColor: '#F0F0F0',
    },
    selectedChip: {
        backgroundColor: `${MSMEColors.accounting}20`,
    },
    incomeSelectedChip: {
        backgroundColor: `${MSMEColors.stockGood}20`,
    },
    expenseSelectedChip: {
        backgroundColor: `${MSMEColors.stockOut}20`,
    },
    filterChipText: {
        color: '#666',
    },
    selectedChipText: {
        color: MSMEColors.accounting,
        fontWeight: '600',
    },
    statsCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    statsContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MSMEColors.accounting,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },
    transactionsCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    transactionDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    transactionItem: {
        paddingVertical: 8,
    },
    transactionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginVertical: 8,
    },
    incomeIconContainer: {
        backgroundColor: `${MSMEColors.stockGood}20`,
    },
    expenseIconContainer: {
        backgroundColor: `${MSMEColors.stockOut}20`,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    incomeAmount: {
        color: MSMEColors.stockGood,
    },
    expenseAmount: {
        color: MSMEColors.stockOut,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        color: '#666',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        right: 16,
        borderRadius: 24,
        paddingHorizontal: 8,
    },
    incomeFab: {
        bottom: 16,
        backgroundColor: MSMEColors.stockGood,
    },
    expenseFab: {
        bottom: 72,
        backgroundColor: MSMEColors.stockOut,
    },
});

export default AccountingScreen; 