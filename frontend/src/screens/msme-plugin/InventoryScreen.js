import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Badge, Searchbar, List, Button, Divider, FAB, IconButton, Portal, Dialog, TextInput as PaperInput, Menu, Provider } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BarChart } from 'react-native-chart-kit';
import * as ImagePicker from 'expo-image-picker';

// Import MSMEColors from MSMEToolsScreen to keep consistent styling
import { MSMEColors } from './MSMEToolsScreen';
import { getAllInventory, addInventory, updateInventory, removeInventory } from '../../models/inventory';

// Define product categories for Mak Cik Fatimah's business
const PRODUCT_CATEGORIES = ['Kuih', 'Desserts', 'Beverages'];

const AnimatedCard = Animated.createAnimatedComponent(Card);

// Utility to add alpha to hex color
function addAlpha(hex, alpha) {
    // hex: #RRGGBB, alpha: 0-1
    if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
    const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return hex + a;
}

// Custom Alert Modal
const CustomAlertModal = ({ visible, title, message, type = 'info', onClose }) => {
    // Choose icon and color based on type
    let iconName = 'information-circle-outline';
    let iconColor = MSMEColors.inventory;
    if (type === 'success') {
        iconName = 'checkmark-circle-outline';
        iconColor = MSMEColors.stockGood;
    } else if (type === 'error') {
        iconName = 'close-circle-outline';
        iconColor = MSMEColors.stockOut;
    } else if (type === 'warning') {
        iconName = 'alert-circle-outline';
        iconColor = MSMEColors.stockLow;
    }
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View
                    style={{
                        width: '85%',
                        maxWidth: 400,
                        backgroundColor: MSMEColors.white,
                        borderRadius: 16,
                        padding: 24,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                        elevation: 12,
                    }}
                >
                    {/* Header row: title and close button */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: iconColor, flex: 1 }}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={{ marginLeft: 8, padding: 4 }}>
                            <Ionicons name="close" size={24} color={MSMEColors.darkGray} />
                        </TouchableOpacity>
                    </View>
                    {/* Optional icon, smaller and subtle */}
                    <View style={{ alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name={iconName} size={32} color={iconColor} style={{ opacity: 0.85 }} />
                    </View>
                    <Text style={{ fontSize: 15, color: MSMEColors.textDark, marginBottom: 20, textAlign: 'center' }}>{message}</Text>
                    <Button
                        mode="contained"
                        onPress={onClose}
                        style={{ borderRadius: 10, minWidth: 120, alignSelf: 'center', backgroundColor: MSMEColors.inventory, marginTop: 4 }}
                        buttonColor={MSMEColors.inventory}
                        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
                        contentStyle={{ paddingVertical: 6 }}
                    >
                        OK
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

const InventoryScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Modal states
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [stockModalVisible, setStockModalVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    // Custom alert modal state
    const [alertDialog, setAlertDialog] = useState({ visible: false, title: '', message: '' });

    // Menu states - separate states for add and edit forms
    const [addCategoryMenuVisible, setAddCategoryMenuVisible] = useState(false);
    const [editCategoryMenuVisible, setEditCategoryMenuVisible] = useState(false);

    // Form states
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        category: 'Kuih',
        price: '',
        cost: '',
        stock: '',
        unit: '',
        lowStockThreshold: '',
        image: null
    });

    // Stock adjustment state
    const [stockAdjustment, setStockAdjustment] = useState({
        amount: '',
        type: 'add', // 'add' or 'deduct'
        isBatch: false
    });

    // Multiple selection for batch operations
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    // Use shared inventory model
    const [inventory, setInventory] = useState(getAllInventory());

    // Filter inventory based on active tab
    const filteredInventory = inventory.filter(item => {
        if (activeTab === 'low') return item.stock > 0 && item.stock <= item.lowStockThreshold;
        if (activeTab === 'out') return item.stock === 0;
        return true; // 'all' tab
    }).filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate inventory statistics
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const lowStockCount = inventory.filter(item => item.stock > 0 && item.stock <= item.lowStockThreshold).length;
    const outOfStockCount = inventory.filter(item => item.stock === 0).length;

    // Helper function to determine stock status
    const getStockStatus = (stock, threshold) => {
        if (stock === 0) return { color: MSMEColors.stockOut, label: 'Out of Stock', bgColor: '#FFEBEE' };
        if (stock <= threshold) return { color: MSMEColors.stockLow, label: 'Low Stock', bgColor: '#FFF8E1' };
        return { color: MSMEColors.stockGood, label: 'In Stock', bgColor: '#E8F5E9' };
    };

    // Function to handle adding a new product
    const handleAddProduct = () => {
        // Validate form inputs
        if (!formData.name || !formData.price) {
            setAlertDialog({ visible: true, title: 'Missing Information', message: 'Please fill in all required fields' });
            return;
        }

        const newProduct = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: parseFloat(formData.price),
            cost: formData.cost ? parseFloat(formData.cost) : 0,
            stock: parseInt(formData.stock),
            unit: formData.unit,
            lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold) : 0,
            image: formData.image,
        };

        addInventory(newProduct);
        setInventory(getAllInventory());
        setAddModalVisible(false);
        resetForm();
        setAlertDialog({ visible: true, title: 'Success', message: `${newProduct.name} added to inventory` });
    };

    // Function to handle editing a product
    const handleEditProduct = () => {
        if (!formData.name || !formData.price) {
            setAlertDialog({ visible: true, title: 'Missing Information', message: 'Please fill in all required fields' });
            return;
        }

        const updates = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: parseFloat(formData.price),
            cost: formData.cost ? parseFloat(formData.cost) : 0,
            stock: parseInt(formData.stock),
            unit: formData.unit,
            lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold) : 0,
            image: formData.image,
        };

        updateInventory(currentProduct.id, updates);
        setInventory(getAllInventory());
        setEditModalVisible(false);
        setCurrentProduct(null);
        resetForm();
        setAlertDialog({ visible: true, title: 'Success', message: `${formData.name} updated successfully` });
    };

    // Function to handle batch stock adjustment
    const handleBatchStockAdjustment = (type) => {
        setStockAdjustment({
            amount: '',
            type: type,
            isBatch: true
        });
        setStockModalVisible(true);
    };

    // Function to handle adjusting stock
    const handleStockAdjustment = () => {
        if (!stockAdjustment.amount || isNaN(parseInt(stockAdjustment.amount))) {
            setAlertDialog({ visible: true, title: 'Invalid Amount', message: 'Please enter a valid number' });
            return;
        }

        const amount = parseInt(stockAdjustment.amount);

        if (stockAdjustment.isBatch) {
            // Batch adjustment for multiple items
            const updatedInventory = inventory.map(item => {
                if (selectedItems.includes(item.id)) {
                    let newStock = item.stock;

                    if (stockAdjustment.type === 'add') {
                        newStock += amount;
                    } else {
                        newStock = Math.max(0, newStock - amount);
                    }

                    return {
                        ...item,
                        stock: newStock
                    };
                }
                return item;
            });

            setInventory(updatedInventory);
            setStockModalVisible(false);
            setStockAdjustment({ amount: '', type: 'add', isBatch: false });
            setMultiSelectMode(false);
            setSelectedItems([]);
            setAlertDialog({ visible: true, title: 'Success', message: `Stock ${stockAdjustment.type === 'add' ? 'added to' : 'deducted from'} ${selectedItems.length} items` });
        } else {
            // Single item adjustment
            const updatedInventory = inventory.map(item => {
                if (item.id === currentProduct.id) {
                    let newStock = item.stock;

                    if (stockAdjustment.type === 'add') {
                        newStock += amount;
                    } else {
                        newStock = Math.max(0, newStock - amount);
                    }

                    return {
                        ...item,
                        stock: newStock
                    };
                }
                return item;
            });

            setInventory(updatedInventory);
            setStockModalVisible(false);
            setStockAdjustment({ amount: '', type: 'add', isBatch: false });
            setCurrentProduct(null);
            setAlertDialog({ visible: true, title: 'Success', message: `Stock ${stockAdjustment.type === 'add' ? 'added' : 'deducted'} successfully` });
        }
    };

    // Function to handle deleting a product
    const handleDeleteProduct = () => {
        removeInventory(currentProduct.id);
        setInventory(getAllInventory());
        setDeleteDialogVisible(false);
        setCurrentProduct(null);
        setAlertDialog({ visible: true, title: 'Success', message: `${currentProduct.name} deleted from inventory` });
    };

    // Function to open edit modal
    const openEditModal = (product) => {
        setCurrentProduct(product);
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price.toString(),
            cost: product.cost ? product.cost.toString() : '',
            stock: product.stock.toString(),
            unit: product.unit,
            lowStockThreshold: product.lowStockThreshold.toString(),
            image: product.image
        });
        setEditModalVisible(true);
    };

    // Function to open stock adjustment modal
    const openStockModal = (product) => {
        setCurrentProduct(product);
        setStockModalVisible(true);
    };

    // Function to open delete confirmation dialog
    const openDeleteDialog = (product) => {
        setCurrentProduct(product);
        setDeleteDialogVisible(true);
    };

    // Reset form data
    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            category: 'Kuih',
            price: '',
            cost: '',
            stock: '',
            unit: '',
            lowStockThreshold: '',
            image: null
        });
    };

    // Chart data for inventory categories
    const chartData = {
        labels: ['Kuih', 'Desserts', 'Beverages'],
        datasets: [
            {
                data: [
                    inventory.filter(item => item.category === 'Kuih').length,
                    inventory.filter(item => item.category === 'Desserts').length,
                    inventory.filter(item => item.category === 'Beverages').length
                ]
            }
        ]
    };

    // Replace Alert.alert in FAB.Group actions and scan button
    const handleFeatureComingSoon = (feature) => {
        setAlertDialog({ visible: true, title: feature, message: `${feature} feature will be implemented in future updates` });
    };

    // Helper to get alert type from title
    const getAlertType = (title) => {
        if (!title) return 'info';
        if (title.toLowerCase().includes('success')) return 'success';
        if (title.toLowerCase().includes('missing') || title.toLowerCase().includes('invalid')) return 'error';
        if (title.toLowerCase().includes('warning')) return 'warning';
        return 'info';
    };

    return (
        <Provider>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={MSMEColors.textDark || "#374151"} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Inventory</Text>
                    <View style={styles.headerRightButtons}>
                        {!multiSelectMode ? (
                            <>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => setMultiSelectMode(true)}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={22} color={MSMEColors.inventory} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.scanButton}
                                    onPress={() => handleFeatureComingSoon('Scanner')}
                                >
                                    <Ionicons name="scan-outline" size={24} color={MSMEColors.inventory} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => {
                                    setMultiSelectMode(false);
                                    setSelectedItems([]);
                                }}
                            >
                                <Ionicons name="close-circle-outline" size={24} color={MSMEColors.inventory} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView style={styles.content}>
                    {/* Overview Cards */}

                    {/* Batch Operations Bar - Visible only when multiSelectMode is true */}
                    {multiSelectMode && (
                        <View style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: MSMEColors.white,
                            borderTopWidth: 1,
                            borderTopColor: MSMEColors.border,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            zIndex: 10,
                            minHeight: 56,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 8,
                        }}>
                            <Text style={{ fontWeight: 'bold', color: MSMEColors.inventory, fontSize: 15, flex: 1 }} numberOfLines={1}>
                                {selectedItems.length} selected
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
                                <IconButton
                                    icon="plus-box-outline"
                                    size={26}
                                    iconColor={MSMEColors.inventory}
                                    style={{ marginHorizontal: 2, backgroundColor: 'transparent' }}
                                    onPress={() => handleBatchStockAdjustment('add')}
                                    accessibilityLabel="Add Stock"
                                />
                                <IconButton
                                    icon="minus-box-outline"
                                    size={26}
                                    iconColor={MSMEColors.stockLow}
                                    style={{ marginHorizontal: 2, backgroundColor: 'transparent' }}
                                    onPress={() => handleBatchStockAdjustment('deduct')}
                                    accessibilityLabel="Deduct Stock"
                                />
                                <IconButton
                                    icon="close-circle-outline"
                                    size={26}
                                    iconColor={MSMEColors.inventory}
                                    style={{ marginHorizontal: 2, backgroundColor: 'transparent' }}
                                    onPress={() => { setMultiSelectMode(false); setSelectedItems([]); }}
                                    accessibilityLabel="Cancel"
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.statsContainer}>
                        <AnimatedCard
                            mode="elevated"
                            style={styles.statsCard}
                            entering={FadeIn.duration(150)}
                        >
                            <Card.Content style={styles.statsContent}>
                                <Text style={[styles.statValue, { color: MSMEColors.inventory }]}>{inventory.length}</Text>
                                <Text style={styles.statLabel}>Total Products</Text>
                            </Card.Content>
                        </AnimatedCard>

                        <AnimatedCard
                            mode="elevated"
                            style={styles.statsCard}
                            entering={FadeIn.duration(150)}
                        >
                            <Card.Content style={styles.statsContent}>
                                <Text style={[styles.statValue, { color: MSMEColors.stockLow }]}>{lowStockCount}</Text>
                                <Text style={styles.statLabel}>Low Stock</Text>
                            </Card.Content>
                        </AnimatedCard>

                        <AnimatedCard
                            mode="elevated"
                            style={styles.statsCard}
                            entering={FadeIn.duration(150)}
                        >
                            <Card.Content style={styles.statsContent}>
                                <Text style={[styles.statValue, { color: MSMEColors.stockOut }]}>{outOfStockCount}</Text>
                                <Text style={styles.statLabel}>Out of Stock</Text>
                            </Card.Content>
                        </AnimatedCard>
                    </View>

                    <AnimatedCard
                        mode="elevated"
                        style={styles.valueCard}
                        entering={FadeIn.duration(150)}
                    >
                        <Card.Content>
                            <View style={styles.valueSummary}>
                                <View>
                                    <Text style={styles.valueCardLabel}>Total Stock Value</Text>
                                    <Text style={styles.valueCardAmount}>RM {totalValue.toFixed(2)}</Text>
                                </View>
                                <Ionicons name="trending-up" size={24} color={MSMEColors.inventory} />
                            </View>

                            <View style={styles.chartContainer}>
                                <BarChart
                                    data={chartData}
                                    width={Dimensions.get('window').width - 80}
                                    height={120}
                                    chartConfig={{
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        color: (opacity = 1) => `rgba(40, 168, 107, ${opacity})`,
                                        barPercentage: 0.6,
                                    }}
                                    style={styles.chart}
                                    withHorizontalLabels={true}
                                    showBarTops={true}
                                    fromZero={true}
                                />
                            </View>
                        </Card.Content>
                    </AnimatedCard>

                    {/* Alert for low stock items */}
                    {lowStockCount > 0 && (
                        <AnimatedCard
                            mode="elevated"
                            style={styles.alertCard}
                            entering={FadeIn.duration(150)}
                        >
                            <Card.Content style={styles.alertContent}>
                                <Ionicons name="alert-circle-outline" size={24} color={MSMEColors.stockLow} />
                                <View style={styles.alertText}>
                                    <Text style={styles.alertTitle}>{lowStockCount} products running low on stock</Text>
                                    <Text style={styles.alertSubtitle}>Tap to view and reorder items</Text>
                                </View>
                            </Card.Content>
                        </AnimatedCard>
                    )}

                    {/* Filter Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                            onPress={() => setActiveTab('all')}
                        >
                            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                                All Items ({inventory.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'low' && styles.activeTab]}
                            onPress={() => setActiveTab('low')}
                        >
                            <Text style={[styles.tabText, activeTab === 'low' && styles.activeTabText]}>
                                Low Stock ({lowStockCount})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'out' && styles.activeTab]}
                            onPress={() => setActiveTab('out')}
                        >
                            <Text style={[styles.tabText, activeTab === 'out' && styles.activeTabText]}>
                                Out of Stock ({outOfStockCount})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <Searchbar
                        placeholder="Search products..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbar}
                        inputStyle={styles.searchInput}
                        iconColor={MSMEColors.inventory}
                    />

                    {/* Product List */}
                    <View style={styles.productListContainer}>
                        {filteredInventory.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="cube-outline" size={64} color="#DDD" />
                                <Text style={styles.emptyStateText}>No products found</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {searchQuery ? 'Try a different search term' : activeTab !== 'all' ? 'Switch to All Items tab' : 'Add your first product to get started'}
                                </Text>
                            </View>
                        ) : (
                            filteredInventory.map((item, index) => {
                                const stockStatus = getStockStatus(item.stock, item.lowStockThreshold);
                                const isSelected = selectedItems.includes(item.id);

                                // Function to toggle item selection
                                const toggleItemSelection = () => {
                                    if (isSelected) {
                                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                                    } else {
                                        setSelectedItems([...selectedItems, item.id]);
                                    }
                                };

                                // Function to handle press on product card
                                const handleProductPress = () => {
                                    if (multiSelectMode) {
                                        toggleItemSelection();
                                    } else {
                                        openEditModal(item);
                                    }
                                };

                                // Function to handle long press on product card
                                const handleLongPress = () => {
                                    if (!multiSelectMode) {
                                        setMultiSelectMode(true);
                                        setSelectedItems([item.id]);
                                    }
                                };

                                return (
                                    <AnimatedCard
                                        key={item.id}
                                        mode="elevated"
                                        style={[
                                            styles.productCard,
                                            isSelected && styles.selectedProductCard
                                        ]}
                                        entering={FadeIn.duration(150)}
                                        onPress={handleProductPress}
                                        onLongPress={handleLongPress}
                                    >
                                        <View style={styles.productCardContent}>
                                            {multiSelectMode && (
                                                <TouchableOpacity
                                                    style={styles.checkboxContainer}
                                                    onPress={toggleItemSelection}
                                                >
                                                    <View style={[
                                                        styles.checkbox,
                                                        isSelected && styles.checkboxSelected
                                                    ]}>
                                                        {isSelected && (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={16}
                                                                color="#FFF"
                                                            />
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            )}

                                            <View style={styles.productImageContainer}>
                                                {item.image ? (
                                                    <Image source={item.image} style={styles.productImage} />
                                                ) : (
                                                    <View style={[styles.productImagePlaceholder, { backgroundColor: addAlpha(MSMEColors.inventory, 0.12) }]}>
                                                        <Ionicons name="cube-outline" size={28} color={MSMEColors.inventory} />
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.productDetails}>
                                                <Text style={styles.productName}>{item.name}</Text>
                                                <Text style={styles.productCategory}>{item.category}</Text>
                                                <View style={styles.productMetaRow}>
                                                    <Text style={styles.productPrice}>RM {item.price.toFixed(2)}</Text>
                                                    <View style={[styles.stockBadge, { backgroundColor: stockStatus.bgColor }]}>
                                                        <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>
                                                            {stockStatus.label}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.stockCount}>
                                                <Text style={styles.stockValue}>{item.stock}</Text>
                                                <Text style={styles.stockValueLabel}>in stock</Text>
                                            </View>

                                            <View style={styles.actionButtons}>
                                                <IconButton
                                                    icon="plus-box-outline"
                                                    size={20}
                                                    iconColor={MSMEColors.inventory}
                                                    onPress={() => {
                                                        setStockAdjustment({ ...stockAdjustment, type: 'add' });
                                                        openStockModal(item);
                                                    }}
                                                />
                                                <IconButton
                                                    icon="minus-box-outline"
                                                    size={20}
                                                    iconColor={MSMEColors.stockLow}
                                                    onPress={() => {
                                                        setStockAdjustment({ ...stockAdjustment, type: 'deduct' });
                                                        openStockModal(item);
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </AnimatedCard>
                                );
                            })
                        )}
                    </View>
                </ScrollView>

                {/* Add Product Modal */}
                <Modal
                    visible={addModalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setAddModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}
                    >
                        <View style={{ width: '90%', maxWidth: 400, backgroundColor: MSMEColors.white, borderRadius: 18, padding: 0, overflow: 'hidden', elevation: 8 }}>
                            {/* Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: MSMEColors.border }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: MSMEColors.inventory }}>Add Product</Text>
                                <IconButton icon="close" size={22} onPress={() => setAddModalVisible(false)} iconColor={MSMEColors.darkGray} style={{ margin: 0 }} />
                            </View>
                            {/* Form (no scroll) */}
                            <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 0 }}>
                                {/* Image Picker */}
                                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                                    <TouchableOpacity
                                        style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: MSMEColors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: MSMEColors.border }}
                                        onPress={async () => {
                                            let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
                                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                                setFormData({ ...formData, image: { uri: result.assets[0].uri } });
                                            }
                                        }}
                                    >
                                        {formData.image ? (
                                            <Image source={formData.image} style={{ width: 64, height: 64, borderRadius: 12 }} />
                                        ) : (
                                            <Ionicons name="camera" size={28} color={MSMEColors.inventory} />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={async () => {
                                        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
                                        if (!result.canceled && result.assets && result.assets.length > 0) {
                                            setFormData({ ...formData, image: { uri: result.assets[0].uri } });
                                        }
                                    }}>
                                        <Text style={{ color: MSMEColors.inventory, fontSize: 12, marginTop: 4, textDecorationLine: 'underline' }}>{formData.image ? 'Change Image' : 'Add Image (optional)'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Fields */}
                                <PaperInput
                                    label="Product Name"
                                    value={formData.name}
                                    onChangeText={text => setFormData({ ...formData, name: text })}
                                    mode="flat"
                                    style={{ backgroundColor: MSMEColors.background, borderRadius: 8, marginBottom: 10, fontSize: 15 }}
                                    theme={{ colors: { primary: MSMEColors.inventory, text: MSMEColors.textDark, placeholder: MSMEColors.mutedForeground } }}
                                />
                                <PaperInput
                                    label="Category"
                                    value={formData.category}
                                    onChangeText={text => setFormData({ ...formData, category: text })}
                                    mode="flat"
                                    style={{ backgroundColor: MSMEColors.background, borderRadius: 8, marginBottom: 10, fontSize: 15 }}
                                    theme={{ colors: { primary: MSMEColors.inventory, text: MSMEColors.textDark, placeholder: MSMEColors.mutedForeground } }}
                                    right={PRODUCT_CATEGORIES.some(cat => cat.toLowerCase().startsWith(formData.category.toLowerCase())) ? <PaperInput.Icon icon="menu-down" /> : null}
                                />
                                {formData.category.length > 0 && PRODUCT_CATEGORIES.filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase())).length > 0 && (
                                    <View style={{ backgroundColor: MSMEColors.background, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: MSMEColors.border }}>
                                        {PRODUCT_CATEGORIES.filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase())).map(cat => (
                                            <TouchableOpacity key={cat} onPress={() => setFormData({ ...formData, category: cat })} style={{ padding: 10 }}>
                                                <Text style={{ color: MSMEColors.textDark }}>{cat}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                                <PaperInput
                                    label="Description (optional)"
                                    value={formData.description}
                                    onChangeText={text => setFormData({ ...formData, description: text })}
                                    mode="flat"
                                    style={{ backgroundColor: MSMEColors.background, borderRadius: 8, marginBottom: 10, fontSize: 15 }}
                                    theme={{ colors: { primary: MSMEColors.inventory, text: MSMEColors.textDark, placeholder: MSMEColors.mutedForeground } }}
                                    multiline
                                    numberOfLines={2}
                                />
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                                    <PaperInput
                                        label="Cost Price"
                                        value={formData.cost}
                                        onChangeText={text => setFormData({ ...formData, cost: text })}
                                        mode="flat"
                                        style={{ flex: 1, backgroundColor: MSMEColors.background, borderRadius: 8, fontSize: 15 }}
                                        theme={{ colors: { primary: MSMEColors.inventory, text: MSMEColors.textDark, placeholder: MSMEColors.mutedForeground } }}
                                        keyboardType="numeric"
                                    />
                                    <PaperInput
                                        label="Sell Price"
                                        value={formData.price}
                                        onChangeText={text => setFormData({ ...formData, price: text })}
                                        mode="flat"
                                        style={{ flex: 1, backgroundColor: MSMEColors.background, borderRadius: 8, fontSize: 15 }}
                                        theme={{ colors: { primary: MSMEColors.inventory, text: MSMEColors.textDark, placeholder: MSMEColors.mutedForeground } }}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            {/* Footer */}
                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: MSMEColors.border, padding: 16, backgroundColor: MSMEColors.white }}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setAddModalVisible(false)}
                                    style={{ flex: 1, borderColor: MSMEColors.inventory, borderRadius: 8, marginRight: 8 }}
                                    textColor={MSMEColors.inventory}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleAddProduct}
                                    style={{ flex: 1, backgroundColor: MSMEColors.inventory, borderRadius: 8, marginLeft: 8 }}
                                    buttonColor={MSMEColors.inventory}
                                >
                                    Save
                                </Button>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Edit Product Modal */}
                <Modal
                    visible={editModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContainer}
                    >
                        <View style={[styles.modalContent, { padding: 0, borderRadius: 16, backgroundColor: MSMEColors.white }]}> {/* More compact, rounded */}
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: MSMEColors.inventory }]}>Edit Product</Text>
                                <View style={styles.modalHeaderButtons}>
                                    <IconButton
                                        icon="delete-outline"
                                        size={24}
                                        iconColor={MSMEColors.stockOut}
                                        onPress={() => {
                                            setEditModalVisible(false);
                                            openDeleteDialog(currentProduct);
                                        }}
                                    />
                                    <IconButton
                                        icon="close"
                                        size={24}
                                        onPress={() => setEditModalVisible(false)}
                                    />
                                </View>
                            </View>
                            <ScrollView style={{ paddingHorizontal: 20, paddingBottom: 10, maxHeight: 420 }}>
                                {/* Image Picker */}
                                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                    {formData.image ? (
                                        <Image source={formData.image} style={{ width: 80, height: 80, borderRadius: 12, marginBottom: 8 }} />
                                    ) : (
                                        <TouchableOpacity
                                            style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: addAlpha(MSMEColors.inventory, 0.08), alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
                                            onPress={async () => {
                                                let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
                                                if (!result.canceled && result.assets && result.assets.length > 0) {
                                                    setFormData({ ...formData, image: { uri: result.assets[0].uri } });
                                                }
                                            }}
                                        >
                                            <Ionicons name="camera" size={32} color={MSMEColors.inventory} />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={async () => {
                                        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
                                        if (!result.canceled && result.assets && result.assets.length > 0) {
                                            setFormData({ ...formData, image: { uri: result.assets[0].uri } });
                                        }
                                    }}>
                                        <Text style={{ color: MSMEColors.inventory, fontSize: 13, textDecorationLine: 'underline' }}>{formData.image ? 'Change Image' : 'Add Image (optional)'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Form Fields */}
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ color: MSMEColors.darkGray, fontSize: 14, marginBottom: 6 }}>Product Name</Text>
                                    <PaperInput
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        style={styles.input}
                                        mode="outlined"
                                        theme={{ colors: { primary: MSMEColors.inventory } }}
                                    />
                                </View>
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ color: MSMEColors.darkGray, fontSize: 14, marginBottom: 6 }}>Category</Text>
                                    <PaperInput
                                        value={formData.category}
                                        onChangeText={text => setFormData({ ...formData, category: text })}
                                        mode="flat"
                                        style={{ backgroundColor: MSMEColors.background, borderRadius: 8, marginBottom: 10, fontSize: 15 }}
                                        theme={{ colors: { primary: MSMEColors.inventory, text: MSMEColors.textDark, placeholder: MSMEColors.mutedForeground } }}
                                        right={PRODUCT_CATEGORIES.some(cat => cat.toLowerCase().startsWith(formData.category.toLowerCase())) ? <PaperInput.Icon icon="menu-down" /> : null}
                                    />
                                    {formData.category.length > 0 && PRODUCT_CATEGORIES.filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase())).length > 0 && (
                                        <View style={{ backgroundColor: MSMEColors.background, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: MSMEColors.border }}>
                                            {PRODUCT_CATEGORIES.filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase())).map(cat => (
                                                <TouchableOpacity key={cat} onPress={() => setFormData({ ...formData, category: cat })} style={{ padding: 10 }}>
                                                    <Text style={{ color: MSMEColors.textDark }}>{cat}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ color: MSMEColors.darkGray, fontSize: 14, marginBottom: 6 }}>Description (optional)</Text>
                                    <PaperInput
                                        value={formData.description}
                                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                                        style={styles.input}
                                        mode="outlined"
                                        theme={{ colors: { primary: MSMEColors.inventory } }}
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                    <View style={{ flex: 1, marginRight: 6 }}>
                                        <Text style={{ color: MSMEColors.darkGray, fontSize: 14, marginBottom: 6 }}>Cost Price (RM)</Text>
                                        <PaperInput
                                            value={formData.cost}
                                            onChangeText={(text) => setFormData({ ...formData, cost: text })}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            mode="outlined"
                                            theme={{ colors: { primary: MSMEColors.inventory } }}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 6 }}>
                                        <Text style={{ color: MSMEColors.darkGray, fontSize: 14, marginBottom: 6 }}>Sell Price (RM)</Text>
                                        <PaperInput
                                            value={formData.price}
                                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            mode="outlined"
                                            theme={{ colors: { primary: MSMEColors.inventory } }}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                            <View style={[styles.modalActions, { marginTop: 0, borderTopWidth: 1, borderTopColor: MSMEColors.border, padding: 16 }]}> {/* Footer */}
                                <Button
                                    mode="outlined"
                                    onPress={() => setEditModalVisible(false)}
                                    style={[styles.cancelButton, { borderColor: MSMEColors.inventory }]}
                                    textColor={MSMEColors.inventory}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleEditProduct}
                                    style={[styles.submitButton, { backgroundColor: MSMEColors.inventory }]}
                                    buttonColor={MSMEColors.inventory}
                                >
                                    Update
                                </Button>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Stock Adjustment Modal */}
                <Modal
                    visible={stockModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setStockModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContainer}
                    >
                        <View style={[styles.modalContent, styles.stockModalContent]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {stockAdjustment.isBatch
                                        ? `Batch ${stockAdjustment.type === 'add' ? 'Add' : 'Deduct'} Stock (${selectedItems.length} items)`
                                        : `${stockAdjustment.type === 'add' ? 'Add' : 'Deduct'} Stock`
                                    }
                                </Text>
                                <IconButton
                                    icon="close"
                                    size={24}
                                    onPress={() => setStockModalVisible(false)}
                                />
                            </View>

                            {!stockAdjustment.isBatch && currentProduct && (
                                <View style={styles.stockProductInfo}>
                                    <Text style={styles.stockProductName}>{currentProduct.name}</Text>
                                    <Text style={styles.stockCurrentAmount}>Current Stock: {currentProduct.stock}</Text>
                                </View>
                            )}

                            {stockAdjustment.isBatch && (
                                <View style={styles.batchStockInfo}>
                                    <Text style={styles.batchStockText}>
                                        You are about to {stockAdjustment.type === 'add' ? 'add to' : 'deduct from'} the stock of {selectedItems.length} selected items.
                                    </Text>
                                </View>
                            )}

                            <PaperInput
                                label={`${stockAdjustment.type === 'add' ? 'Amount to Add' : 'Amount to Deduct'}${stockAdjustment.isBatch ? ' to each item' : ''}`}
                                value={stockAdjustment.amount}
                                onChangeText={(text) => setStockAdjustment({ ...stockAdjustment, amount: text })}
                                style={styles.input}
                                keyboardType="numeric"
                                mode="outlined"
                            />

                            <View style={styles.modalActions}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setStockModalVisible(false)}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleStockAdjustment}
                                    style={styles.submitButton}
                                    buttonColor={stockAdjustment.type === 'add' ? MSMEColors.inventory : MSMEColors.stockLow}
                                >
                                    {stockAdjustment.type === 'add' ? 'Add' : 'Deduct'}
                                </Button>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Delete Confirmation Dialog */}
                <Portal>
                    <Dialog
                        visible={deleteDialogVisible}
                        onDismiss={() => setDeleteDialogVisible(false)}
                        style={styles.dialog}
                    >
                        <Dialog.Title>Delete Product</Dialog.Title>
                        <Dialog.Content>
                            <Text>
                                Are you sure you want to delete {currentProduct?.name}? This action cannot be undone.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                            <Button
                                onPress={handleDeleteProduct}
                                textColor={MSMEColors.stockOut}
                            >
                                Delete
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Only show the Add Product FAB group when not in multiSelectMode */}
                {!multiSelectMode && (
                    <Portal>
                        <FAB.Group
                            open={false}
                            icon="plus"
                            color="#FFF"
                            fabStyle={styles.fab}
                            actions={[
                                {
                                    icon: 'cube-outline',
                                    label: 'Add Product',
                                    color: MSMEColors.inventory,
                                    onPress: () => {
                                        resetForm();
                                        setAddModalVisible(true);
                                    },
                                },
                                {
                                    icon: 'barcode-scan',
                                    label: 'Scan Barcode',
                                    color: MSMEColors.inventory,
                                    onPress: () => handleFeatureComingSoon('Scanner'),
                                },
                                {
                                    icon: 'file-import-outline',
                                    label: 'Import Products',
                                    color: MSMEColors.inventory,
                                    onPress: () => handleFeatureComingSoon('Import'),
                                }
                            ]}
                            onStateChange={() => { }}
                            onPress={() => {
                                resetForm();
                                setAddModalVisible(true);
                            }}
                        />
                    </Portal>
                )}
            </SafeAreaView>
            {/* Custom Alert Modal */}
            <CustomAlertModal
                visible={alertDialog.visible}
                title={alertDialog.title}
                message={alertDialog.message}
                type={getAlertType(alertDialog.title)}
                onClose={() => setAlertDialog({ ...alertDialog, visible: false })}
            />
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MSMEColors.textDark || "#374151",
    },
    headerRightButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    scanButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statsCard: {
        width: '31%',
        borderRadius: 12,
    },
    statsContent: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    valueCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    valueSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    valueCardLabel: {
        fontSize: 14,
        color: '#666',
    },
    valueCardAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MSMEColors.inventory,
    },
    chartContainer: {
        alignItems: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 8,
    },
    alertCard: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#FFF8E1',
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertText: {
        marginLeft: 12,
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: MSMEColors.stockLow,
    },
    alertSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: `${MSMEColors.inventory}15`,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: MSMEColors.inventory,
        fontWeight: 'bold',
    },
    searchbar: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    searchInput: {
        fontSize: 14,
    },
    productListContainer: {
        marginBottom: 80, // Space for FAB
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
    productCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    selectedProductCard: {
        borderWidth: 2,
        borderColor: MSMEColors.inventory,
    },
    productCardContent: {
        flexDirection: 'row',
        padding: 12,
    },
    productImageContainer: {
        marginRight: 12,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    productImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    productCategory: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    productMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: MSMEColors.inventory,
    },
    stockBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    stockBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    stockCount: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        minWidth: 40,
    },
    stockValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    stockValueLabel: {
        fontSize: 10,
        color: '#666',
    },
    actionButtons: {
        flexDirection: 'row',
        marginLeft: 8,
        marginTop: 8,
    },
    fab: {
        backgroundColor: MSMEColors.inventory,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalHeaderButtons: {
        flexDirection: 'row',
    },
    formContainer: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 15,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
    },
    submitButton: {
        flex: 1,
        marginLeft: 10,
    },
    stockModalContent: {
        padding: 20,
    },
    stockProductInfo: {
        alignItems: 'center',
        marginBottom: 15,
    },
    stockProductName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    stockCurrentAmount: {
        fontSize: 14,
        color: '#666',
    },
    batchStockInfo: {
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#E0F2F7', // Light blue background
        borderRadius: 8,
    },
    batchStockText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    dialog: {
        borderRadius: 12,
    },
    batchOperationsCard: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#E8F5E9', // Light green background
    },
    batchOperationsContent: {
        padding: 12,
        alignItems: 'center',
    },
    batchOperationsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50', // Darker green for title
        marginBottom: 10,
    },
    batchOperationsButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    batchButton: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 8,
    },
    batchButtonLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    checkboxContainer: {
        padding: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: MSMEColors.inventory,
        borderColor: MSMEColors.inventory,
    },
});

export default InventoryScreen; 