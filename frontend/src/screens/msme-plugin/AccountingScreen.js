import React, { useState, useEffect } from 'react';
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
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Divider, Chip, List, SegmentedButtons, FAB, RadioButton } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LineChart, PieChart } from 'react-native-chart-kit';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const AccountingScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [timeFrame, setTimeFrame] = useState('week');
    const [transactionFilter, setTransactionFilter] = useState('all');

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

    // NEW: Local Storage State
    const [savedReports, setSavedReports] = useState([]);
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

    const renderHomeScreen = () => (
        <View style={styles.homeContainer}>
            <Text style={styles.homeTitle}>Financial Tools</Text>
            <Text style={styles.homeSubtitle}>Choose a calculator to get started</Text>

            <View style={styles.tileGrid}>
                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => setActiveTab('profit')}
                >
                    <View style={[styles.tileIcon, { backgroundColor: MSMEColors.stockGood }]}>
                        <Ionicons name="calculator-outline" size={32} color="white" />
                    </View>
                    <Text style={styles.tileTitle}>Profit Estimator</Text>
                    <Text style={styles.tileSubtitle}>Calculate daily profit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => setActiveTab('pricing')}
                >
                    <View style={[styles.tileIcon, { backgroundColor: MSMEColors.accounting }]}>
                        <Ionicons name="pricetag-outline" size={32} color="white" />
                    </View>
                    <Text style={styles.tileTitle}>Pricing Helper</Text>
                    <Text style={styles.tileSubtitle}>Set selling price</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => setActiveTab('breakeven')}
                >
                    <View style={[styles.tileIcon, { backgroundColor: MSMEColors.stockOut }]}>
                        <Ionicons name="trending-up-outline" size={32} color="white" />
                    </View>
                    <Text style={styles.tileTitle}>Break-even</Text>
                    <Text style={styles.tileSubtitle}>Find break-even point</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => setActiveTab('cashflow')}
                >
                    <View style={[styles.tileIcon, { backgroundColor: MSMEColors.stockGood }]}>
                        <Ionicons name="cash-outline" size={32} color="white" />
                    </View>
                    <Text style={styles.tileTitle}>Cash Flow</Text>
                    <Text style={styles.tileSubtitle}>Project monthly cash</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => setActiveTab('tax')}
                >
                    <View style={[styles.tileIcon, { backgroundColor: MSMEColors.accounting }]}>
                        <Ionicons name="document-text-outline" size={32} color="white" />
                    </View>
                    <Text style={styles.tileTitle}>Tax Helper</Text>
                    <Text style={styles.tileSubtitle}>Estimate tax liability</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tile}
                    onPress={() => setActiveTab('forecast')}
                >
                    <View style={[styles.tileIcon, { backgroundColor: MSMEColors.stockGood }]}>
                        <Ionicons name="analytics-outline" size={32} color="white" />
                    </View>
                    <Text style={styles.tileTitle}>Sales Forecast</Text>
                    <Text style={styles.tileSubtitle}>Predict future sales</Text>
                </TouchableOpacity>
            </View>

            {savedReports.length > 0 && (
                <View style={styles.recentReports}>
                    <Text style={styles.recentTitle}>Recent Reports</Text>
                    {savedReports.slice(-3).map((report) => (
                        <TouchableOpacity
                            key={report.id}
                            style={styles.reportItem}
                            onPress={() => {
                                setCurrentReport(report);
                                setActiveTab(report.type);
                            }}
                        >
                            <Ionicons name="document-outline" size={20} color={MSMEColors.accounting} />
                            <Text style={styles.reportTitle}>{report.title}</Text>
                            <Text style={styles.reportDate}>
                                {new Date(report.timestamp).toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const renderProfitCalculator = () => (
        <View>
            <AnimatedCard
                mode="elevated"
                style={styles.calculatorCard}
                entering={FadeInDown.delay(100).springify()}
            >
                <Card.Content>
                    <Text style={styles.calculatorTitle}>Profit Calculator</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Revenue (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={revenue}
                            onChangeText={setRevenue}
                            keyboardType="numeric"
                            placeholder="Enter your revenue"
                        />
                    </View>

                    <Divider style={styles.divider} />

                    <Text style={styles.sectionSubtitle}>Expenses Breakdown</Text>

                    {Object.keys(expenseBreakdown).map((key) => (
                        <View key={key} style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                {key.charAt(0).toUpperCase() + key.slice(1)} (RM)
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={expenseBreakdown[key]}
                                onChangeText={(value) => setExpenseBreakdown({ ...expenseBreakdown, [key]: value })}
                                keyboardType="numeric"
                                placeholder={`Enter ${key} expense`}
                            />
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
                            onPress={() => saveReport('profit', { revenue, expenses, calculatedProfit, profitMargin, expenseBreakdown })}
                            style={[styles.actionButton, { backgroundColor: MSMEColors.stockGood }]}
                        >
                            Save Report
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => exportReport('profit', { revenue, expenses, calculatedProfit, profitMargin, expenseBreakdown })}
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
        </View>
    );

    const renderPricingCalculator = () => (
        <View>
            <AnimatedCard
                mode="elevated"
                style={styles.calculatorCard}
                entering={FadeInDown.delay(100).springify()}
            >
                <Card.Content>
                    <Text style={styles.calculatorTitle}>Pricing Calculator</Text>
                    <Text style={styles.calculatorSubtitle}>Set your selling price based on desired profit margin</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Cost Price (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={costPrice}
                            onChangeText={(value) => {
                                setCostPrice(value);
                                calculatePricing();
                            }}
                            keyboardType="numeric"
                            placeholder="Enter cost price"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Target Profit Margin (%)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={targetMargin}
                            onChangeText={(value) => {
                                setTargetMargin(value);
                                calculatePricing();
                            }}
                            keyboardType="numeric"
                            placeholder="Enter target margin"
                        />
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.resultsSection}>
                        <View style={styles.resultRowHighlighted}>
                            <Text style={styles.resultLabelHighlighted}>Recommended Selling Price:</Text>
                            <Text style={styles.resultValueHighlighted}>
                                RM {sellingPrice}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Profit per Unit:</Text>
                            <Text style={styles.resultValue}>
                                RM {(Number(sellingPrice) - Number(costPrice)).toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={() => saveReport('pricing', { costPrice, targetMargin, sellingPrice })}
                            style={[styles.actionButton, { backgroundColor: MSMEColors.accounting }]}
                        >
                            Save Report
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => exportReport('pricing', { costPrice, targetMargin, sellingPrice })}
                            style={styles.actionButton}
                        >
                            Export
                        </Button>
                    </View>
                </Card.Content>
            </AnimatedCard>
        </View>
    );

    const renderBreakEvenCalculator = () => (
        <View>
            <AnimatedCard
                mode="elevated"
                style={styles.calculatorCard}
                entering={FadeInDown.delay(100).springify()}
            >
                <Card.Content>
                    <Text style={styles.calculatorTitle}>Break-even Calculator</Text>
                    <Text style={styles.calculatorSubtitle}>Find how many units you need to sell to break even</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Fixed Costs (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={fixedCosts}
                            onChangeText={setFixedCosts}
                            keyboardType="numeric"
                            placeholder="Rent, utilities, etc."
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Cost per Unit (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={costPerUnit}
                            onChangeText={setCostPerUnit}
                            keyboardType="numeric"
                            placeholder="Material + labor cost"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Selling Price per Unit (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={breakEvenPrice}
                            onChangeText={(value) => {
                                setBreakEvenPrice(value);
                                calculateBreakEven();
                            }}
                            keyboardType="numeric"
                            placeholder="Your selling price"
                        />
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.resultsSection}>
                        <View style={styles.resultRowHighlighted}>
                            <Text style={styles.resultLabelHighlighted}>Break-even Units:</Text>
                            <Text style={styles.resultValueHighlighted}>
                                {breakEvenUnits} units
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Break-even Revenue:</Text>
                            <Text style={styles.resultValue}>
                                RM {(Number(breakEvenUnits) * Number(breakEvenPrice)).toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={() => saveReport('breakeven', { fixedCosts, costPerUnit, breakEvenPrice, breakEvenUnits })}
                            style={[styles.actionButton, { backgroundColor: MSMEColors.stockOut }]}
                        >
                            Save Report
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => exportReport('breakeven', { fixedCosts, costPerUnit, breakEvenPrice, breakEvenUnits })}
                            style={styles.actionButton}
                        >
                            Export
                        </Button>
                    </View>
                </Card.Content>
            </AnimatedCard>
        </View>
    );

    const renderCashFlowCalculator = () => (
        <View>
            <AnimatedCard
                mode="elevated"
                style={styles.calculatorCard}
                entering={FadeInDown.delay(100).springify()}
            >
                <Card.Content>
                    <Text style={styles.calculatorTitle}>Cash Flow Projection</Text>
                    <Text style={styles.calculatorSubtitle}>Forecast your end-of-month cash position</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Daily Income (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={dailyIncome}
                            onChangeText={setDailyIncome}
                            keyboardType="numeric"
                            placeholder="Average daily sales"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Monthly Recurring Expenses (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={recurringExpenses}
                            onChangeText={setRecurringExpenses}
                            keyboardType="numeric"
                            placeholder="Rent, utilities, etc."
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Projection Period (Days)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={cashFlowDays}
                            onChangeText={setCashFlowDays}
                            keyboardType="numeric"
                            placeholder="30 for monthly"
                        />
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.resultsSection}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Total Income:</Text>
                            <Text style={styles.resultValue}>
                                RM {cashFlow.totalIncome}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Total Expenses:</Text>
                            <Text style={styles.resultValue}>
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
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'home':
                return renderHomeScreen();
            case 'profit':
                return renderProfitCalculator();
            case 'pricing':
                return renderPricingCalculator();
            case 'breakeven':
                return renderBreakEvenCalculator();
            case 'cashflow':
                return renderCashFlowCalculator();
            case 'tax':
                return renderTaxCalculator();
            case 'valuation':
                return renderBusinessValuation();
            case 'forecast':
                return renderSalesForecast();
            default:
                return renderHomeScreen();
        }
    };

    const renderTaxCalculator = () => (
        <View>
            <AnimatedCard
                mode="elevated"
                style={styles.calculatorCard}
                entering={FadeInDown.delay(100).springify()}
            >
                <Card.Content>
                    <Text style={styles.calculatorTitle}>Tax Estimator</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Tax Year</Text>
                        <TextInput
                            style={styles.textInput}
                            value={taxYear}
                            onChangeText={setTaxYear}
                            keyboardType="numeric"
                            placeholder="Enter tax year"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Type</Text>
                        <View style={styles.radioGroup}>
                            <RadioButton.Group
                                onValueChange={value => setBusinessType(value)}
                                value={businessType}
                            >
                                <View style={styles.radioOption}>
                                    <RadioButton value="soleProprietor" color={MSMEColors.accounting} />
                                    <Text>Sole Proprietor</Text>
                                </View>
                                <View style={styles.radioOption}>
                                    <RadioButton value="partnership" color={MSMEColors.accounting} />
                                    <Text>Partnership</Text>
                                </View>
                                <View style={styles.radioOption}>
                                    <RadioButton value="corporation" color={MSMEColors.accounting} />
                                    <Text>Corporation</Text>
                                </View>
                            </RadioButton.Group>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Annual Revenue (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={annualRevenue}
                            onChangeText={setAnnualRevenue}
                            keyboardType="numeric"
                            placeholder="Enter annual revenue"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Annual Expenses (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={annualExpenses}
                            onChangeText={setAnnualExpenses}
                            keyboardType="numeric"
                            placeholder="Enter annual expenses"
                        />
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.resultsSection}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Taxable Profit:</Text>
                            <Text style={styles.resultValue}>
                                RM {taxCalculation.profit.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Tax Rate:</Text>
                            <Text style={styles.resultValue}>{taxCalculation.taxRate}%</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Estimated Tax:</Text>
                            <Text style={[styles.resultValue, styles.negativeValue]}>
                                RM {taxCalculation.estimatedTax}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Net Income:</Text>
                            <Text style={[styles.resultValue, styles.positiveValue]}>
                                RM {taxCalculation.netIncome}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.disclaimerContainer}>
                        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                        <Text style={styles.disclaimerText}>
                            This is a simplified estimation. Consult with a tax professional for accurate calculations.
                        </Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={() => saveReport('tax', { businessType, annualRevenue, annualExpenses, taxCalculation })}
                            style={[styles.actionButton, { backgroundColor: MSMEColors.accounting }]}
                        >
                            Save Report
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => exportReport('tax', { businessType, annualRevenue, annualExpenses, taxCalculation })}
                            style={styles.actionButton}
                        >
                            Export
                        </Button>
                    </View>
                </Card.Content>
            </AnimatedCard>
        </View>
    );

    const renderBusinessValuation = () => (
        <View>
            <AnimatedCard
                mode="elevated"
                style={styles.calculatorCard}
                entering={FadeInDown.delay(100).springify()}
            >
                <Card.Content>
                    <Text style={styles.calculatorTitle}>Business Valuation Tool</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Monthly Profit (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={monthlyProfit}
                            onChangeText={setMonthlyProfit}
                            keyboardType="numeric"
                            placeholder="Enter monthly profit"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Age (Years)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={businessAge}
                            onChangeText={setBusinessAge}
                            keyboardType="numeric"
                            placeholder="Enter business age"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Industry Multiplier</Text>
                        <TextInput
                            style={styles.textInput}
                            value={industryMultiplier}
                            onChangeText={setIndustryMultiplier}
                            keyboardType="numeric"
                            placeholder="Enter industry multiplier"
                        />
                        <Text style={styles.inputHelperText}>
                            Food: 2-3x, Retail: 3-4x, Tech: 5-7x
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Asset Value (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={assets}
                            onChangeText={setAssets}
                            keyboardType="numeric"
                            placeholder="Enter asset value"
                        />
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.resultsSection}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Annual Profit:</Text>
                            <Text style={styles.resultValue}>
                                RM {valuation.annualProfit}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Valuation by Earnings:</Text>
                            <Text style={styles.resultValue}>
                                RM {valuation.valuationByMultiple}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Asset Value:</Text>
                            <Text style={styles.resultValue}>
                                RM {valuation.assetValue}
                            </Text>
                        </View>

                        <View style={styles.resultRowHighlighted}>
                            <Text style={styles.resultLabelHighlighted}>Estimated Business Value:</Text>
                            <Text style={styles.resultValueHighlighted}>
                                RM {valuation.totalValuation}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.disclaimerContainer}>
                        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                        <Text style={styles.disclaimerText}>
                            This is a simplified estimation. Many factors affect business valuation.
                        </Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={() => saveReport('valuation', { monthlyProfit, businessAge, industryMultiplier, assets, valuation })}
                            style={[styles.actionButton, { backgroundColor: MSMEColors.accounting }]}
                        >
                            Save Report
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => exportReport('valuation', { monthlyProfit, businessAge, industryMultiplier, assets, valuation })}
                            style={styles.actionButton}
                        >
                            Export
                        </Button>
                    </View>
                </Card.Content>
            </AnimatedCard>
        </View>
    );

    const renderSalesForecast = () => (
        <View>
            <AnimatedCard
                mode="elevated"
                style={styles.calculatorCard}
                entering={FadeInDown.delay(100).springify()}
            >
                <Card.Content>
                    <Text style={styles.calculatorTitle}>Sales Forecast Tool</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Base Monthly Sales (RM)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={baseSales}
                            onChangeText={setBaseSales}
                            keyboardType="numeric"
                            placeholder="Enter current monthly sales"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Growth Rate (% per year)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={growthRate}
                            onChangeText={setGrowthRate}
                            keyboardType="numeric"
                            placeholder="Enter annual growth rate"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Number of Months</Text>
                        <TextInput
                            style={styles.textInput}
                            value={forecastMonths}
                            onChangeText={setForecastMonths}
                            keyboardType="numeric"
                            placeholder="Enter number of months"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Seasonality Pattern</Text>
                        <View style={styles.radioGroup}>
                            <RadioButton.Group
                                onValueChange={value => setSeasonality(value)}
                                value={seasonality}
                            >
                                <View style={styles.radioOption}>
                                    <RadioButton value="none" color={MSMEColors.accounting} />
                                    <Text>None</Text>
                                </View>
                                <View style={styles.radioOption}>
                                    <RadioButton value="retail" color={MSMEColors.accounting} />
                                    <Text>Retail (Year-end peak)</Text>
                                </View>
                                <View style={styles.radioOption}>
                                    <RadioButton value="food" color={MSMEColors.accounting} />
                                    <Text>Food (Summer peak)</Text>
                                </View>
                            </RadioButton.Group>
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
                    <Text style={styles.chartTitle}>Sales Forecast</Text>

                    <View style={styles.chartContainer}>
                        <LineChart
                            data={forecastChartData}
                            width={Dimensions.get('window').width - 64}
                            height={220}
                            chartConfig={{
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                color: (opacity = 1) => `rgba(51, 136, 221, ${opacity})`,
                                strokeWidth: 2,
                                decimalPlaces: 0,
                            }}
                            bezier
                            style={styles.chart}
                            withVerticalLines={false}
                        />
                    </View>

                    <View style={styles.resultsSection}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Total Sales (Forecast Period):</Text>
                            <Text style={styles.resultValue}>
                                RM {forecast.totalForecast}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Average Monthly Sales:</Text>
                            <Text style={styles.resultValue}>
                                RM {forecast.averageMonthly}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={() => saveReport('forecast', { baseSales, growthRate, forecastMonths, seasonality, forecast })}
                            style={[styles.actionButton, { backgroundColor: MSMEColors.stockGood }]}
                        >
                            Save Report
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => exportReport('forecast', { baseSales, growthRate, forecastMonths, seasonality, forecast })}
                            style={styles.actionButton}
                        >
                            Export
                        </Button>
                    </View>
                </Card.Content>
            </AnimatedCard>
        </View>
    );

    // Update total expenses when breakdown changes
    useEffect(() => {
        const total = Object.values(expenseBreakdown).reduce((sum, val) => sum + Number(val), 0);
        setExpenses(total.toString());
    }, [expenseBreakdown]);

    // Calculate pricing when inputs change
    useEffect(() => {
        if (costPrice && targetMargin) {
            calculatePricing();
        }
    }, [costPrice, targetMargin]);

    // Calculate break-even when inputs change
    useEffect(() => {
        if (fixedCosts && costPerUnit && breakEvenPrice) {
            calculateBreakEven();
        }
    }, [fixedCosts, costPerUnit, breakEvenPrice]);

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
                            <Text style={styles.headerTitle}>Financial Tools</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Estimate profit, tax, and business value</Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'home' && styles.activeTab]}
                        onPress={() => setActiveTab('home')}
                    >
                        <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'profit' && styles.activeTab]}
                        onPress={() => setActiveTab('profit')}
                    >
                        <Text style={[styles.tabText, activeTab === 'profit' && styles.activeTabText]}>Profit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'pricing' && styles.activeTab]}
                        onPress={() => setActiveTab('pricing')}
                    >
                        <Text style={[styles.tabText, activeTab === 'pricing' && styles.activeTabText]}>Pricing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'breakeven' && styles.activeTab]}
                        onPress={() => setActiveTab('breakeven')}
                    >
                        <Text style={[styles.tabText, activeTab === 'breakeven' && styles.activeTabText]}>Break-even</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'cashflow' && styles.activeTab]}
                        onPress={() => setActiveTab('cashflow')}
                    >
                        <Text style={[styles.tabText, activeTab === 'cashflow' && styles.activeTabText]}>Cash Flow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'tax' && styles.activeTab]}
                        onPress={() => setActiveTab('tax')}
                    >
                        <Text style={[styles.tabText, activeTab === 'tax' && styles.activeTabText]}>Tax</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'valuation' && styles.activeTab]}
                        onPress={() => setActiveTab('valuation')}
                    >
                        <Text style={[styles.tabText, activeTab === 'valuation' && styles.activeTabText]}>Valuation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'forecast' && styles.activeTab]}
                        onPress={() => setActiveTab('forecast')}
                    >
                        <Text style={[styles.tabText, activeTab === 'forecast' && styles.activeTabText]}>Forecast</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
            >
                <ScrollView style={styles.content}>
                    {renderTabContent()}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MSMEColors.background,
    },
    header: {
        paddingTop: 12,
        paddingBottom: 12,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleIcon: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    moreButton: {
        marginLeft: 'auto',
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    tabsContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginRight: 16,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: MSMEColors.accounting,
    },
    tabText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: MSMEColors.accounting,
        fontWeight: '700',
    },
    calculatorCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    calculatorTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
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
    resultRowHighlighted: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(51, 136, 221, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
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
        color: MSMEColors.accounting,
        fontWeight: '700',
    },
    resultValueHighlighted: {
        fontSize: 16,
        color: MSMEColors.accounting,
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
    radioGroup: {
        marginTop: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    chartContainer: {
        marginTop: 10,
        alignItems: 'center',
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
    disclaimerContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
        padding: 10,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'flex-start',
    },
    disclaimerText: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
        marginLeft: 8,
    },
    inputHelperText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    homeContainer: {
        padding: 16,
        backgroundColor: MSMEColors.background,
        flex: 1,
    },
    homeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },
    homeSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    tileGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    tile: {
        width: '48%', // Two tiles per row
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tileIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    tileTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 4,
    },
    tileSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
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
    recentReports: {
        marginTop: 20,
    },
    recentTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
        marginLeft: 10,
    },
    reportDate: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 10,
    },
});

export default AccountingScreen; 