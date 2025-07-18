import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';

const tabList = [
  { key: 'E-Invoicing', label: 'E-Invoicing' },
  { key: 'TaxFiling', label: 'Taxation' },
];

export default function MerchantTaxScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('E-Invoicing');

  // Collapsible state
  const [showForm, setShowForm] = useState(true);
  const [showSafeKeep, setShowSafeKeep] = useState(false);

  // Add state for tax filing form collapse
  const [showTaxForm, setShowTaxForm] = useState(true);

  // E-Invoicing form state
  const [invoiceNo] = useState('INV-' + Math.floor(Math.random() * 1000000));
  // Mock order numbers for dropdown
  const [orderNumbers] = useState(['ORD-1001', 'ORD-1002', 'ORD-1003']);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState(
    orderNumbers.map(order => ({ label: order, value: order }))
  );
  // Mock data for each order
  const mockOrderData = {
    'ORD-1001': {
      date: '2025-07-17',
      buyerName: 'Alice Tan',
      buyerTaxId: 'TAX-001',
      items: [
        { name: 'Nasi Lemak', qty: 2, price: '5.00', sst: '0.60' },
        { name: 'Teh Tarik', qty: 1, price: '2.50', sst: '0.15' },
      ],
      paymentMethod: 'Cash',
      notes: 'Thank you for your order!'
    },
    'ORD-1002': {
      date: '2025-07-18',
      buyerName: 'John Lee',
      buyerTaxId: 'TAX-002',
      items: [
        { name: 'Roti Canai', qty: 3, price: '2.00', sst: '0.18' },
      ],
      paymentMethod: 'Card',
      notes: 'Paid by card.'
    },
    'ORD-1003': {
      date: '2025-07-19',
      buyerName: 'Siti Rahman',
      buyerTaxId: 'TAX-003',
      items: [
        { name: 'Laksa', qty: 1, price: '7.00', sst: '0.42' },
        { name: 'Milo Dinosaur', qty: 2, price: '4.00', sst: '0.24' },
      ],
      paymentMethod: 'eWallet',
      notes: 'Promo applied.'
    },
  };
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sellerName] = useState('My Business Sdn Bhd');
  const [sellerTaxId] = useState('1234567890');
  const [buyerName, setBuyerName] = useState('');
  const [buyerTaxId, setBuyerTaxId] = useState('');
  const [items, setItems] = useState([
    { name: '', qty: 1, price: '', sst: '' }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  // E-Invoice Safe Keeping state
  const [savedEinvoices, setSavedEinvoices] = useState([
    { id: 'SUP-INV-1001', supplier: 'ABC Supplies Sdn Bhd', date: '2024-06-01', amount: 1200.00 },
    { id: 'SUP-INV-1002', supplier: 'XYZ Trading', date: '2024-06-03', amount: 850.50 },
  ]);

  // Tax Filing form state
  const [bizRegNo] = useState('201901234567');
  // Mock data for auto-generated tax filing
  const [taxType] = useState('SST');
  const [period] = useState('2024-Q2');
  const [totalSales] = useState('18,500.00');
  const [totalExpenses] = useState('7,200.00');
  const [sstCollected] = useState('1,110.00');
  const [sstPaid] = useState('950.00');
  const [supportingDocs] = useState([]);

  // Add state for records collapse
  const [showRecords, setShowRecords] = useState(true);

  // Add state for issued e-invoices
  const [showIssued, setShowIssued] = useState(false);
  const [issuedEinvoices] = useState([
    { id: 'INV-1001', customer: 'Alice Tan', date: '2025-07-17', amount: 15.50 },
    { id: 'INV-1002', customer: 'John Lee', date: '2025-07-18', amount: 13.00 },
    { id: 'INV-1003', customer: 'Siti Rahman', date: '2025-07-19', amount: 12.00 },
  ]);

  // Net Tax Payable calculation
  const netTaxPayable = (() => {
    const collected = parseFloat(sstCollected.replace(/,/g, '')) || 0;
    const paid = parseFloat(sstPaid.replace(/,/g, '')) || 0;
    return collected - paid;
  })();

  const handleItemChange = (idx, field, value) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addItem = () => setItems([...items, { name: '', qty: 1, price: '', sst: '' }]);
  const removeItem = idx => setItems(items => items.filter((_, i) => i !== idx));

  const calcSubtotal = (item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.qty) || 0;
    const sst = parseFloat(item.sst) || 0;
    return (price * qty) + sst;
  };
  const total = items.reduce((sum, item) => sum + calcSubtotal(item), 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={28} color="#6366F1" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>E-Invoicing & Taxation</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.tabBar}>
        {tabList.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {activeTab === 'E-Invoicing' && (
          <>
            <View style={styles.sectionCard}>
              {/* Collapsible E-Invoicing Form Section */}
              <TouchableOpacity style={styles.collapseHeader} onPress={() => setShowForm(v => !v)}>
                <Text style={styles.sectionTitle}>E-Invoicing</Text>
                <Ionicons name={showForm ? 'chevron-up' : 'chevron-down'} size={22} color="#6366F1" />
              </TouchableOpacity>
              {showForm && (
                <>
                  <Text style={styles.sectionDesc}>Generate, manage, and send digital invoices to your customers. Integrate with your sales and payment data for seamless invoicing.</Text>
                  {/* E-Invoicing Form */}
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Invoice No</Text>
                    <Text style={styles.formValue}>{invoiceNo}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Order Number</Text>
                    <View style={{ flex: 1 }}>
                      <DropDownPicker
                        open={open}
                        value={selectedOrder}
                        items={orderItems}
                        setOpen={setOpen}
                        setValue={setSelectedOrder}
                        setItems={setOrderItems}
                        placeholder="Please select an order..."
                        style={[
                          styles.input,
                          {
                            borderWidth: 0,
                            height: 40,
                            minHeight: 40,
                            maxHeight: 40,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            fontSize: 15,
                            backgroundColor: '#F3F4F6',
                            width: '100%',
                          },
                        ]}
                        containerStyle={{ height: 40, minHeight: 40, maxHeight: 40, flex: 1, width: '100%', margin: 0, padding: 0 }}
                        dropDownContainerStyle={{ zIndex: 1000 }}
                        listMode="SCROLLVIEW"
                        onChangeValue={val => {
                          const data = mockOrderData[val];
                          if (data) {
                            setDate(data.date);
                            setBuyerName(data.buyerName);
                            setBuyerTaxId(data.buyerTaxId);
                            setItems(data.items);
                            setPaymentMethod(data.paymentMethod);
                            setNotes(data.notes);
                          }
                        }}
                      />
                    </View>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Date</Text>
                    <TextInput style={[styles.input, { width: '100%' }]} value={date} onChangeText={setDate} />
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Seller Name</Text>
                    <Text style={styles.formValue}>{sellerName}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Seller Tax ID</Text>
                    <Text style={styles.formValue}>{sellerTaxId}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Buyer Name</Text>
                    <TextInput style={styles.input} value={buyerName} onChangeText={setBuyerName} placeholder="Enter buyer name" />
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Buyer Tax ID</Text>
                    <TextInput style={styles.input} value={buyerTaxId} onChangeText={setBuyerTaxId} placeholder="Enter buyer tax ID" />
                  </View>
                  <Text style={[styles.formLabel, { marginTop: 16 }]}>Items</Text>
                  {items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <TextInput style={[styles.input, { flex: 2 }]} value={item.name} onChangeText={v => handleItemChange(idx, 'name', v)} placeholder="Item name" />
                      <TextInput style={[styles.input, { flex: 1 }]} value={String(item.qty)} onChangeText={v => handleItemChange(idx, 'qty', v.replace(/\D/g, ''))} placeholder="Qty" keyboardType="numeric" />
                      <TextInput style={[styles.input, { flex: 1 }]} value={item.price} onChangeText={v => handleItemChange(idx, 'price', v.replace(/[^\d.]/g, ''))} placeholder="Price" keyboardType="numeric" />
                      <TextInput style={[styles.input, { flex: 1 }]} value={item.sst} onChangeText={v => handleItemChange(idx, 'sst', v.replace(/[^\d.]/g, ''))} placeholder="SST" keyboardType="numeric" />
                      <TouchableOpacity onPress={() => removeItem(idx)} style={{ marginLeft: 8 }}>
                        <Ionicons name="remove-circle-outline" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity onPress={addItem} style={styles.addItemBtn}>
                    <Ionicons name="add-circle-outline" size={22} color="#10B981" />
                    <Text style={{ color: '#10B981', fontWeight: '700', marginLeft: 4 }}>Add Item</Text>
                  </TouchableOpacity>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Total</Text>
                    <Text style={styles.formValue}>RM {total.toFixed(2)}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Payment Method</Text>
                    <TextInput style={styles.input} value={paymentMethod} onChangeText={setPaymentMethod} placeholder="e.g. Cash, Card, eWallet" />
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Notes</Text>
                    <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Optional notes" />
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => alert('Send Invoice (integration coming soon)')}>
                      <Ionicons name="send-outline" size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>Send Invoice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6366F1' }]} onPress={() => alert('Download PDF (integration coming soon)')}>
                      <Ionicons name="download-outline" size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            {/* Issued E-Invoices Section */}
            <View style={styles.sectionCard}>
              <TouchableOpacity style={styles.collapseHeader} onPress={() => setShowIssued(v => !v)}>
                <Text style={styles.sectionTitle}>Issued E-Invoices</Text>
                <Ionicons name={showIssued ? 'chevron-up' : 'chevron-down'} size={22} color="#6366F1" />
              </TouchableOpacity>
              {showIssued && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.sectionDesc}>View all e-invoices you have issued to customers.</Text>
                  <View style={{ marginTop: 12 }}>
                    {issuedEinvoices.map((inv, idx) => (
                      <View key={idx} style={styles.safeKeepRow}>
                        <Ionicons name="document-text-outline" size={20} color="#10B981" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '700', color: '#222' }}>{inv.id}</Text>
                          <Text style={{ color: '#6B7280', fontSize: 13 }}>{inv.customer} • {inv.date}</Text>
                        </View>
                        <Text style={{ color: '#6366F1', fontWeight: '700' }}>RM {inv.amount.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            <View style={styles.sectionCard}>
              {/* Collapsible E-Invoice Safe Keeping Section */}
              <TouchableOpacity style={styles.collapseHeader} onPress={() => setShowSafeKeep(v => !v)}>
                <Text style={styles.sectionTitle}>Supplier E-Invoices</Text>
                <Ionicons name={showSafeKeep ? 'chevron-up' : 'chevron-down'} size={22} color="#6366F1" />
              </TouchableOpacity>
              {showSafeKeep && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.sectionDesc}>Request, upload, and store supplier e-invoices for your records. Useful for merchants acting as buyers.</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => alert('Request/Upload E-Invoice (integration coming soon)')}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnText}>Request/Upload E-Invoice</Text>
                  </TouchableOpacity>
                  <View style={{ marginTop: 12 }}>
                    {savedEinvoices.map((inv, idx) => (
                      <View key={idx} style={styles.safeKeepRow}>
                        <Ionicons name="document-text-outline" size={20} color="#6366F1" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '700', color: '#222' }}>{inv.id}</Text>
                          <Text style={{ color: '#6B7280', fontSize: 13 }}>{inv.supplier} • {inv.date}</Text>
                        </View>
                        <Text style={{ color: '#10B981', fontWeight: '700' }}>RM {inv.amount.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </>
        )}
        {activeTab === 'TaxFiling' && (
          <>
            <View style={styles.sectionCard}>
              <TouchableOpacity style={styles.collapseHeader} onPress={() => setShowTaxForm(v => !v)}>
                <Text style={styles.sectionTitle}>Tax Filing</Text>
                <Ionicons name={showTaxForm ? 'chevron-up' : 'chevron-down'} size={22} color="#6366F1" />
              </TouchableOpacity>
              {showTaxForm && (
                <>
                  <Text style={styles.sectionDesc}>Prepare and review your business tax filings. Auto-calculate based on your sales, expenses, and local tax rules.</Text>
                  {/* Tax Filing Form */}
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Business Reg. No</Text>
                    <Text style={styles.formValue}>{bizRegNo}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Tax Type</Text>
                    <Text style={styles.formValue}>{taxType}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Period</Text>
                    <Text style={styles.formValue}>{period}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Total Sales</Text>
                    <Text style={styles.formValue}>RM {totalSales}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Total Expenses</Text>
                    <Text style={styles.formValue}>RM {totalExpenses}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>SST/GST Collected</Text>
                    <Text style={styles.formValue}>RM {sstCollected}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>SST/GST Paid</Text>
                    <Text style={styles.formValue}>RM {sstPaid}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Net Tax Payable</Text>
                    <Text style={styles.formValue}>RM {netTaxPayable.toFixed(2)}</Text>
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Supporting Docs</Text>
                  </View>
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => alert('Upload (integration coming soon)')}>
                    <Ionicons name="cloud-upload-outline" size={22} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.uploadBtnText}>Upload Supporting Docs</Text>
                  </TouchableOpacity>
                  <View style={styles.actionSectionDivider} />
                  <View style={styles.actionBtnColModern}>
                    <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => alert('Preview Filing (integration coming soon)')}>
                      <Ionicons name="eye-outline" size={20} color="#10B981" style={{ marginRight: 10 }} />
                      <Text style={styles.secondaryActionBtnText}>Preview Filing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => alert('Export CSV (integration coming soon)')}>
                      <Ionicons name="download-outline" size={20} color="#6366F1" style={{ marginRight: 10 }} />
                      <Text style={[styles.secondaryActionBtnText, { color: '#6366F1' }]}>Export CSV</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryActionBtn} onPress={() => alert('Submit (integration coming soon)')}>
                      <Ionicons name="send-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                      <Text style={styles.primaryActionBtnText}>Submit Filing</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            <View style={styles.sectionCard}>
              <TouchableOpacity style={styles.collapseHeader} onPress={() => setShowRecords(v => !v)}>
                <Text style={styles.recordsTitle}>Tax Filing Records</Text>
                <Ionicons name={showRecords ? 'chevron-up' : 'chevron-down'} size={22} color="#6366F1" />
              </TouchableOpacity>
              {showRecords && (
                <View style={styles.recordsSection}>
                  {[ // mock data
                    { period: '2024-Q2', type: 'SST', amount: 1200.00, status: 'Submitted', date: '2024-07-01' },
                    { period: '2024-Q1', type: 'SST', amount: 950.50, status: 'Submitted', date: '2024-04-01' },
                    { period: '2023-Q4', type: 'GST', amount: 800.00, status: 'Failed', date: '2024-01-05' },
                    { period: '2023-Q3', type: 'SST', amount: 1100.00, status: 'Pending', date: '2023-10-01' },
                  ].map((rec, idx) => (
                    <View key={idx} style={styles.recordRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recordPeriod}>{rec.period} ({rec.type})</Text>
                        <Text style={styles.recordDate}>{rec.date}</Text>
                      </View>
                      <Text style={styles.recordAmount}>RM {rec.amount.toFixed(2)}</Text>
                      <View style={[styles.statusBadge, rec.status === 'Submitted' ? styles.statusSubmitted : rec.status === 'Pending' ? styles.statusPending : styles.statusFailed]}>
                        <Text style={styles.statusBadgeText}>{rec.status}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  closeButton: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#6366F1',
    backgroundColor: '#fff',
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  placeholderBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontStyle: 'italic',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    width: 120,
  },
  formValue: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '700',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: '#222',
    marginLeft: 8,
    borderWidth: 0, // Added for DropDownPicker
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 6,
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 4,
  },
  safeKeepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  actionBtnCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
    justifyContent: 'center',
    width: '100%',
  },
  uploadBtnText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 16,
  },
  actionSectionDivider: {
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 18,
    marginTop: 2,
  },
  actionBtnColModern: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    gap: 12,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 0,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryActionBtnText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 4,
  },
  primaryActionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  recordsSection: {
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  recordsTitle: {
    fontSize: 18, // match sectionTitle
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recordPeriod: {
    fontWeight: '600',
    color: '#222',
    fontSize: 15, // match formLabel
  },
  recordDate: {
    color: '#6B7280',
    fontSize: 13,
  },
  recordAmount: {
    fontWeight: '700',
    color: '#6366F1',
    fontSize: 15, // match formValue
    marginHorizontal: 10,
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  statusSubmitted: {
    backgroundColor: '#10B981',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusFailed: {
    backgroundColor: '#EF4444',
  },
  pickerContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    marginTop: 2,
    marginBottom: 2,
  },
}); 