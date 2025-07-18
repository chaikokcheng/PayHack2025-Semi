import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Divider } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const CashFlowCalculatorScreen = ({ navigation }) => {
    // All state variables at top level
    const [dailyIncome, setDailyIncome] = useState('200');
    const [recurringExpenses, setRecurringExpenses] = useState('1500');
    const [cashFlowDays, setCashFlowDays] = useState('30');

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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.stockGood} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cash Flow Projection</Text>
                <View style={{ width: 24 }} />
            </View>
            {/* Content */}
            <ScrollView style={styles.content}>
                <AnimatedCard
                    mode="elevated"
                    style={styles.calculatorCard}
                    entering={FadeInDown.delay(100).springify()}
                >
                    <Card.Content>
                        <Text style={styles.calculatorTitle}>Cash Flow Projection</Text>
                        <Text style={styles.calculatorSubtitle}>Forecast your end-of-month cash position</Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Daily Income (RM)</Text>
                                <View style={styles.inputWithIcon}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={dailyIncome}
                                        onChangeText={setDailyIncome}
                                        keyboardType="numeric"
                                        placeholder="Average daily sales"
                                    />
                                    <Ionicons
                                        name="cash-outline"
                                        size={20}
                                        color="#666"
                                        style={styles.inputIcon}
                                    />
                                </View>
                                <Text style={styles.inputHelperText}>
                                    Your average daily revenue
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Monthly Recurring Expenses (RM)</Text>
                                <View style={styles.inputWithIcon}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={recurringExpenses}
                                        onChangeText={setRecurringExpenses}
                                        keyboardType="numeric"
                                        placeholder="Rent, utilities, etc."
                                    />
                                    <Ionicons
                                        name="wallet-outline"
                                        size={20}
                                        color="#666"
                                        style={styles.inputIcon}
                                    />
                                </View>
                                <Text style={styles.inputHelperText}>
                                    Fixed costs that occur each month
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Projection Period (Days)</Text>
                                <View style={styles.inputWithIcon}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={cashFlowDays}
                                        onChangeText={setCashFlowDays}
                                        keyboardType="numeric"
                                        placeholder="30 for monthly"
                                    />
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color="#666"
                                        style={styles.inputIcon}
                                    />
                                </View>
                                <Text style={styles.inputHelperText}>
                                    Number of days to project cash flow
                                </Text>
                            </View>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.resultsSection}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Total Income:</Text>
                                <Text style={[styles.resultValue, styles.positiveValue]}>
                                    RM {cashFlow.totalIncome}
                                </Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Total Expenses:</Text>
                                <Text style={[styles.resultValue, styles.negativeValue]}>
                                    RM {recurringExpenses}
                                </Text>
                            </View>

                            <View style={styles.resultRowHighlighted}>
                                <Text style={styles.resultLabelHighlighted}>Net Cash Flow:</Text>
                                <Text style={[
                                    styles.resultValueHighlighted,
                                    Number(cashFlow.netCashFlow) >= 0 ? styles.positiveValue : styles.negativeValue
                                ]}>
                                    RM {cashFlow.netCashFlow}
                                </Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Daily Average:</Text>
                                <Text style={[
                                    styles.resultValue,
                                    Number(cashFlow.dailyAverage) >= 0 ? styles.positiveValue : styles.negativeValue
                                ]}>
                                    RM {cashFlow.dailyAverage}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.cashFlowVisual}>
                            <View style={styles.cashFlowBar}>
                                <View style={[styles.cashFlowBarInner, {
                                    backgroundColor: MSMEColors.stockGood,
                                    height: 30
                                }]} />
                                <Text style={styles.cashFlowLabel}>Income: RM {cashFlow.totalIncome}</Text>
                            </View>

                            <View style={styles.cashFlowBar}>
                                <View style={[styles.cashFlowBarInner, {
                                    backgroundColor: MSMEColors.stockOut,
                                    height: 30,
                                    width: `${(Number(recurringExpenses) / Number(cashFlow.totalIncome)) * 100}%`
                                }]} />
                                <Text style={styles.cashFlowLabel}>Expenses: RM {recurringExpenses}</Text>
                            </View>

                            <View style={styles.cashFlowBar}>
                                <View style={[styles.cashFlowBarInner, {
                                    backgroundColor: Number(cashFlow.netCashFlow) >= 0 ? MSMEColors.stockGood : MSMEColors.stockOut,
                                    height: 30,
                                    width: `${Math.abs(Number(cashFlow.netCashFlow)) / Number(cashFlow.totalIncome) * 100}%`
                                }]} />
                                <Text style={styles.cashFlowLabel}>
                                    Net: RM {cashFlow.netCashFlow} ({Number(cashFlow.netCashFlow) >= 0 ? 'positive' : 'negative'})
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.cashFlowNote}>
                            {Number(cashFlow.netCashFlow) >= 0
                                ? `You will have a positive cash flow of RM ${cashFlow.netCashFlow} after ${cashFlowDays} days.`
                                : `You will have a cash deficit of RM ${Math.abs(Number(cashFlow.netCashFlow)).toFixed(2)} after ${cashFlowDays} days.`
                            }
                        </Text>

                        <View style={styles.buttonRow}>
                            <Button
                                mode="contained"
                                onPress={() => saveReport('cashflow', { dailyIncome, recurringExpenses, cashFlowDays, cashFlow })}
                                style={[styles.actionButton, { backgroundColor: MSMEColors.stockGood }]}
                            >
                                Save Report
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => exportReport('cashflow', { dailyIncome, recurringExpenses, cashFlowDays, cashFlow })}
                                style={styles.actionButton}
                            >
                                Export
                            </Button>
                        </View>
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
        color: MSMEColors.stockGood,
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
        elevation: 3,
    },
    calculatorTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        color: MSMEColors.stockGood,
    },
    calculatorSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    inputContainer: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 16,
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
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    resultRowHighlighted: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: `${MSMEColors.stockGood}15`,
        padding: 12,
        borderRadius: 8,
        marginVertical: 12,
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
    resultLabelHighlighted: {
        fontSize: 16,
        color: MSMEColors.stockGood,
        fontWeight: '700',
    },
    resultValueHighlighted: {
        fontSize: 16,
        color: MSMEColors.stockGood,
        fontWeight: '700',
    },
    positiveValue: {
        color: MSMEColors.stockGood,
    },
    negativeValue: {
        color: MSMEColors.stockOut,
    },
    cashFlowVisual: {
        marginVertical: 20,
    },
    cashFlowBar: {
        marginBottom: 16,
    },
    cashFlowBarInner: {
        borderRadius: 4,
        marginBottom: 4,
    },
    cashFlowLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    cashFlowNote: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666',
        marginVertical: 10,
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

export default CashFlowCalculatorScreen; 