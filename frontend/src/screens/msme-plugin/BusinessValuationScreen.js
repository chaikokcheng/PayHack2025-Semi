import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MSMEColors } from './MSMEToolsScreen';

const DEFAULT_MULTIPLIER = 3; // Example: 3x annual profit

const BusinessValuationScreen = ({ navigation }) => {
    const [profit, setProfit] = useState('');
    const [multiplier, setMultiplier] = useState(DEFAULT_MULTIPLIER.toString());
    const estimatedValue = profit && multiplier ? (parseFloat(profit) * parseFloat(multiplier)).toFixed(2) : '0.00';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack && navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.inventory || '#374151'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Business Valuation</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.content}>
                <Text style={styles.introTitle}>Estimate Your Business Value</Text>
                <Text style={styles.introText}>Enter your annual profit and a multiplier (typical range: 2-5x) to estimate your business value. This is a common method for MSMEs.</Text>
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
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Multiplier (x)</Text>
                    <TextInput
                        style={styles.input}
                        value={multiplier}
                        onChangeText={setMultiplier}
                        keyboardType="numeric"
                        placeholder="e.g. 3"
                    />
                </View>
                <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Estimated Business Value:</Text>
                    <Text style={styles.resultValue}>RM {estimatedValue}</Text>
                </View>
                <Text style={styles.tipsText}>
                    Tip: Actual business value depends on many factors. This is a simple estimate for MSMEs.
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
        color: MSMEColors.inventory || '#374151',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: MSMEColors.inventory || '#3388DD',
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
        color: MSMEColors.inventory || '#3388DD',
    },
    tipsText: {
        fontSize: 13,
        color: '#888',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default BusinessValuationScreen; 