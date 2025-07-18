import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const paymentGatewaysData = [
  {
    id: 'ipay88',
    name: 'iPay88',
    initial: 'I',
    color: Colors.error, // red
    description: 'Dominant local player, ideal for Malaysian e-commerce and retail with broad e-wallet support.',
    methods: ['Cards', 'FPX', 'E-Wallets', 'DuitNow QR'],
    strengths: ['Local Focus', 'E-wallets', 'Reliable']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    initial: 'S',
    color: Colors.primaryDark, // indigo
    description: 'Global leader with strong international card processing and growing local method support.',
    methods: ['International Cards', 'FPX', 'GrabPay', 'Google Pay', 'Apple Pay'],
    strengths: ['Global Reach', 'Developer Friendly', 'Advanced Features']
  },
  {
    id: 'razerms',
    name: 'Razer Merchant Services',
    initial: 'R',
    color: Colors.success, // green
    description: 'Leading regional payment gateway with robust solutions for various business sizes, strong fraud detection.',
    methods: ['Cards', 'FPX', 'E-Wallets', 'DuitNow QR'],
    strengths: ['Regional Presence', 'Security', 'Scalable']
  },
  {
    id: 'billplz',
    name: 'Billplz',
    initial: 'B',
    color: Colors.warning, // orange
    description: 'Specializes in simple online invoicing and direct online banking (FPX) payments, cost-effective for local businesses.',
    methods: ['FPX (Online Banking)', 'Payment Links', 'E-Invoicing'],
    strengths: ['Cost-Effective', 'Simplicity', 'E-invoicing Focus']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    initial: 'P',
    color: Colors.primaryDark, // blue
    description: 'Globally recognized for secure cross-border transactions, ideal for international online sales.',
    methods: ['PayPal Balance', 'Linked Cards/Bank'],
    strengths: ['International Sales', 'Brand Recognition', 'Buyer Protection']
  }
];

function sortGateways(businessNeedsData) {
  if (!businessNeedsData) return paymentGatewaysData;
  const { customerOrigin } = businessNeedsData;
  if (customerOrigin && customerOrigin.includes('International')) {
    return [
      ...paymentGatewaysData.filter(g => g.id === 'stripe' || g.id === 'paypal'),
      ...paymentGatewaysData.filter(g => g.id !== 'stripe' && g.id !== 'paypal')
    ];
  }
  return paymentGatewaysData;
}

export default function RecommendedPaymentGatewaysStep({ onNext, businessNeedsData }) {
  const [selected, setSelected] = useState([]);
  const gateways = useMemo(() => sortGateways(businessNeedsData), [businessNeedsData]);

  const toggleGateway = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleProceed = () => {
    if (selected.length > 0) {
      onNext({ selectedPaymentGateways: selected });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Choose Your Payment Gateway(s)</Text>
          <Text style={styles.subHeader}>Based on your business needs, here are our top recommendations. Select all that apply:</Text>
          {gateways.map((gateway) => {
            const isSelected = selected.includes(gateway.id);
            return (
              <TouchableOpacity
                key={gateway.id}
                style={[styles.gatewayCard, isSelected && {
                  borderColor: Colors.primary,
                  borderWidth: 2,
                  shadowColor: Colors.primary,
                  shadowOpacity: 0.18,
                  shadowRadius: 12,
                  elevation: 4,
                }]}
                activeOpacity={0.85}
                onPress={() => toggleGateway(gateway.id)}
              >
                <View style={styles.gatewayRow}>
                  <View style={styles.gatewayLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: gateway.color }]}> 
                      <Text style={styles.iconInitial}>{gateway.initial}</Text>
                    </View>
                    <Text style={styles.gatewayName}>{gateway.name}</Text>
                  </View>
                </View>
                <Text style={styles.gatewayDescription}>{gateway.description}</Text>
                <View style={styles.methodsRow}>
                  <Text style={styles.methodsLabel}>Supports:</Text>
                  <View style={styles.methodsTagsRow}>
                    {gateway.methods.map((method) => (
                      <View key={method} style={styles.methodTag}>
                        <Text style={styles.methodTagText}>{method}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={styles.learnMoreBtn} onPress={() => {}}>
                  <Text style={styles.learnMoreText}>Learn More</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {/* Action Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.proceedBtn, selected.length === 0 && styles.proceedBtnDisabled]}
            disabled={selected.length === 0}
            onPress={handleProceed}
          >
            <Text style={styles.proceedBtnText}>Proceed to Application</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 32,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontWeight: '500',
  },
  gatewayCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gatewayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gatewayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconInitial: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  gatewayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  gatewayDescription: {
    color: Colors.text,
    fontSize: 14,
    marginBottom: 10,
    marginTop: 2,
  },
  methodsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  methodsLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginRight: 6,
    fontWeight: '600',
  },
  methodsTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  methodTag: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  methodTagText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  learnMoreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  proceedBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  proceedBtnDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  proceedBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 