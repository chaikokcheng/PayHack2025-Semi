import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Badge, Searchbar, List, Button, Divider, FAB } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BarChart } from 'react-native-chart-kit';

// Import MSMEColors from MSMEToolsScreen to keep consistent styling
import { MSMEColors } from './MSMEToolsScreen';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const InventoryScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Sample inventory data
    const inventory = [
        {
            id: '1',
            name: 'Nasi Lemak Pack',
            category: 'Food',
            price: 3.50,
            stock: 25,
            cost: 2.00,
            lowStockThreshold: 10,
            image: require('../../../assets/nasi-lemak.jpg')
        },
        {
            id: '2',
            name: 'Teh Tarik',
            category: 'Beverages',
            price: 2.50,
            stock: 5,
            cost: 1.20,
            lowStockThreshold: 10,
            image: require('../../../assets/teh-tarik.jpg')
        },
        {
            id: '3',
            name: 'Curry Puff',
            category: 'Food',
            price: 1.80,
            stock: 0,
            cost: 1.00,
            lowStockThreshold: 15,
            image: null
        },
        {
            id: '4',
            name: 'Char Kway Teow',
            category: 'Food',
            price: 5.50,
            stock: 18,
            cost: 3.00,
            lowStockThreshold: 8,
            image: require('../../../assets/char-kway-teow.jpg')
        },
        {
            id: '5',
            name: 'Cendol',
            category: 'Desserts',
            price: 4.00,
            stock: 12,
            cost: 2.00,
            lowStockThreshold: 5,
            image: require('../../../assets/cendol.jpg')
        }
    ];

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

    // Chart data for inventory categories
    const chartData = {
        labels: ['Food', 'Beverages', 'Desserts'],
        datasets: [
            {
                data: [
                    inventory.filter(item => item.category === 'Food').length,
                    inventory.filter(item => item.category === 'Beverages').length,
                    inventory.filter(item => item.category === 'Desserts').length
                ]
            }
        ]
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={MSMEColors.gradientSuccess}
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
                            <Ionicons name="cube-outline" size={24} color="white" style={styles.titleIcon} />
                            <Text style={styles.headerTitle}>Inventory</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Track stock & manage products</Text>
                    </View>
                    <TouchableOpacity style={styles.scanButton}>
                        <Ionicons name="scan-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Overview Cards */}
                <View style={styles.statsContainer}>
                    <AnimatedCard
                        mode="elevated"
                        style={styles.statsCard}
                        entering={FadeInDown.delay(100).springify()}
                    >
                        <Card.Content style={styles.statsContent}>
                            <Text style={[styles.statValue, { color: MSMEColors.inventory }]}>{inventory.length}</Text>
                            <Text style={styles.statLabel}>Total Products</Text>
                        </Card.Content>
                    </AnimatedCard>

                    <AnimatedCard
                        mode="elevated"
                        style={styles.statsCard}
                        entering={FadeInDown.delay(200).springify()}
                    >
                        <Card.Content style={styles.statsContent}>
                            <Text style={[styles.statValue, { color: MSMEColors.stockLow }]}>{lowStockCount}</Text>
                            <Text style={styles.statLabel}>Low Stock</Text>
                        </Card.Content>
                    </AnimatedCard>

                    <AnimatedCard
                        mode="elevated"
                        style={styles.statsCard}
                        entering={FadeInDown.delay(300).springify()}
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
                    entering={FadeInDown.delay(400).springify()}
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
                        entering={FadeInDown.delay(500).springify()}
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

                            return (
                                <AnimatedCard
                                    key={item.id}
                                    mode="elevated"
                                    style={styles.productCard}
                                    entering={FadeInDown.delay(100 * index).springify()}
                                >
                                    <View style={styles.productCardContent}>
                                        <View style={styles.productImageContainer}>
                                            {item.image ? (
                                                <Image source={item.image} style={styles.productImage} />
                                            ) : (
                                                <View style={[styles.productImagePlaceholder, { backgroundColor: `${MSMEColors.inventory}20` }]}>
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
                                    </View>
                                </AnimatedCard>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* FAB for adding new product */}
            <FAB
                icon="plus"
                color="#FFF"
                style={styles.fab}
                customSize={56}
                onPress={() => console.log('Add product')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
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
    scanButton: {
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
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: MSMEColors.inventory,
    },
});

export default InventoryScreen; 