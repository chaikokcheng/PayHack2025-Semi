import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Divider, Chip, Modal, Portal } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';
import { getAllInventory } from '../../models/inventory';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const PricingCalculatorScreen = ({ navigation }) => {
    // All state variables at top level
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [costPrice, setCostPrice] = useState('10');
    const [targetMargin, setTargetMargin] = useState('30');
    const [sellingPrice, setSellingPrice] = useState('14.29');

    // Replace mockInventoryItems with inventory from inventory.js
    const [inventoryItems, setInventoryItems] = useState(getAllInventory());

    // Calculate pricing
    const calculatePricing = () => {
        const cost = Number(costPrice);
        const margin = Number(targetMargin) / 100;
        const calculatedSellingPrice = cost / (1 - margin);
        setSellingPrice(calculatedSellingPrice.toFixed(2));
        return calculatedSellingPrice;
    };

    // Calculate pricing when inputs change
    useEffect(() => {
        if (costPrice && targetMargin) {
            calculatePricing();
        }
    }, [costPrice, targetMargin]);

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
                <Text style={styles.headerTitle}>Pricing Calculator</Text>
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
                        <Text style={styles.calculatorTitle}>Pricing Calculator</Text>
                        <Text style={styles.calculatorSubtitle}>Set your selling price based on desired profit margin</Text>

                        <View style={styles.productSelectionCard}>
                            {selectedProduct ? (
                                <View style={styles.selectedProductDetails}>
                                    <View style={styles.productHeader}>
                                        <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
                                        <TouchableOpacity
                                            style={styles.changeProductBtn}
                                            onPress={() => setProductModalVisible(true)}
                                        >
                                            <Text style={styles.changeProductText}>Change</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.productDetailRow}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Cost Price:</Text>
                                            <Text style={styles.detailValue}>RM {selectedProduct.costPrice.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Current Price:</Text>
                                            <Text style={styles.detailValue}>RM {selectedProduct.sellingPrice.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.selectProductBtn}
                                    onPress={() => setProductModalVisible(true)}
                                >
                                    <Ionicons name="add-circle-outline" size={24} color={MSMEColors.accounting} />
                                    <Text style={styles.selectProductText}>Select Product from Inventory</Text>
                                </TouchableOpacity>
                            )}
                        </View>

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
                            <View style={styles.marginInputContainer}>
                                <Chip
                                    style={styles.marginChip}
                                    selected={targetMargin === '20'}
                                    onPress={() => {
                                        setTargetMargin('20');
                                    }}
                                >20%</Chip>
                                <Chip
                                    style={styles.marginChip}
                                    selected={targetMargin === '30'}
                                    onPress={() => {
                                        setTargetMargin('30');
                                    }}
                                >30%</Chip>
                                <Chip
                                    style={styles.marginChip}
                                    selected={targetMargin === '50'}
                                    onPress={() => {
                                        setTargetMargin('50');
                                    }}
                                >50%</Chip>
                                <TextInput
                                    style={[styles.textInput, styles.marginInput]}
                                    value={targetMargin}
                                    onChangeText={(value) => {
                                        setTargetMargin(value);
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Custom"
                                />
                            </View>
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

                            {selectedProduct && (
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Current Price Difference:</Text>
                                    <Text style={[
                                        styles.resultValue,
                                        Number(sellingPrice) >= selectedProduct.sellingPrice ? styles.positiveValue : styles.negativeValue
                                    ]}>
                                        {Number(sellingPrice) >= selectedProduct.sellingPrice ? '↑' : '↓'} RM {Math.abs(Number(sellingPrice) - selectedProduct.sellingPrice).toFixed(2)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Card.Content>
                </AnimatedCard>

                {selectedProduct && (
                    <AnimatedCard
                        mode="elevated"
                        style={styles.chartCard}
                        entering={FadeInDown.delay(200).springify()}
                    >
                        <Card.Content>
                            <Text style={styles.chartTitle}>Price Comparison</Text>

                            <View style={styles.priceComparisonChart}>
                                <View style={styles.priceBar}>
                                    <Text style={styles.priceLabel}>Cost Price</Text>
                                    <View style={[styles.priceBarInner, {
                                        backgroundColor: '#E5E5E5',
                                        width: `${(selectedProduct.costPrice / Number(sellingPrice)) * 100}%`
                                    }]} />
                                    <Text style={styles.priceValue}>RM {selectedProduct.costPrice.toFixed(2)}</Text>
                                </View>

                                <View style={styles.priceBar}>
                                    <Text style={styles.priceLabel}>Current Price</Text>
                                    <View style={[styles.priceBarInner, {
                                        backgroundColor: MSMEColors.stockGood,
                                        width: `${(selectedProduct.sellingPrice / Number(sellingPrice)) * 100}%`
                                    }]} />
                                    <Text style={styles.priceValue}>RM {selectedProduct.sellingPrice.toFixed(2)}</Text>
                                </View>

                                <View style={styles.priceBar}>
                                    <Text style={styles.priceLabel}>New Price</Text>
                                    <View style={[styles.priceBarInner, {
                                        backgroundColor: MSMEColors.accounting,
                                        width: '100%'
                                    }]} />
                                    <Text style={styles.priceValue}>RM {sellingPrice}</Text>
                                </View>
                            </View>

                            <Text style={styles.chartNote}>
                                {Number(sellingPrice) > selectedProduct.sellingPrice
                                    ? `New price is ${((Number(sellingPrice) - selectedProduct.sellingPrice) / selectedProduct.sellingPrice * 100).toFixed(1)}% higher than current price.`
                                    : `New price is ${((selectedProduct.sellingPrice - Number(sellingPrice)) / selectedProduct.sellingPrice * 100).toFixed(1)}% lower than current price.`
                                }
                            </Text>
                        </Card.Content>
                    </AnimatedCard>
                )}
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
                                    setCostPrice(item.cost.toString());
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
        color: MSMEColors.accounting,
        fontWeight: '500',
        marginLeft: 8,
        fontSize: 16,
    },
    selectedProductDetails: {
        paddingVertical: 8,
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
        backgroundColor: `${MSMEColors.accounting}20`,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    changeProductText: {
        color: MSMEColors.accounting,
        fontSize: 12,
    },
    productDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
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
    marginInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    marginChip: {
        marginRight: 8,
        marginBottom: 8,
    },
    marginInput: {
        flex: 1,
        minWidth: 100,
        marginTop: 8,
    },
    priceComparisonChart: {
        marginTop: 16,
        marginBottom: 12,
    },
    priceBar: {
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    priceBarInner: {
        height: 24,
        borderRadius: 4,
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 14,
        textAlign: 'right',
    },
    chartNote: {
        marginTop: 10,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666',
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

export default PricingCalculatorScreen; 