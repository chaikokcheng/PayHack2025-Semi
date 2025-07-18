import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/Colors';

function PhoneNumberStep({ onNext }) {
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);

  // Only allow numbers
  const handleChange = (text) => {
    setPhone(text.replace(/[^0-9]/g, ''));
    if (!touched) setTouched(true);
  };

  // Validation: min 9 digits
  const isValid = phone.length >= 9;
  const showError = touched && !isValid && phone.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={32}
      >
        <View style={styles.flexGrow}>
          <Text style={styles.header}>Welcome to SatuPay!</Text>
          <Text style={styles.subHeader}>The fastest way for your business to accept digital payments.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+60</Text>
              </View>
              <TextInput
                style={[styles.input, showError && styles.inputError]}
                placeholder="e.g., 123456789"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={handleChange}
                maxLength={11}
                onBlur={() => setTouched(true)}
                returnKeyType="done"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            {showError && (
              <Text style={styles.errorText}>Please enter a valid phone number (min 9 digits).</Text>
            )}
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.link} onPress={() => console.log('Terms of Service')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.link} onPress={() => console.log('Privacy Policy')}>Privacy Policy</Text>.
          </Text>

          <TouchableOpacity onPress={() => console.log('Log In')} style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginTextBold}>Log In</Text></Text>
          </TouchableOpacity>
        </View>
        {/* Sticky bottom button */}
        <View style={styles.buttonStickyContainer}>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={() => isValid && onNext({ phoneNumber: phone })}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Send OTP</Text>
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
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    // textAlign: 'center',
  },
  subHeader: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
    // textAlign: 'center',
    fontWeight: '500',
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 0,
  },
  prefixBox: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  inputError: {
    color: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
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
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    // textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 8,
    // alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.text,
  },
  loginTextBold: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default PhoneNumberStep; 