import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Switch, ScrollView, TextInput } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const BUSINESS_TYPES = [
  'Online Store / E-commerce',
  'Physical Retail / Shop',
  'Service Provider',
  'F&B (Food & Beverage)',
  'Others',
];
const CUSTOMER_ORIGINS = [
  'Mostly Local (within Malaysia)',
  'Mix of Local & International',
  'Mostly International (Overseas)',
];
const CURRENCIES = ['USD', 'SGD', 'EUR', 'AUD', 'GBP', 'THB', 'IDR'];
const TRANSACTION_VOLUMES = [
  'Below 100',
  '100-500',
  '501-2000',
  '2001-5000',
  'Above 5000',
];

function BusinessNeedsStep({ onNext, onBack }) {
  const [businessType, setBusinessType] = useState('');
  const [otherBusiness, setOtherBusiness] = useState('');
  const [customerOrigin, setCustomerOrigin] = useState('');
  const [acceptsForeignCurrency, setAcceptsForeignCurrency] = useState(false);
  const [preferredCurrencies, setPreferredCurrencies] = useState([]);
  const [transactionVolume, setTransactionVolume] = useState('');
  const [requiresEInvoicing, setRequiresEInvoicing] = useState(false);
  const [touched, setTouched] = useState({});

  // Validation
  const isValid = businessType && customerOrigin && transactionVolume;

  const handleNext = () => {
    if (isValid) {
      onNext({
        businessType: businessType === 'Others' ? otherBusiness : businessType,
        customerOrigin,
        acceptsForeignCurrency,
        preferredCurrencies: acceptsForeignCurrency ? preferredCurrencies : [],
        transactionVolume,
        requiresEInvoicing,
      });
    }
  };

  const handleCurrencyToggle = (currency) => {
    setPreferredCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((c) => c !== currency)
        : [...prev, currency]
    );
  };

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={32}
      >
        <ScrollView contentContainerStyle={styles.flexGrow} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>Tell Us About Your Business</Text>
          <Text style={styles.subHeader}>Help us recommend the best payment solutions for you.</Text>

          {/* Business Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>What type of business do you primarily operate?</Text>
            {BUSINESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioRow}
                onPress={() => setBusinessType(type)}
              >
                <Ionicons
                  name={businessType === type ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={businessType === type ? Colors.primary : Colors.textLight}
                />
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
            {businessType === 'Others' && (
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Please specify"
                value={otherBusiness}
                onChangeText={setOtherBusiness}
                onBlur={() => handleBlur('otherBusiness')}
                placeholderTextColor={Colors.textLight}
              />
            )}
            {touched.businessType && !businessType && (
              <Text style={styles.errorText}>Please select a business type.</Text>
            )}
          </View>

          {/* Customer Origin */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Where do most of your customers come from?</Text>
            {CUSTOMER_ORIGINS.map((origin) => (
              <TouchableOpacity
                key={origin}
                style={styles.radioRow}
                onPress={() => setCustomerOrigin(origin)}
              >
                <Ionicons
                  name={customerOrigin === origin ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={customerOrigin === origin ? Colors.primary : Colors.textLight}
                />
                <Text style={styles.radioLabel}>{origin}</Text>
              </TouchableOpacity>
            ))}
            {touched.customerOrigin && !customerOrigin && (
              <Text style={styles.errorText}>Please select a customer origin.</Text>
            )}
          </View>

          {/* Foreign Currency Toggle */}
          {(customerOrigin === 'Mix of Local & International' || customerOrigin === 'Mostly International (Overseas)') && (
            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Do you plan to accept payments from customers using foreign currencies?</Text>
                <Switch
                  value={acceptsForeignCurrency}
                  onValueChange={setAcceptsForeignCurrency}
                  trackColor={{ false: Colors.divider, true: Colors.primaryLight }}
                  thumbColor={acceptsForeignCurrency ? Colors.primary : Colors.surface}
                />
              </View>
              {acceptsForeignCurrency && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Which currencies are most important to you? (Select all that apply)</Text>
                  <View style={styles.currencyGrid}>
                    {CURRENCIES.map((currency) => (
                      <TouchableOpacity
                        key={currency}
                        style={[styles.currencyPill, preferredCurrencies.includes(currency) && styles.currencyPillSelected]}
                        onPress={() => handleCurrencyToggle(currency)}
                      >
                        <Text style={[styles.currencyPillText, preferredCurrencies.includes(currency) && styles.currencyPillTextSelected]}>{currency}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Transaction Volume */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>What is your estimated monthly transaction volume?</Text>
            <View style={styles.dropdownContainer}>
              {TRANSACTION_VOLUMES.map((vol) => (
                <TouchableOpacity
                  key={vol}
                  style={[styles.dropdownItem, transactionVolume === vol && styles.dropdownItemSelected]}
                  onPress={() => setTransactionVolume(vol)}
                >
                  <Text style={[styles.dropdownItemText, transactionVolume === vol && styles.dropdownItemTextSelected]}>{vol}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {touched.transactionVolume && !transactionVolume && (
              <Text style={styles.errorText}>Please select a transaction volume.</Text>
            )}
          </View>

          {/* E-invoicing Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Do you require an e-invoicing solution?</Text>
              <TouchableOpacity onPress={() => setRequiresEInvoicing(v => !v)} style={styles.checkboxIcon}>
                <Ionicons
                  name={requiresEInvoicing ? 'checkbox' : 'checkbox-outline'}
                  size={22}
                  color={requiresEInvoicing ? Colors.primary : Colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {/* Sticky bottom button */}
        <View style={styles.buttonStickyContainer}>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Next: Upload Documents</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  subHeader: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: 'Inter',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 15,
    color: Colors.text,
    marginLeft: 10,
    fontFamily: 'Inter',
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    fontFamily: 'Inter',
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: 'Inter',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  currencyPill: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  currencyPillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  currencyPillText: {
    color: Colors.text,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  currencyPillTextSelected: {
    color: Colors.primaryDark,
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dropdownItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  dropdownItemText: {
    color: Colors.text,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  dropdownItemTextSelected: {
    color: Colors.primaryDark,
  },
  buttonStickyContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'Inter',
  },
  checkboxIcon: {
    marginLeft: 8,
    padding: 2,
  },
});

export default BusinessNeedsStep; 