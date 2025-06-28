import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Image, Dimensions, Platform, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Slider from '@react-native-community/slider';

const sampleMenu = [
  {
    id: 1,
    name: { en: 'Nasi Lemak', zh: '椰浆饭' },
    price: 12.0,
    desc: 'Classic Malaysian coconut rice with sambal, egg, peanuts, and anchovies.',
    tag: 'Most ordered',
  },
  {
    id: 2,
    name: { en: 'Teh Tarik', zh: '拉茶' },
    price: 3.5,
    desc: 'Frothy pulled milk tea, a Malaysian favorite.',
    tag: '',
  },
  {
    id: 3,
    name: { en: 'Roti Canai', zh: '印度煎饼' },
    price: 2.5,
    desc: 'Flaky flatbread served with dhal and curry.',
    tag: 'Recommended',
  },
  {
    id: 4,
    name: { en: 'Char Kway Teow', zh: '炒粿条' },
    price: 10.0,
    desc: 'Stir-fried flat rice noodles with prawns, egg, and bean sprouts.',
    tag: 'Spicy',
  },
  {
    id: 5,
    name: { en: 'Laksa', zh: '叻沙' },
    price: 11.0,
    desc: 'Spicy noodle soup with coconut milk, shrimp, and tofu.',
    tag: '',
  },
  {
    id: 6,
    name: { en: 'Chicken Rice', zh: '鸡饭' },
    price: 9.0,
    desc: 'Steamed chicken with fragrant rice and chili sauce.',
    tag: 'Popular',
  },
  {
    id: 7,
    name: { en: 'Cendol', zh: '煎蕊' },
    price: 6.0,
    desc: 'Iced dessert with green rice flour jelly, coconut milk, and palm sugar.',
    tag: 'Dessert',
  },
  {
    id: 8,
    name: { en: 'Milo Dinosaur', zh: '美禄恐龙' },
    price: 5.0,
    desc: 'Iced Milo drink topped with extra Milo powder.',
    tag: 'Drink',
  },
];

const { width } = Dimensions.get('window');

// Static image map for menu items
const imageMap = {
  'nasi lemak': require('../../assets/nasi-lemak.jpg'),
  'teh tarik': require('../../assets/teh-tarik.jpg'),
  'roti canai': require('../../assets/roti-canai.jpg'),
  'char kway teow': require('../../assets/char-kway-teow.jpg'),
  'laksa': require('../../assets/laksa.jpg'),
  'chicken rice': require('../../assets/chicken-rice.jpg'),
  'cendol': require('../../assets/cendol.jpg'),
  'milo dinosaur': require('../../assets/milo-dinosaur.jpg'),
};

export default function MerchantMenuScreen({ navigation, route }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [splitMode, setSplitMode] = useState('full'); // 'full', 'percent', 'items'
  const [percent, setPercent] = useState(50);
  const [selectedForSplit, setSelectedForSplit] = useState([]); // for 'items' mode
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [addOnItemIdx, setAddOnItemIdx] = useState(null);
  const [addOnSelections, setAddOnSelections] = useState([]); // [{idx, addOns: [], note: '', qty: 1}]
  const [addOnNote, setAddOnNote] = useState('');
  const [addOnSelected, setAddOnSelected] = useState([]); // indices of add-ons
  const [addOnQty, setAddOnQty] = useState(1);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState(null);
  const menu = route?.params?.items?.length ? route.params.items : sampleMenu;
  const merchantId = route?.params?.merchant_id || 'PAYHACK_MERCHANT_001';
  const description = route?.params?.description || 'Table Bill';
  const currency = route?.params?.currency || 'MYR';
  const merchantName = route?.params?.merchant_name || 'Restoran Nasi Lemak Antarabangsa';

  // Handle item removal after successful payment
  useEffect(() => {
    if (route.params?.shouldRemoveItems && route.params?.paidItems) {
      const paidItems = route.params.paidItems;
      const splitMode = route.params.splitMode;
      
      if (splitMode === 'full') {
        // Remove all items for full payment
        setSelectedItems([]);
        setSelectedForSplit([]);
        setAddOnSelections([]);
        setPaymentSuccessMessage('All items have been paid for and removed from your cart.');
      } else if (splitMode === 'items' && route.params.selectedIndices) {
        // Remove only selected items - selectedIndices contains the cart item indices
        const selectedIndices = route.params.selectedIndices;
        
        // Create a set of cart indices to remove for faster lookup
        const indicesToRemove = new Set(selectedIndices);
        
        // Remove the paid items from selectedItems by filtering out the ones at the specified cart indices
        setSelectedItems(prev => prev.filter((_, cartIdx) => !indicesToRemove.has(cartIdx)));
        
        // Clear selectedForSplit since those items are now paid
        setSelectedForSplit([]);
        
        // Remove add-on selections for paid items
        setAddOnSelections(prev => prev.filter(sel => {
          // Find the cart index for this add-on selection
          const cartIdx = prev.findIndex(item => item.idx === sel.idx);
          return !indicesToRemove.has(cartIdx);
        }));
        
        setPaymentSuccessMessage('Selected items have been paid for and removed from your cart.');
      } else if (splitMode === 'percent') {
        // For percentage payments, we don't remove items but show success message
        setPaymentSuccessMessage('Partial payment has been processed successfully.');
      }
      
      // Auto-clear the success message after 5 seconds
      setTimeout(() => {
        setPaymentSuccessMessage(null);
      }, 5000);
      
      // Clear the navigation params to prevent re-triggering
      navigation.setParams({
        shouldRemoveItems: undefined,
        paidItems: undefined,
        splitMode: undefined,
        selectedItems: undefined,
        selectedIndices: undefined
      });
    }
  }, [route.params?.shouldRemoveItems, route.params?.paidItems]);

  // Helper to get add-on info for a selected item
  const getAddOnInfo = (idx) => addOnSelections.find(sel => sel.idx === idx) || { addOns: [], note: '', qty: 1 };

  const handleAddItem = (idx) => {
    setAddOnItemIdx(idx);
    setAddOnSelected([]);
    setAddOnNote('');
    setAddOnQty(1);
    setShowAddOnModal(true);
  };
  const handleRemoveItem = (idx) => {
    setSelectedItems((prev) => prev.filter(i => i !== idx));
    setSelectedForSplit((prev) => prev.filter(i => i !== idx));
    setAddOnSelections((prev) => prev.filter(sel => sel.idx !== idx));
  };
  const getItemCount = (idx) => selectedItems.filter(i => i === idx).length;
  const cartItems = selectedItems.map(idx => {
    const base = menu[idx];
    const addOnInfo = getAddOnInfo(idx);
    return {
      ...base,
      addOns: addOnInfo.addOns || [],
      note: addOnInfo.note || '',
      qty: addOnInfo.qty || 1,
    };
  });
  const total = cartItems.reduce((sum, item) => sum + (item.price + (item.addOns?.reduce((a, b) => a + (b.price || 0), 0) || 0)) * (item.qty || 1), 0);

  // Split payment logic
  let payAmount = 0;
  if (splitMode === 'full') payAmount = total;
  if (splitMode === 'percent') payAmount = total * (percent / 100);
  if (splitMode === 'items' && selectedForSplit.length > 0) {
    payAmount = selectedForSplit.reduce((sum, idx) => {
      const item = cartItems.find((_, i) => i === selectedItems.indexOf(idx));
      return sum + ((item?.price || 0) + (item?.addOns?.reduce((a, b) => a + (b.price || 0), 0) || 0)) * (item?.qty || 1);
    }, 0);
  }

  const handleToggleSplitItem = (idx) => {
    setSelectedForSplit((prev) => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  // Add-On Modal Confirm
  const handleAddOnConfirm = () => {
    setSelectedItems((prev) => [...prev, addOnItemIdx]);
    setAddOnSelections((prev) => {
      // Remove previous for this idx
      const filtered = prev.filter(sel => sel.idx !== addOnItemIdx);
      return [
        ...filtered,
        {
          idx: addOnItemIdx,
          addOns: (menu[addOnItemIdx]?.addOns || []).filter((_, i) => addOnSelected.includes(i)),
          note: addOnNote,
          qty: addOnQty,
        },
      ];
    });
    setShowAddOnModal(false);
  };

  // Proceed to split modal instead of payment
  const handleProceed = () => {
    setShowSplitModal(true);
  };

  // Confirm split modal and go to payment
  const handleSplitConfirm = () => {
    let itemsToPay = [];
    let amountToPay = totalToPay; // Use totalToPay which includes taxes and service charges
    if (splitMode === 'items') {
      itemsToPay = selectedForSplit.map(idx => cartItems[idx]);
    } else {
      itemsToPay = cartItems;
    }
    navigation.navigate('QRScannerScreen', {
      merchantPayment: {
        merchant_id: merchantId,
        amount: amountToPay,
        currency,
        qr_type: 'merchant',
        description,
        items: itemsToPay,
        splitMode,
        percent: splitMode === 'percent' ? percent : undefined,
        // Pass the selectedForSplit indices for proper cart removal
        selectedItems: splitMode === 'items' ? selectedForSplit : [],
      },
    });
    setShowSplitModal(false);
  };

  // 1. Add merchant info section at the top
  const merchantInfo = {
    name: merchantName,
    rating: 4.8,
    reviews: 1240,
    tagline: 'Authentic Malaysian Flavours',
    status: 'Open Now • 7:00 AM - 10:00 PM',
  };

  // Calculate subtotal based on split mode
  let subtotal = 0;
  if (splitMode === 'full') subtotal = total;
  if (splitMode === 'percent') subtotal = total * (percent / 100);
  if (splitMode === 'items' && selectedForSplit.length > 0) {
    subtotal = selectedForSplit.reduce((sum, idx) => {
      const item = cartItems[idx];
      return sum + ((item?.price || 0) + (item?.addOns?.reduce((a, b) => a + (b.price || 0), 0) || 0)) * (item?.qty || 1);
    }, 0);
  }
  const sst = subtotal * 0.06;
  const serviceCharge = subtotal * 0.10;
  const totalToPay = subtotal + sst + serviceCharge;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* App Bar with Close Button, now with fixed height and top padding */}
      <View style={styles.appBar}>
        <View style={styles.appBarContent}>
          <Text style={styles.appBarTitle}>Merchant App</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Merchant Info Section */}
      <View style={{ padding: 20, backgroundColor: '#f8f8f8', borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222' }}>{merchantInfo.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: 16, color: '#fbbf24', marginRight: 4 }}>★</Text>
          <Text style={{ fontSize: 16, color: '#222', fontWeight: '600' }}>{merchantInfo.rating}</Text>
          <Text style={{ fontSize: 14, color: '#888', marginLeft: 8 }}>{merchantInfo.reviews}+ ratings</Text>
        </View>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>{merchantInfo.tagline}</Text>
        <Text style={{ fontSize: 13, color: '#4ade80', marginTop: 2 }}>{merchantInfo.status}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.menuList}>
        <Text style={styles.sectionTitle}>🍽️ Set Meal</Text>
        <Text style={styles.sectionDesc}>Choose your meal below</Text>
        {menu.map((item, idx) => (
          <View key={item.id || idx} style={styles.card}>
            {/* Use local images from frontend/assets/ - place your images with these names: nasi-lemak.jpg, teh-tarik.jpg, roti-canai.jpg, char-kway-teow.jpg, laksa.jpg, chicken-rice.jpg, cendol.jpg, milo-dinosaur.jpg */}
            <Image source={imageMap[item.name.en.toLowerCase()] || require('../../assets/default.jpg')} style={styles.menuImg} />
            <View style={{ flex: 1 }}>
              {item.tag ? <Text style={styles.menuTag}>{item.tag}</Text> : null}
              <Text style={styles.menuName}>{item.name?.en}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
              <Text style={styles.menuPrice}>RM {item.price.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: 'center', marginLeft: 8 }}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddItem(idx)}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
              {getItemCount(idx) > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(idx)}
                >
                  <Ionicons name="remove-circle" size={22} color="#F44336" />
                </TouchableOpacity>
              )}
              {getItemCount(idx) > 0 && (
                <Text style={styles.itemCount}>{getItemCount(idx)}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Add-On Modal */}
      <Modal visible={showAddOnModal} transparent animationType="slide" onRequestClose={() => setShowAddOnModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 24, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Add-ons & Notes</Text>
            {addOnItemIdx !== null && menu[addOnItemIdx]?.addOns && menu[addOnItemIdx].addOns.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: '600', marginBottom: 8 }}>Add-ons</Text>
                {menu[addOnItemIdx].addOns.map((add, i) => (
                  <TouchableOpacity key={i} onPress={() => setAddOnSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name={addOnSelected.includes(i) ? 'checkbox' : 'square-outline'} size={20} color={Colors.primary} />
                    <Text style={{ marginLeft: 8 }}>{add.label} {add.price > 0 && <Text style={{ color: '#E91E63' }}>+RM {add.price}</Text>}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Notes to Merchant</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 15, minHeight: 40, textAlignVertical: 'top' }}
                placeholder="E.g. No peanuts, extra spicy, etc."
                value={addOnNote}
                onChangeText={setAddOnNote}
                multiline
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginRight: 12 }}>Quantity</Text>
              <TouchableOpacity onPress={() => setAddOnQty(q => Math.max(1, q - 1))} style={{ padding: 6 }}>
                <Ionicons name="remove-circle-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginHorizontal: 8 }}>{addOnQty}</Text>
              <TouchableOpacity onPress={() => setAddOnQty(q => q + 1)} style={{ padding: 6 }}>
                <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setShowAddOnModal(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#666', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddOnConfirm}>
                <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: 'bold' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Split Payment Modal */}
      <Modal visible={showSplitModal} transparent animationType="slide" onRequestClose={() => setShowSplitModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 24, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>How do you want to pay?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setSplitMode('full')} style={{ marginRight: 18, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={splitMode === 'full' ? 'radio-button-on' : 'radio-button-off'} size={20} color={Colors.primary} />
                <Text style={{ marginLeft: 6 }}>Pay Full</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSplitMode('percent')} style={{ marginRight: 18, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={splitMode === 'percent' ? 'radio-button-on' : 'radio-button-off'} size={20} color={Colors.primary} />
                <Text style={{ marginLeft: 6 }}>Split by %</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSplitMode('items')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={splitMode === 'items' ? 'radio-button-on' : 'radio-button-off'} size={20} color={Colors.primary} />
                <Text style={{ marginLeft: 6 }}>Pay for Items</Text>
              </TouchableOpacity>
            </View>
            {/* Split Mode Inputs */}
            {splitMode === 'percent' && (
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 15, color: '#222', marginBottom: 4 }}>Pay {percent}% of total</Text>
                <Slider
                  style={{ width: 220, height: 40 }}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  value={percent}
                  onValueChange={setPercent}
                  minimumTrackTintColor="#22c55e"
                  maximumTrackTintColor="#eee"
                  thumbTintColor="#22c55e"
                />
                <Text style={{ fontSize: 13, color: '#888' }}>Use the slider to select your share</Text>
              </View>
            )}
            <ScrollView style={{ maxHeight: 180 }}>
              {cartItems.length === 0 ? (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>Your cart is empty.</Text>
              ) : (
                cartItems.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: splitMode === 'items' && selectedForSplit.includes(idx) ? '#e6f9f0' : 'transparent', borderRadius: 8 }}>
                    <Image source={imageMap[item.name.en.toLowerCase()] || require('../../assets/default.jpg')} style={{ width: 56, height: 56, borderRadius: 8, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name.en}</Text>
                      {item.note ? <Text style={{ color: '#888', fontSize: 13 }}>Note: {item.note}</Text> : null}
                      {item.addOns && item.addOns.length > 0 && (
                        <Text style={{ color: '#888', fontSize: 13 }}>Add-ons: {item.addOns.map(a => a.name?.en || a.name).join(', ')}</Text>
                      )}
                      <Text style={{ color: '#888', fontSize: 13 }}>Qty: {item.qty}</Text>
                    </View>
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#222', marginRight: 8 }}>RM{((item.price + (item.addOns?.reduce((a, b) => a + (b.price || 0), 0) || 0)) * (item.qty || 1)).toFixed(2)}</Text>
                    {splitMode === 'items' && (
                      <TouchableOpacity onPress={() => handleToggleSplitItem(idx)} style={{ padding: 4 }}>
                        <Ionicons name={selectedForSplit.includes(idx) ? 'checkbox' : 'square-outline'} size={24} color={selectedForSplit.includes(idx) ? '#22c55e' : '#bbb'} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            {/* Promo code section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
              <Ionicons name="pricetag" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
              <TextInput placeholder="Enter promo code" style={{ flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, fontSize: 15 }} />
              <TouchableOpacity style={{ marginLeft: 8, backgroundColor: '#fbbf24', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Apply</Text>
              </TouchableOpacity>
            </View>
            {/* Subtotal, Taxes, and Total */}
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: '#666' }}>Subtotal</Text>
                <Text style={{ fontSize: 15, color: '#222', fontWeight: '600' }}>RM{subtotal.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: '#666' }}>SST (6%)</Text>
                <Text style={{ fontSize: 15, color: '#222', fontWeight: '600' }}>RM{sst.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: '#666' }}>Service Charge (10%)</Text>
                <Text style={{ fontSize: 15, color: '#222', fontWeight: '600' }}>RM{serviceCharge.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 18 }}>
                <Text style={{ fontSize: 17, color: '#222', fontWeight: 'bold' }}>Total to Pay</Text>
                <Text style={{ fontSize: 17, color: '#222', fontWeight: 'bold' }}>RM{totalToPay.toFixed(2)}</Text>
              </View>
            </View>
            {/* Place Order Button */}
            <TouchableOpacity style={{ backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 8 }} onPress={handleSplitConfirm}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Place Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', marginTop: 4 }} onPress={() => setShowCartModal(false)}>
              <Text style={{ color: '#888', fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Floating Proceed Button */}
      <TouchableOpacity
        style={[styles.fab, selectedItems.length === 0 && { backgroundColor: '#ccc' }]}
        onPress={() => setShowCartModal(true)}
        disabled={selectedItems.length === 0}
      >
        <Ionicons name="cart" size={28} color="#fff" />
        {selectedItems.length > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{selectedItems.length}</Text>
          </View>
        )}
        <Text style={styles.fabText}>Proceed to Payment</Text>
        <Text style={styles.fabTotal}>RM {totalToPay.toFixed(2)}</Text>
      </TouchableOpacity>
      {/* Cart Modal/Bottom Sheet UI (inspired by Grab, no delivery sections) */}
      <Modal visible={showCartModal} animationType="slide" transparent onRequestClose={() => setShowCartModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: 480 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#eee', borderRadius: 2, marginBottom: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>Your Order</Text>
            </View>
            {/* Payment Success Message */}
            {paymentSuccessMessage && (
              <View style={{ backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#10b981', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#065f46', fontSize: 14, fontWeight: '600', flex: 1 }}>
                    {paymentSuccessMessage}
                  </Text>
                  <TouchableOpacity onPress={() => setPaymentSuccessMessage(null)}>
                    <Ionicons name="close" size={18} color="#10b981" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* Split Payment Controls */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setSplitMode('full')} style={{ backgroundColor: splitMode === 'full' ? '#22c55e' : '#eee', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginHorizontal: 4 }}>
                <Text style={{ color: splitMode === 'full' ? 'white' : '#222', fontWeight: 'bold' }}>Pay All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSplitMode('percent')} style={{ backgroundColor: splitMode === 'percent' ? '#22c55e' : '#eee', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginHorizontal: 4 }}>
                <Text style={{ color: splitMode === 'percent' ? 'white' : '#222', fontWeight: 'bold' }}>Split %</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSplitMode('items')} style={{ backgroundColor: splitMode === 'items' ? '#22c55e' : '#eee', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginHorizontal: 4 }}>
                <Text style={{ color: splitMode === 'items' ? 'white' : '#222', fontWeight: 'bold' }}>Pay Items</Text>
              </TouchableOpacity>
            </View>
            {/* Split Mode Inputs */}
            {splitMode === 'percent' && (
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 15, color: '#222', marginBottom: 4 }}>Pay {percent}% of total</Text>
                <Slider
                  style={{ width: 220, height: 40 }}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  value={percent}
                  onValueChange={setPercent}
                  minimumTrackTintColor="#22c55e"
                  maximumTrackTintColor="#eee"
                  thumbTintColor="#22c55e"
                />
                <Text style={{ fontSize: 13, color: '#888' }}>Use the slider to select your share</Text>
              </View>
            )}
            <ScrollView style={{ maxHeight: 180 }}>
              {cartItems.length === 0 ? (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>Your cart is empty.</Text>
              ) : (
                cartItems.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: splitMode === 'items' && selectedForSplit.includes(idx) ? '#e6f9f0' : 'transparent', borderRadius: 8 }}>
                    <Image source={imageMap[item.name.en.toLowerCase()] || require('../../assets/default.jpg')} style={{ width: 56, height: 56, borderRadius: 8, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name.en}</Text>
                      {item.note ? <Text style={{ color: '#888', fontSize: 13 }}>Note: {item.note}</Text> : null}
                      {item.addOns && item.addOns.length > 0 && (
                        <Text style={{ color: '#888', fontSize: 13 }}>Add-ons: {item.addOns.map(a => a.name?.en || a.name).join(', ')}</Text>
                      )}
                      <Text style={{ color: '#888', fontSize: 13 }}>Qty: {item.qty}</Text>
                    </View>
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#222', marginRight: 8 }}>RM{((item.price + (item.addOns?.reduce((a, b) => a + (b.price || 0), 0) || 0)) * (item.qty || 1)).toFixed(2)}</Text>
                    {splitMode === 'items' && (
                      <TouchableOpacity onPress={() => handleToggleSplitItem(idx)} style={{ padding: 4 }}>
                        <Ionicons name={selectedForSplit.includes(idx) ? 'checkbox' : 'square-outline'} size={24} color={selectedForSplit.includes(idx) ? '#22c55e' : '#bbb'} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            {/* Promo code section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
              <Ionicons name="pricetag" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
              <TextInput placeholder="Enter promo code" style={{ flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, fontSize: 15 }} />
              <TouchableOpacity style={{ marginLeft: 8, backgroundColor: '#fbbf24', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Apply</Text>
              </TouchableOpacity>
            </View>
            {/* Subtotal, Taxes, and Total */}
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: '#666' }}>Subtotal</Text>
                <Text style={{ fontSize: 15, color: '#222', fontWeight: '600' }}>RM{subtotal.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: '#666' }}>SST (6%)</Text>
                <Text style={{ fontSize: 15, color: '#222', fontWeight: '600' }}>RM{sst.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, color: '#666' }}>Service Charge (10%)</Text>
                <Text style={{ fontSize: 15, color: '#222', fontWeight: '600' }}>RM{serviceCharge.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 18 }}>
                <Text style={{ fontSize: 17, color: '#222', fontWeight: 'bold' }}>Total to Pay</Text>
                <Text style={{ fontSize: 17, color: '#222', fontWeight: 'bold' }}>RM{totalToPay.toFixed(2)}</Text>
              </View>
            </View>
            {/* Place Order Button */}
            <TouchableOpacity style={{ backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 8 }} onPress={handleSplitConfirm}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Place Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', marginTop: 4 }} onPress={() => setShowCartModal(false)}>
              <Text style={{ color: '#888', fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 56, android: 36, default: 40 }),
    minHeight: Platform.select({ ios: 88, android: 68, default: 72 }),
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 80, // Increased height
  },
  appBarContent: {
    flex: 1,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appBarDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 8,
  },
  menuList: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  sectionDesc: {
    color: '#757575',
    fontWeight: '500',
    marginBottom: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  menuImg: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  menuTag: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  menuName: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 2,
    color: '#222',
  },
  menuDesc: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 8,
  },
  menuPrice: {
    fontWeight: '800',
    fontSize: 18,
    color: Colors.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  removeButton: {
    marginTop: 2,
  },
  itemCount: {
    marginTop: 2,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 22,
    elevation: 4,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
  },
  fabTotal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 16,
  },
  fabBadge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  fabBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    paddingHorizontal: 4,
  },
}); 