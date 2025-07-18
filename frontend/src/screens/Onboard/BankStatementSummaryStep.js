import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

function BankStatementSummaryStep({ navigation }) {
  const route = useRoute();
  // Dummy extracted info
  const info = {
    bankName: 'Maybank',
    accountNumber: '1234567890',
    accountHolder: 'ABC Trading Sdn Bhd',
  };

  const handleComplete = () => {
    if (route.params?.onComplete) route.params.onComplete();
    navigation.pop(2);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Bank Statement Summary</Text>
      <Text style={styles.subtitle}>Here is the information extracted from your bank statement:</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Bank Name:</Text>
        <Text style={styles.infoValue}>{info.bankName}</Text>
        <Text style={styles.infoLabel}>Account Number:</Text>
        <Text style={styles.infoValue}>{info.accountNumber}</Text>
        <Text style={styles.infoLabel}>Account Holder:</Text>
        <Text style={styles.infoValue}>{info.accountHolder}</Text>
      </View>
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleComplete}>
          <Text style={styles.nextBtnText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : undefined,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : undefined,
  },
  infoBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 32,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BankStatementSummaryStep; 