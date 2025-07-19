import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Divider, Chip, Portal } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Import MSMEColors from MSMEToolsScreen
import { MSMEColors } from './MSMEToolsScreen';
import { getAllInventory } from '../../models/inventory';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const PricingCalculatorScreen = ({ navigation }) => {
    const [inventoryItems, setInventoryItems] = useState(getAllInventory());
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [costPrice, setCostPrice] = useState('');
    const [targetMargin, setTargetMargin] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');

    // Calculate selling price
    const calculateSellingPrice = () => {
        const cost = Number(costPrice);
        const margin = Number(targetMargin);

        if (cost && margin) {
            const selling = cost / (1 - margin / 100);
            setSellingPrice(selling.toFixed(2));
        }
    };

    // Calculate when inputs change
    useEffect(() => {
        calculateSellingPrice();
    }, [costPrice, targetMargin]);

    // Update cost price when product is selected
    useEffect(() => {
        if (selectedProduct) {
            setCostPrice(selectedProduct.cost.toString());
        }
    }, [selectedProduct]);

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
                        <Text style={styles.calculatorSubtitle}>Set optimal selling price based on cost and profit margin</Text>

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
                                <Ionicons name="cube-outline" size={24} color={MSMEColors.accounting} />
                                <Text style={[styles.selectProductText, { color: MSMEColors.accounting }]}>
                                    Select a Product (Optional)
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Cost Price (RM)</Text>
                            <View style={styles.inputWithIcon}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    value={costPrice}
                                    onChangeText={setCostPrice}
                                    keyboardType="numeric"
                                    placeholder="Enter cost price"
                                />
                                <Ionicons
                                    name="cube-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                            </View>
                            <Text style={styles.inputHelperText}>
                                Total cost to produce or acquire one unit
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Target Profit Margin (%)</Text>
                            <View style={styles.inputWithIcon}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    value={targetMargin}
                                    onChangeText={setTargetMargin}
                                    keyboardType="numeric"
                                    placeholder="Enter profit margin"
                                />
                                <Ionicons
                                    name="trending-up-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                            </View>
                            <Text style={styles.inputHelperText}>
                                Percentage of profit you want to make on each sale
                            </Text>
                        </View>

                        <Divider style={styles.divider} />

                        {sellingPrice ? (
                            <View style={styles.resultsSection}>
                                <View style={styles.resultRowHighlighted}>
                                    <Text style={styles.resultLabelHighlighted}>Recommended Selling Price:</Text>
                                    <Text style={styles.resultValueHighlighted}>
                                        RM {sellingPrice}
                                    </Text>
                                </View>

                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Profit per Unit:</Text>
                                    <Text style={[styles.resultValue, styles.positiveValue]}>
                                        RM {(Number(sellingPrice) - Number(costPrice)).toFixed(2)}
                                    </Text>
                                </View>

                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Profit Margin:</Text>
                                    <Text style={[styles.resultValue, styles.positiveValue]}>
                                        {targetMargin}%
                                    </Text>
                                </View>

                                {selectedProduct && (
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>Price Difference:</Text>
                                        <Text style={[
                                            styles.resultValue,
                                            Number(sellingPrice) > selectedProduct.sellingPrice ? styles.positiveValue : styles.negativeValue
                                        ]}>
                                            {Number(sellingPrice) > selectedProduct.sellingPrice ? '+' : ''}
                                            {((Number(sellingPrice) - selectedProduct.sellingPrice) / selectedProduct.sellingPrice * 100).toFixed(1)}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.noResultContainer}>
                                <Ionicons name="calculator-outline" size={48} color="#ccc" />
                                <Text style={styles.noResultText}>Enter cost price and profit margin to see results</Text>
                            </View>
                        )}
                    </Card.Content>
                </AnimatedCard>
            </ScrollView>

            {/* Product Selection Modal */}
            <Portal>
                <Modal
                    visible={productModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setProductModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Product</Text>
                                <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={inventoryItems}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.productItem}
                                        onPress={() => {
                                            setSelectedProduct(item);
                                            setProductModalVisible(false);
                                        }}
                                    >
                                        <View style={styles.productInfo}>
                                            <Text style={styles.productName}>{item.name}</Text>
                                            <Text style={styles.productPrice}>
                                                Cost: RM {item.cost} | Current Price: RM {item.price}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#666" />
                                    </TouchableOpacity>
                                )}
                                style={styles.productList}
                            />
                        </View>
                    </View>
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
        backgroundColor: `${MSMEColors.accounting}20`,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    changeProductText: {
        color: MSMEColors.accounting,
        fontSize: 12,
    },
    productChip: {
        marginTop: 8,
        backgroundColor: `${MSMEColors.accounting}15`,
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
        backgroundColor: `${MSMEColors.accounting}15`,
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
    noResultContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    noResultText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
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
});

export default PricingCalculatorScreen;