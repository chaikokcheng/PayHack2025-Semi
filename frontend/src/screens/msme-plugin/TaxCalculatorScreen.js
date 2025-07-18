import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MSMEColors } from './MSMEToolsScreen';

const TAX_RATE = 0.17; // Example: 17% flat rate for MSMEs

const TaxCalculatorScreen = ({ navigation }) => {
    const [profit, setProfit] = useState('');
    const estimatedTax = profit ? (parseFloat(profit) * TAX_RATE).toFixed(2) : '0.00';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack && navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.tax || '#374151'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tax Helper</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.content}>
                <Text style={styles.introTitle}>Estimate Your Business Tax</Text>
                <Text style={styles.introText}>Enter your annual profit to estimate your tax liability. This helps you plan ahead for tax season.</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Annual Profit (RM)</Text>
                    <TextInput
                        style={styles.input}
                        value={profit}
                        onChangeText={setProfit}
                        keyboardType="numeric"
                        placeholder="e.g. 50000"
                    />
                </View>
                <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Estimated Tax (17%):</Text>
                    <Text style={styles.resultValue}>RM {estimatedTax}</Text>
                </View>
                <Text style={styles.tipsText}>
                    Tip: Actual tax rates may vary. Consult a tax professional for detailed advice.
                </Text>
            </View>
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
        color: MSMEColors.tax || '#374151',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: MSMEColors.tax || '#8B33D9',
        marginBottom: 8,
    },
    introText: {
        fontSize: 15,
        color: '#444',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    resultCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 18,
        alignItems: 'center',
        marginBottom: 16,
    },
    resultLabel: {
        fontSize: 15,
        color: '#666',
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: MSMEColors.tax || '#8B33D9',
    },
    tipsText: {
        fontSize: 13,
        color: '#888',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default TaxCalculatorScreen; 