import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen({ navigation, route }) {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Fresh Milk 1L',
      price: 8.50,
      quantity: 2,
      store: 'Jaya Grocer',
      image: '🥛',
      variant: 'Regular 1L'
    },
    {
      id: 2,
      name: 'Organic Bananas',
      price: 5.90,
      quantity: 1,
      store: 'Jaya Grocer',
      image: '🍌',
      variant: '1kg'
    },
    {
      id: 3,
      name: 'Premium Coffee Beans',
      price: 25.90,
      quantity: 1,
      store: 'Jaya Grocer',
      image: '☕',
      variant: '500g'
    }
  ]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('primary');

  const paymentMethods = [
    { id: 'primary', name: 'Primary Wallet', balance: 2547.89, icon: 'wallet', type: 'wallet' },
    { id: 'tng', name: 'Touch \'n Go eWallet', balance: 456.20, icon: 'phone-portrait', type: 'ewallet' },
    { id: 'maybank', name: 'Maybank ****1234', balance: 15420.50, icon: 'card', type: 'bank' },
  ];

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.00;
  const serviceFee = 2.50;
  const total = subtotal + deliveryFee + serviceFee;

  const handleCheckout = () => {
    navigation.navigate('Payment', {
      items: cartItems,
      total,
      paymentMethod: paymentMethods.find(p => p.id === selectedPaymentMethod)
    });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemImage}>{item.image}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemVariant}>{item.variant}</Text>
        <Text style={styles.itemStore}>{item.store}</Text>
        <Text style={styles.itemPrice}>RM {item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderPaymentMethod = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.paymentMethod,
        selectedPaymentMethod === item.id && styles.selectedPaymentMethod
      ]}
      onPress={() => setSelectedPaymentMethod(item.id)}
    >
      <View style={styles.paymentMethodInfo}>
        <Ionicons name={item.icon} size={24} color="#007AFF" />
        <View style={styles.paymentMethodDetails}>
          <Text style={styles.paymentMethodName}>{item.name}</Text>
          <Text style={styles.paymentMethodBalance}>
            RM {item.balance.toFixed(2)}
          </Text>
        </View>
      </View>
      {selectedPaymentMethod === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  if (cartItems.length === 0) {
    return (
      <ScreenSafeArea style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>Add some items to get started</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('Shopping')}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
          { text: 'Cancel' },
          { text: 'Clear', onPress: () => setCartItems([]) }
        ])}>
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Text style={styles.itemImage}>{item.image}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemVariant}>{item.variant}</Text>
                <Text style={styles.itemStore}>{item.store}</Text>
                <Text style={styles.itemPrice}>RM {item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={16} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === item.id && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod(item.id)}
            >
              <View style={styles.paymentMethodInfo}>
                <Ionicons name={item.icon} size={24} color="#007AFF" />
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodName}>{item.name}</Text>
                  <Text style={styles.paymentMethodBalance}>
                    RM {item.balance.toFixed(2)}
                  </Text>
                </View>
              </View>
              {selectedPaymentMethod === item.id && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>RM {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>RM {deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>RM {serviceFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>RM {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Smart Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Features</Text>
          <View style={styles.smartFeature}>
            <Ionicons name="flash" size={20} color="#FFB800" />
            <Text style={styles.smartFeatureText}>
              Auto-selected optimal payment method based on balance and rewards
            </Text>
          </View>
          <View style={styles.smartFeature}>
            <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
            <Text style={styles.smartFeatureText}>
              Fraud protection enabled for this transaction
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutText}>
            Proceed to Payment • RM {total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    fontSize: 32,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemVariant: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemStore: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodBalance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  smartFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smartFeatureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  checkoutContainer: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 