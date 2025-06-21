import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function ShoppingScreen({ navigation }) {
  const [isInStore, setIsInStore] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [scanAnimation] = useState(new Animated.Value(0));

  const smartStores = [
    {
      id: 1,
      name: 'Jaya Grocer Smart',
      location: 'KLCC, KL',
      type: 'Grocery',
      icon: 'storefront',
      color: ['#3B82F6', '#1D4ED8'],
      features: ['IoT Sensors', 'RFID Tags', 'Auto-Checkout']
    },
    {
      id: 2,
      name: 'Village Grocer AI',
      location: 'Mont Kiara, KL',
      type: 'Premium Grocery',
      icon: 'leaf',
      color: ['#10B981', '#059669'],
      features: ['Smart Shelves', 'Auto-Detection', 'Instant Pay']
    },
    {
      id: 3,
      name: 'IKEA Experience',
      location: 'Damansara, KL',
      type: 'Furniture',
      icon: 'home',
      color: ['#F59E0B', '#D97706'],
      features: ['AR Preview', 'Smart Tags', 'Walk-out Pay']
    }
  ];

  const detectedProducts = [
    { id: 1, name: 'Organic Apples', price: 8.90, rfid: 'RF001', category: 'Fruits' },
    { id: 2, name: 'Fresh Milk', price: 6.50, rfid: 'RF002', category: 'Dairy' },
    { id: 3, name: 'Whole Grain Bread', price: 4.20, rfid: 'RF003', category: 'Bakery' },
  ];

  useEffect(() => {
    if (isInStore) {
      // Simulate IoT detection animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isInStore]);

  const handleStoreEntry = (store) => {
    setCurrentStore(store);
    setIsInStore(true);
    Alert.alert(
      '🔔 Smart Store Entry',
      `Welcome to ${store.name}!\nIoT sensors have detected your device.\nStart shopping - we'll track your items automatically.`,
      [{ text: 'Start Shopping', style: 'default' }]
    );
  };

  const handleRFIDScan = () => {
    navigation.navigate('QR Scanner');
  };

  const handleAutoCheckout = () => {
    Alert.alert(
      '🛒 Auto-Checkout',
      `You're leaving ${currentStore?.name}.\n\nItems detected: ${detectedItems.length}\nTotal: RM ${detectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}\n\nPayment will be processed automatically.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm & Leave', 
          style: 'default',
          onPress: () => {
            setIsInStore(false);
            setDetectedItems([]);
            setCurrentStore(null);
            Alert.alert('✅ Payment Complete', 'Thank you for shopping! Receipt sent to your phone.');
          }
        }
      ]
    );
  };

  const handleAddDetectedItem = (product) => {
    setDetectedItems(prev => [...prev, product]);
    Alert.alert('✅ Item Added', `${product.name} detected and added to your cart!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Ambient Commerce</Text>
            <Text style={styles.headerSubtitle}>Smart Shopping Experience</Text>
          </View>
          <TouchableOpacity onPress={handleRFIDScan} style={styles.scanButton}>
            <Ionicons name="scan" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {!isInStore ? (
          <>
            {/* Smart Stores */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏪 Smart Stores Near You</Text>
              {smartStores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={styles.storeCard}
                  onPress={() => handleStoreEntry(store)}
                >
                  <LinearGradient
                    colors={store.color}
                    style={styles.storeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.storeContent}>
                      <View style={styles.storeInfo}>
                        <Ionicons name={store.icon} size={28} color="white" />
                        <View style={styles.storeDetails}>
                          <Text style={styles.storeName}>{store.name}</Text>
                          <Text style={styles.storeLocation}>{store.location}</Text>
                          <Text style={styles.storeType}>{store.type}</Text>
                        </View>
                      </View>
                      <View style={styles.storeFeatures}>
                        {store.features.map((feature, index) => (
                          <View key={index} style={styles.featureTag}>
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <Ionicons name="arrow-forward-circle" size={24} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚀 How Ambient Commerce Works</Text>
              <View style={styles.howItWorksContainer}>
                <View style={styles.stepCard}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepTitle}>Walk In</Text>
                  <Text style={styles.stepDescription}>IoT sensors detect your phone automatically</Text>
                </View>
                <View style={styles.stepCard}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepTitle}>Shop Freely</Text>
                  <Text style={styles.stepDescription}>Scan RFID tags for product details & prices</Text>
                </View>
                <View style={styles.stepCard}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepTitle}>Walk Out</Text>
                  <Text style={styles.stepDescription}>Auto-checkout processes payment instantly</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* In-Store Experience */}
            <View style={styles.inStoreHeader}>
              <LinearGradient
                colors={currentStore?.color || ['#6366F1', '#8B5CF6']}
                style={styles.inStoreGradient}
              >
                <Text style={styles.inStoreTitle}>📍 You're in {currentStore?.name}</Text>
                <Text style={styles.inStoreSubtitle}>IoT sensors active - Shopping tracked automatically</Text>
                <Animated.View style={[
                  styles.scanIndicator,
                  {
                    opacity: scanAnimation,
                    transform: [{
                      scale: scanAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2]
                      })
                    }]
                  }
                ]}>
                  <Ionicons name="radio-outline" size={32} color="white" />
                </Animated.View>
              </LinearGradient>
            </View>

            {/* RFID Scanner */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 RFID Product Scanner</Text>
              <TouchableOpacity style={styles.rfidScanCard} onPress={handleRFIDScan}>
                <Ionicons name="scan-circle" size={48} color="#6366F1" />
                <Text style={styles.rfidScanTitle}>Scan RFID Tag</Text>
                <Text style={styles.rfidScanSubtitle}>Get instant product details & pricing</Text>
              </TouchableOpacity>
            </View>

            {/* Mock Product Detection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛍️ Available Products</Text>
              {detectedProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleAddDetectedItem(product)}
                >
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={styles.productRFID}>RFID: {product.rfid}</Text>
                  </View>
                  <View style={styles.productPrice}>
                    <Text style={styles.priceText}>RM {product.price.toFixed(2)}</Text>
                    <Ionicons name="add-circle" size={24} color="#10B981" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Cart */}
            {detectedItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛒 Auto-Detected Items</Text>
                <View style={styles.cartContainer}>
                  {detectedItems.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>RM {item.price.toFixed(2)}</Text>
                    </View>
                  ))}
                  <View style={styles.cartTotal}>
                    <Text style={styles.totalText}>
                      Total: RM {detectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Auto-Checkout */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.checkoutButton} onPress={handleAutoCheckout}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.checkoutGradient}
                >
                  <Ionicons name="exit" size={24} color="white" />
                  <Text style={styles.checkoutText}>Leave Store & Auto-Checkout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  storeCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  storeContent: {
    flex: 1,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeDetails: {
    marginLeft: 16,
    flex: 1,
  },
  storeName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  storeLocation: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
  storeType: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  storeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  howItWorksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6366F1',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  inStoreHeader: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  inStoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  inStoreTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  inStoreSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
  },
  scanIndicator: {
    marginTop: 8,
  },
  rfidScanCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rfidScanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  rfidScanSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  productCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  productRFID: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  productPrice: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartItemName: {
    fontSize: 14,
    color: '#111827',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cartTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
}); 