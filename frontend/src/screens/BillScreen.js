import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BillScreen({ route, navigation }) {
  const { 
    merchantName, 
    table, 
    items, 
    subtotal, 
    sst, 
    serviceCharge, 
    total, 
    isPaid,
    transactionId,
    paymentMethod,
    paymentTime,
    cartContext
  } = route.params || {};

  const handleDone = () => {
    // If this was a successful payment and we have cart context, remove paid items
    if (isPaid && cartContext) {
      // Navigate back to the merchant menu and pass information about paid items
      navigation.navigate('MerchantMenuScreen', {
        paidItems: cartContext.items,
        splitMode: cartContext.splitMode,
        selectedItems: cartContext.selectedItems,
        selectedIndices: cartContext.selectedIndices,
        merchantId: cartContext.merchantId,
        shouldRemoveItems: true
      });
    } else {
      // For failed payments or no cart context, just go back
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Final Bill</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#E91E63" />
        </TouchableOpacity>
      </View>
      <View style={styles.merchantInfo}>
        <Text style={styles.merchantName}>{merchantName || 'Merchant'}</Text>
        {table && <Text style={styles.tableText}>Table: {table}</Text>}
      </View>
      <ScrollView style={{ flex: 1, marginHorizontal: 20 }}>
        <Text style={styles.sectionTitle}>Items</Text>
        {items && items.length > 0 ? items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name?.en || item.name}</Text>
            <Text style={styles.itemPrice}>RM{((item.price || 0) * (item.qty || 1)).toFixed(2)}</Text>
          </View>
        )) : <Text style={{ color: '#888', marginVertical: 12 }}>No items</Text>}
        <View style={styles.line} />
        <View style={styles.summaryRow}><Text>Subtotal</Text><Text>RM{subtotal?.toFixed(2) || '0.00'}</Text></View>
        <View style={styles.summaryRow}><Text>SST (6%)</Text><Text>RM{sst?.toFixed(2) || '0.00'}</Text></View>
        <View style={styles.summaryRow}><Text>Service Charge (10%)</Text><Text>RM{serviceCharge?.toFixed(2) || '0.00'}</Text></View>
        <View style={styles.summaryRowTotal}><Text style={{ fontWeight: 'bold' }}>Total</Text><Text style={{ fontWeight: 'bold' }}>RM{total?.toFixed(2) || '0.00'}</Text></View>
        
        {/* Payment Details */}
        {isPaid && (
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentDetailsTitle}>Payment Details</Text>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Transaction ID:</Text>
              <Text style={styles.paymentDetailValue}>{transactionId || 'N/A'}</Text>
            </View>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Payment Method:</Text>
              <Text style={styles.paymentDetailValue}>{paymentMethod || 'N/A'}</Text>
            </View>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Payment Time:</Text>
              <Text style={styles.paymentDetailValue}>{paymentTime || 'N/A'}</Text>
            </View>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Status:</Text>
              <Text style={[styles.paymentDetailValue, { color: '#22c55e', fontWeight: 'bold' }]}>PAID</Text>
            </View>
          </View>
        )}
        
        {isPaid && <Text style={styles.paidText}>Bill Fully Paid</Text>}
      </ScrollView>
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  closeButton: {
    padding: 8,
  },
  merchantInfo: {
    alignItems: 'center',
    marginVertical: 16,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  tableText: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    color: '#333',
  },
  itemPrice: {
    fontSize: 15,
    color: '#333',
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    fontSize: 15,
    color: '#666',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    fontSize: 17,
    color: '#222',
  },
  paidText: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  doneButton: {
    backgroundColor: '#E91E63',
    margin: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentDetails: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  paymentDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  paymentDetailLabel: {
    fontSize: 15,
    color: '#666',
  },
  paymentDetailValue: {
    fontSize: 15,
    color: '#333',
  },
}); 