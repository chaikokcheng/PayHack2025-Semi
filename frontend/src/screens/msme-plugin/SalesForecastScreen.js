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
import { LineChart } from 'react-native-chart-kit';
import { MSMEColors } from './MSMEToolsScreen';

// Mock sales data (last 6 months)
const mockMonthlySales = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 13500 },
    { month: 'Mar', sales: 12800 },
    { month: 'Apr', sales: 14200 },
    { month: 'May', sales: 15000 },
    { month: 'Jun', sales: 15800 },
];

// Simple forecast: average monthly growth
function getForecast(salesData, monthsAhead = 3) {
    const growthRates = [];
    for (let i = 1; i < salesData.length; i++) {
        const growth = (salesData[i].sales - salesData[i - 1].sales) / salesData[i - 1].sales;
        growthRates.push(growth);
    }
    const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    let last = salesData[salesData.length - 1].sales;
    const forecast = [];
    for (let i = 0; i < monthsAhead; i++) {
        last = last * (1 + avgGrowth);
        forecast.push(Math.round(last));
    }
    return forecast;
}

const SalesForecastScreen = ({ navigation }) => {
    const [monthsAhead] = useState(3);
    const forecast = getForecast(mockMonthlySales, monthsAhead);
    const chartLabels = [
        ...mockMonthlySales.map(m => m.month),
        ...Array(monthsAhead).fill(0).map((_, i) => `+${i + 1}`)
    ];
    const chartData = [
        ...mockMonthlySales.map(m => m.sales),
        ...forecast
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation?.goBack && navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.forecast || '#374151'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sales Forecast</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introduction}>
                    <Text style={styles.introTitle}>Plan Ahead with Sales Forecast</Text>
                    <Text style={styles.introText}>
                        This tool predicts your sales for the next few months based on your recent sales trend. Use it to plan inventory, staffing, and cash flow.
                    </Text>
                </View>
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Monthly Sales & Forecast</Text>
                    <LineChart
                        data={{
                            labels: chartLabels,
                            datasets: [
                                {
                                    data: chartData,
                                    color: (opacity = 1) => `rgba(247, 194, 52, ${opacity})`,
                                    strokeWidth: 3,
                                },
                            ],
                        }}
                        width={Dimensions.get('window').width - 48}
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            color: (opacity = 1) => `rgba(40, 168, 107, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                            propsForDots: {
                                r: '5',
                                strokeWidth: '2',
                                stroke: MSMEColors.forecast || '#F7C234',
                            },
                        }}
                        bezier
                        style={styles.chart}
                    />
                    <Text style={styles.forecastSummary}>
                        Next month forecast: <Text style={{ color: MSMEColors.forecast, fontWeight: 'bold' }}>RM {forecast[0]}</Text>{' '}
                        ({((forecast[0] - mockMonthlySales[mockMonthlySales.length - 1].sales) / mockMonthlySales[mockMonthlySales.length - 1].sales * 100).toFixed(1)}% growth)
                    </Text>
                </View>
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>How to Use This Forecast</Text>
                    <Text style={styles.tipsText}>
                        - Use the forecast to plan your stock and avoid over/under ordering.
                        {'\n'}- If sales are trending up, consider preparing for higher demand.
                        {'\n'}- If sales are dropping, review your marketing or product mix.
                    </Text>
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
        color: MSMEColors.forecast || '#374151',
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
        color: MSMEColors.forecast || '#F7C234',
        marginBottom: 8,
    },
    introText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    chartCard: {
        backgroundColor: '#FFFBEA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: MSMEColors.forecast || '#F7C234',
        marginBottom: 12,
    },
    chart: {
        borderRadius: 8,
        marginBottom: 12,
    },
    forecastSummary: {
        fontSize: 15,
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
    },
    tipsCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: MSMEColors.forecast || '#F7C234',
        marginBottom: 6,
    },
    tipsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});

export default SalesForecastScreen; 