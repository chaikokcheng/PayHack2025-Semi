import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Image, Dimensions, Platform, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const sampleMenu = [
  {
    id: 1,
    name: { en: 'Nasi Lemak', zh: '椰浆饭' },
    price: 12.0,
    desc: 'Classic Malaysian coconut rice with sambal, egg, peanuts, and anchovies.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: 'Most ordered',
  },
  {
    id: 2,
    name: { en: 'Teh Tarik', zh: '拉茶' },
    price: 3.5,
    desc: 'Frothy pulled milk tea, a Malaysian favorite.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: '',
  },
  {
    id: 3,
    name: { en: 'Roti Canai', zh: '印度煎饼' },
    price: 2.5,
    desc: 'Flaky flatbread served with dhal and curry.',
    img: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    tag: 'Recommended',
  },
  {
    id: 4,
    name: { en: 'Char Kway Teow', zh: '炒粿条' },
    price: 10.0,
    desc: 'Stir-fried flat rice noodles with prawns, egg, and bean sprouts.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: 'Spicy',
  },
  {
    id: 5,
    name: { en: 'Laksa', zh: '叻沙' },
    price: 11.0,
    desc: 'Spicy noodle soup with coconut milk, shrimp, and tofu.',
    img: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    tag: '',
  },
  {
    id: 6,
    name: { en: 'Chicken Rice', zh: '鸡饭' },
    price: 9.0,
    desc: 'Steamed chicken with fragrant rice and chili sauce.',
    img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    tag: 'Popular',
  },
  {
    id: 7,
    name: { en: 'Cendol', zh: '煎蕊' },
    price: 6.0,
    desc: 'Iced dessert with green rice flour jelly, coconut milk, and palm sugar.',
    img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    tag: 'Dessert',
  },
  {
    id: 8,
    name: { en: 'Milo Dinosaur', zh: '美禄恐龙' },
    price: 5.0,
    desc: 'Iced Milo drink topped with extra Milo powder.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: 'Drink',
  },
];

const { width } = Dimensions.get('window');

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
  const menu = route?.params?.menu?.length ? route.params.menu : sampleMenu;
  const merchantId = route?.params?.merchant_id || 'PAYHACK_MERCHANT_001';
  const description = route?.params?.description || 'Table Bill';
  const currency = route?.params?.currency || 'MYR';

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
    let amountToPay = payAmount;
    if (splitMode === 'items') {
      itemsToPay = selectedForSplit.map(idx => cartItems.find((_, i) => i === selectedItems.indexOf(idx)));
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
      },
    });
    setShowSplitModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* App Bar with Close Button, now with fixed height and top padding */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Merchant Menu</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.menuList}>
        <Text style={styles.sectionTitle}>🍽️ Set Meal</Text>
        <Text style={styles.sectionDesc}>Choose your meal below</Text>
        {menu.map((item, idx) => (
          <View key={item.id || idx} style={styles.card}>
            <Image source={{ uri: item.img }} style={styles.menuImg} />
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
            {splitMode === 'percent' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ marginRight: 10 }}>Percent:</Text>
                <TouchableOpacity onPress={() => setPercent(Math.max(1, percent - 10))} style={{ padding: 6 }}>
                  <Ionicons name="remove-circle-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginHorizontal: 8 }}>{percent}%</Text>
                <TouchableOpacity onPress={() => setPercent(Math.min(100, percent + 10))} style={{ padding: 6 }}>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={{ marginLeft: 10, color: '#666' }}>RM {(total * (percent / 100)).toFixed(2)}</Text>
              </View>
            )}
            {splitMode === 'items' && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>Select items to pay for:</Text>
                {cartItems.map((item, i) => (
                  <TouchableOpacity key={i} onPress={() => handleToggleSplitItem(selectedItems[i])} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name={selectedForSplit.includes(selectedItems[i]) ? 'checkbox' : 'square-outline'} size={20} color={Colors.primary} />
                    <Text style={{ marginLeft: 8 }}>{item.name?.en} (RM {(item.price + (item.addOns?.reduce((a, b) => a + (b.price || 0), 0) || 0)).toFixed(2)})</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginTop: 6 }}>To Pay: RM {payAmount.toFixed(2)}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <TouchableOpacity onPress={() => setShowSplitModal(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#666', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSplitConfirm}>
                <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: 'bold' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Floating Proceed Button */}
      <TouchableOpacity
        style={[styles.fab, payAmount === 0 && { backgroundColor: '#ccc' }]}
        onPress={handleProceed}
        disabled={payAmount === 0}
      >
        <Ionicons name="cart" size={28} color="#fff" />
        {selectedItems.length > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{selectedItems.length}</Text>
          </View>
        )}
        <Text style={styles.fabText}>Proceed to Payment</Text>
        <Text style={styles.fabTotal}>RM {payAmount.toFixed(2)}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 56, android: 36, default: 40 }),
    paddingBottom: 12,
    minHeight: Platform.select({ ios: 88, android: 68, default: 72 }),
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
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