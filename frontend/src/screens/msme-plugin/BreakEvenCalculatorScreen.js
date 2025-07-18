import React, { useState, useEffect } from 'react';
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
import { Card, Divider, Chip, Modal, Portal } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';
import { getAllInventory } from '../../models/inventory';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const BreakEvenCalculatorScreen = ({ navigation }) => {
    // All state variables at top level
    const [inventoryItems, setInventoryItems] = useState(getAllInventory());
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [fixedCosts, setFixedCosts] = useState('2000');
    const [costPerUnit, setCostPerUnit] = useState('5');
    const [breakEvenPrice, setBreakEvenPrice] = useState('15');
    const [breakEvenUnits, setBreakEvenUnits] = useState('200');

    // Calculate break-even
    const calculateBreakEven = () => {
        const fixed = Number(fixedCosts);
        const unitCost = Number(costPerUnit);
        const price = Number(breakEvenPrice);

        const units = fixed / (price - unitCost);
        setBreakEvenUnits(units.toFixed(0));
        return units;
    };

    // Calculate break-even when inputs change
    useEffect(() => {
        if (fixedCosts && costPerUnit && breakEvenPrice) {
            calculateBreakEven();
        }
    }, [fixedCosts, costPerUnit, breakEvenPrice]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={MSMEColors.stockOut} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Break-even Calculator</Text>
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
                        <Text style={styles.calculatorTitle}>Break-even Calculator</Text>
                        <Text style={styles.calculatorSubtitle}>Find how many units you need to sell to break even</Text>

                        {selectedProduct ? (
                            <View style={styles.productSelectionCard}>
                                <View style={styles.productHeader}>
                                    <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
                                    <TouchableOpacity
                                        style={styles.changeProductBtn}
                                        onPress={() => {
                                            setProductModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.changeProductText}>Change</Text>
                                    </TouchableOpacity>
                                </View>
                                <Chip icon="tag" style={styles.productChip}>Using current product details</Chip>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.productSelectionCard, styles.selectProductBtn]}
                                onPress={() => {
                                    setProductModalVisible(true);
                                }}
                            >
                                <Ionicons name="cube-outline" size={24} color={MSMEColors.stockOut} />
                                <Text style={[styles.selectProductText, { color: MSMEColors.stockOut }]}>
                                    Select a Product (Optional)
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Fixed Costs (RM)</Text>
                            <View style={styles.inputWithIcon}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    value={fixedCosts}
                                    onChangeText={setFixedCosts}
                                    keyboardType="numeric"
                                    placeholder="Rent, utilities, etc."
                                />
                                <Ionicons
                                    name="home-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                            </View>
                            <Text style={styles.inputHelperText}>
                                Monthly operating costs that don't change with sales volume
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Cost per Unit (RM)</Text>
                            <View style={styles.inputWithIcon}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    value={costPerUnit}
                                    onChangeText={setCostPerUnit}
                                    keyboardType="numeric"
                                    placeholder="Material + labor cost"
                                />
                                <Ionicons
                                    name="cube-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                            </View>
                            <Text style={styles.inputHelperText}>
                                Direct cost to produce or acquire one unit of your product
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Selling Price per Unit (RM)</Text>
                            <View style={styles.inputWithIcon}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    value={breakEvenPrice}
                                    onChangeText={(value) => {
                                        setBreakEvenPrice(value);
                                        calculateBreakEven();
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Your selling price"
                                />
                                <Ionicons
                                    name="pricetag-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                            </View>
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

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Profit per Unit (after break-even):</Text>
                                <Text style={[styles.resultValue, styles.positiveValue]}>
                                    RM {(Number(breakEvenPrice) - Number(costPerUnit)).toFixed(2)}
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
                        <Text style={styles.chartTitle}>Break-even Analysis</Text>

                        <View style={styles.breakEvenChartContainer}>
                            <View style={styles.legendContainer}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: MSMEColors.accounting }]} />
                                    <Text style={styles.legendText}>Fixed Costs</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: MSMEColors.stockGood }]} />
                                    <Text style={styles.legendText}>Revenue</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: MSMEColors.stockOut }]} />
                                    <Text style={styles.legendText}>Break-even Point</Text>
                                </View>
                            </View>

                            <View style={styles.breakEvenVisual}>
                                <View style={styles.breakEvenLine}>
                                    <View style={styles.breakEvenMarker} />
                                </View>
                                <Text style={styles.breakEvenUnits}>{breakEvenUnits} units</Text>
                            </View>

                            <Text style={styles.breakEvenExplanation}>
                                You need to sell {breakEvenUnits} units at RM {breakEvenPrice} each to cover your fixed costs of RM {fixedCosts}.
                                After this point, you'll make a profit of RM {(Number(breakEvenPrice) - Number(costPerUnit)).toFixed(2)} per unit.
                            </Text>
                        </View>
                    </Card.Content>
                </AnimatedCard>
            </ScrollView>

            {/* Product Selection Modal */}
            <Portal>
                <Modal
                    visible={productModalVisible}
                    onDismiss={() => setProductModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Product</Text>
                        <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                            <Ionicons name="close-circle" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.productList}>
                        {inventoryItems.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.productItem}
                                onPress={() => {
                                    setSelectedProduct({
                                        ...item,
                                        costPrice: item.cost,
                                        sellingPrice: item.price,
                                    });
                                    setCostPerUnit(item.cost.toString());
                                    setBreakEvenPrice(item.price.toString());
                                    setProductModalVisible(false);
                                }}
                            >
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <Text style={styles.productPrice}>
                                        Cost: RM {typeof item.cost === 'number' ? item.cost.toFixed(2) : 'N/A'} | Price: RM {typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Modal>
            </Portal>
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
        color: MSMEColors.stockOut,
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
        color: MSMEColors.stockOut,
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
    productSelectionCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    selectProductBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    selectProductText: {
        fontWeight: '500',
        marginLeft: 8,
        fontSize: 16,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectedProductName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    changeProductBtn: {
        backgroundColor: `${MSMEColors.stockOut}20`,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    changeProductText: {
        color: MSMEColors.stockOut,
        fontSize: 12,
    },
    productChip: {
        marginTop: 8,
        backgroundColor: `${MSMEColors.stockOut}15`,
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
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
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
        backgroundColor: `${MSMEColors.stockOut}15`,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
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
        color: MSMEColors.stockOut,
        fontWeight: '700',
    },
    resultValueHighlighted: {
        fontSize: 16,
        color: MSMEColors.stockOut,
        fontWeight: '700',
    },
    positiveValue: {
        color: MSMEColors.stockGood,
    },
    negativeValue: {
        color: MSMEColors.stockOut,
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
        color: MSMEColors.stockOut,
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
    breakEvenChartContainer: {
        marginVertical: 16,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 4,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    breakEvenVisual: {
        height: 120,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    breakEvenLine: {
        width: '80%',
        height: 4,
        backgroundColor: `${MSMEColors.accounting}30`,
        position: 'relative',
    },
    breakEvenMarker: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: MSMEColors.stockOut,
        top: -6,
        left: '50%',
        marginLeft: -8,
    },
    breakEvenUnits: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: 'bold',
        color: MSMEColors.stockOut,
    },
    breakEvenExplanation: {
        textAlign: 'center',
        color: '#666',
        fontSize: 13,
        lineHeight: 18,
        paddingHorizontal: 16,
    },
});

export default BreakEvenCalculatorScreen; 