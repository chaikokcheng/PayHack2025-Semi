import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  Image,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function ShoppingScreen({ navigation }) {
  const [isInStore, setIsInStore] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [scanAnimation] = useState(new Animated.Value(0));
  const [showRFIDModal, setShowRFIDModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [checkoutAnimation, setCheckoutAnimation] = useState(new Animated.Value(0));
  const [scanningAnimation] = useState(new Animated.Value(0));

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
    {
      id: 1,
      name: 'Organic Fuji Apples',
      price: 8.90,
      rfid: 'RF001',
      category: 'Fresh Fruits',
      brand: 'Organic Valley',
      weight: '1.2kg (6 pieces)',
      origin: 'New Zealand',
      nutrition: {
        calories: '52 per 100g',
        fiber: '2.4g',
        sugar: '10.4g',
        vitamin: 'Vitamin C: 5mg'
      },
      benefits: ['High in Fiber', 'Rich in Antioxidants', 'Natural Sweetness'],
      image: '🍎'
    },
    {
      id: 2,
      name: 'Farm Fresh Milk',
      price: 6.50,
      rfid: 'RF002',
      category: 'Dairy Products',
      brand: 'Fernleaf',
      volume: '1 Liter',
      expiry: '7 days from today',
      nutrition: {
        calories: '42 per 100ml',
        protein: '3.4g',
        calcium: '113mg',
        fat: '1.5g'
      },
      benefits: ['High Calcium', 'Rich in Protein', 'Vitamin D Fortified'],
      image: '🥛'
    },
    {
      id: 3,
      name: 'Artisan Whole Grain Bread',
      price: 4.20,
      rfid: 'RF003',
      category: 'Bakery',
      brand: 'Gardenia',
      weight: '400g (12 slices)',
      ingredients: 'Whole wheat flour, water, yeast, salt',
      nutrition: {
        calories: '69 per slice',
        protein: '2.7g',
        fiber: '2.1g',
        carbs: '12.9g'
      },
      benefits: ['Whole Grain', 'High Fiber', 'No Preservatives'],
      image: '🍞'
    },
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
    setShowRFIDModal(true);

    // Simulate scanning animation
    Animated.loop(
      Animated.timing(scanningAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Simulate product detection after 2 seconds
    setTimeout(() => {
      const randomProduct = detectedProducts[Math.floor(Math.random() * detectedProducts.length)];
      setScannedProduct(randomProduct);
      scanningAnimation.stopAnimation();
      scanningAnimation.setValue(0);
    }, 2000);
  };

  const handleAutoCheckout = () => {
    setShowCheckoutModal(true);

    // Animate checkout process
    Animated.sequence([
      Animated.timing(checkoutAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowCheckoutModal(false);
        setIsInStore(false);
        setDetectedItems([]);
        setCurrentStore(null);
        setCheckoutAnimation(new Animated.Value(0));
        Alert.alert('✅ Payment Complete', 'Thank you for shopping! Receipt sent to your phone.');
      }, 1000);
    });
  };

  const addToCart = (product) => {
    setDetectedItems(prev => [...prev, product]);
    setShowRFIDModal(false);
    setScannedProduct(null);
    Alert.alert('✅ Item Added', `${product.name} added to your cart!`);
  };

  const closeRFIDModal = () => {
    setShowRFIDModal(false);
    setScannedProduct(null);
    scanningAnimation.setValue(0);
  };

  return (
    <ScreenSafeArea style={styles.container}>
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
              <Text style={styles.sectionTitle}>Smart Stores Near You</Text>
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
              <Text style={styles.sectionTitle}>How Ambient Commerce Works</Text>
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
                  onPress={() => addToCart(product)}
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

      {/* RFID Scanning Modal */}
      <Modal
        visible={showRFIDModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRFIDModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rfidModalContainer}>
            {!scannedProduct ? (
              // Scanning State
              <View style={styles.scanningContainer}>
                <Animated.View
                  style={[
                    styles.scanningCircle,
                    {
                      transform: [{
                        rotate: scanningAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }
                  ]}
                >
                  <Ionicons name="scan-circle" size={80} color="#6366F1" />
                </Animated.View>
                <Text style={styles.scanningText}>Scanning RFID Tag...</Text>
                <Text style={styles.scanningSubtext}>Place your phone near the product tag</Text>
              </View>
            ) : (
              // Product Details State
              <ScrollView style={styles.productDetailsContainer}>
                <TouchableOpacity style={styles.modalCloseButton} onPress={closeRFIDModal}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.productHeader}>
                  <Text style={styles.productEmoji}>{scannedProduct.image}</Text>
                  <View style={styles.rfidTag}>
                    <Text style={styles.rfidTagText}>RFID: {scannedProduct.rfid}</Text>
                  </View>
                </View>

                <Text style={styles.productDetailName}>{scannedProduct.name}</Text>
                <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
                <Text style={styles.productCategory}>{scannedProduct.category}</Text>

                <View style={styles.priceSection}>
                  <Text style={styles.productDetailPrice}>RM {scannedProduct.price.toFixed(2)}</Text>
                  <View style={styles.stockStatus}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.stockText}>In Stock</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionHeaderText}>Product Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Weight/Volume:</Text>
                    <Text style={styles.detailValue}>{scannedProduct.weight || scannedProduct.volume}</Text>
                  </View>
                  {scannedProduct.origin && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Origin:</Text>
                      <Text style={styles.detailValue}>{scannedProduct.origin}</Text>
                    </View>
                  )}
                  {scannedProduct.expiry && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Best Before:</Text>
                      <Text style={styles.detailValue}>{scannedProduct.expiry}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionHeaderText}>Nutrition Facts</Text>
                  {Object.entries(scannedProduct.nutrition).map(([key, value]) => (
                    <View key={key} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                      <Text style={styles.detailValue}>{value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionHeaderText}>Benefits</Text>
                  <View style={styles.benefitsContainer}>
                    {scannedProduct.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitTag}>
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => addToCart(scannedProduct)}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.addToCartGradient}
                  >
                    <Ionicons name="bag-add" size={20} color="white" />
                    <Text style={styles.addToCartText}>Add to Cart - RM {scannedProduct.price.toFixed(2)}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Enhanced Auto-Checkout Modal */}
      <Modal
        visible={showCheckoutModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.checkoutOverlay}>
          <View style={styles.checkoutModalContainer}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.checkoutHeader}
            >
              <Ionicons name="storefront" size={32} color="white" />
              <Text style={styles.checkoutTitle}>Leaving {currentStore?.name}</Text>
              <Text style={styles.checkoutSubtitle}>Processing auto-checkout...</Text>
            </LinearGradient>

            <View style={styles.checkoutContent}>
              <Animated.View style={[
                styles.checkoutProgress,
                {
                  width: checkoutAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} />

              <View style={styles.checkoutSteps}>
                <View style={styles.checkoutStep}>
                  <View style={[styles.stepIndicator, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="scan" size={16} color="white" />
                  </View>
                  <Text style={styles.stepText}>Items Scanned</Text>
                </View>
                <View style={styles.checkoutStep}>
                  <Animated.View style={[
                    styles.stepIndicator,
                    {
                      backgroundColor: checkoutAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: ['#E5E7EB', '#F59E0B', '#10B981']
                      })
                    }
                  ]}>
                    <Ionicons name="card" size={16} color="white" />
                  </Animated.View>
                  <Text style={styles.stepText}>Payment Processing</Text>
                </View>
                <View style={styles.checkoutStep}>
                  <Animated.View style={[
                    styles.stepIndicator,
                    {
                      backgroundColor: checkoutAnimation.interpolate({
                        inputRange: [0, 0.8, 1],
                        outputRange: ['#E5E7EB', '#E5E7EB', '#10B981']
                      })
                    }
                  ]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </Animated.View>
                  <Text style={styles.stepText}>Receipt Sent</Text>
                </View>
              </View>

              <View style={styles.receiptPreview}>
                <Text style={styles.receiptTitle}>Digital Receipt</Text>
                {detectedItems.map((item, index) => (
                  <View key={index} style={styles.receiptItem}>
                    <Text style={styles.receiptItemName}>{item.name}</Text>
                    <Text style={styles.receiptItemPrice}>RM {item.price.toFixed(2)}</Text>
                  </View>
                ))}
                <View style={styles.receiptTotal}>
                  <Text style={styles.receiptTotalText}>Total: RM {detectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.paymentMethod}>
                <Ionicons name="card" size={20} color="#6366F1" />
                <Text style={styles.paymentText}>Touch 'n Go eWallet (Primary)</Text>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenSafeArea>
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

  // RFID Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rfidModalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  scanningContainer: {
    alignItems: 'center',
    padding: 40,
  },
  scanningCircle: {
    marginBottom: 20,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  scanningSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  productDetailsContainer: {
    maxHeight: '100%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  productEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  rfidTag: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rfidTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productDetailName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  productBrand: {
    fontSize: 16,
    color: '#6366F1',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  productCategory: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  productDetailPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  detailSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  addToCartBtn: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Enhanced Checkout Modal Styles
  checkoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutModalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '90%',
    overflow: 'hidden',
  },
  checkoutHeader: {
    alignItems: 'center',
    padding: 24,
  },
  checkoutTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  checkoutSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  checkoutContent: {
    padding: 24,
  },
  checkoutProgress: {
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
    marginBottom: 24,
  },
  checkoutSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  checkoutStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  receiptPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  receiptItemName: {
    fontSize: 14,
    color: '#6B7280',
  },
  receiptItemPrice: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  receiptTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  receiptTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 