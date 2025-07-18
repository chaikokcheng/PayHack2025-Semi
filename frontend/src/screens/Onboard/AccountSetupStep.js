import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Switch } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

function AccountSetupStep({ onNext, onBack }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreePromo, setAgreePromo] = useState(false);
  const [touched, setTouched] = useState({});

  // Validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isUsernameValid = username.length >= 3;
  const passwordStrength =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  const isPasswordMatch = password === confirmPassword && password.length > 0;

  const isValid = isEmailValid && isUsernameValid && passwordStrength && isPasswordMatch;

  const handleNext = () => {
    if (isValid) {
      onNext({ email, username, password, agreePromo });
    }
  };

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={32}
      >
        <View style={styles.flexGrow}>
          <Text style={styles.header}>Create Your Account</Text>
          <Text style={styles.subHeader}>This will be your login for SatuPay.</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.input, touched.email && !isEmailValid && styles.inputError]}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onBlur={() => handleBlur('email')}
              placeholderTextColor={Colors.textLight}
              returnKeyType="next"
            />
            {touched.email && !isEmailValid && (
              <Text style={styles.errorText}>Please enter a valid email address.</Text>
            )}
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Create Username</Text>
            <TextInput
              style={[styles.input, touched.username && !isUsernameValid && styles.inputError]}
              placeholder="Choose a unique username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              onBlur={() => handleBlur('username')}
              placeholderTextColor={Colors.textLight}
              returnKeyType="next"
            />
            {touched.username && !isUsernameValid && (
              <Text style={styles.errorText}>Username must be at least 3 characters.</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Create Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.inputPassword, touched.password && !passwordStrength && styles.inputError]}
                placeholder="Password"
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onBlur={() => handleBlur('password')}
                placeholderTextColor={Colors.textLight}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
            {touched.password && !passwordStrength && (
              <Text style={styles.errorText}>
                Password must be at least 8 characters, include upper & lower case, a number, and a symbol.
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.inputPassword, touched.confirmPassword && !isPasswordMatch && styles.inputError]}
                placeholder="Re-enter password"
                autoCapitalize="none"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => handleBlur('confirmPassword')}
                placeholderTextColor={Colors.textLight}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} style={styles.eyeButton}>
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && !isPasswordMatch && (
              <Text style={styles.errorText}>Passwords do not match.</Text>
            )}
          </View>

          {/* Promo Checkbox */}
          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => setAgreePromo(v => !v)} style={styles.checkboxIcon}>
              <Ionicons
                name={agreePromo ? 'checkbox' : 'checkbox-outline'}
                size={22}
                color={agreePromo ? Colors.primary : Colors.textLight}
              />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I agree to receive updates and promotional offers from SatuPay.
            </Text>
          </View>
        </View>
        {/* Sticky bottom button */}
        <View style={styles.buttonStickyContainer}>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Next</Text>
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
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    fontFamily: 'Inter',
  },
  inputPassword: {
    paddingRight: 36,
  },
  inputError: {
    color: Colors.error,
    borderColor: Colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: 'Inter',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 12,
    fontFamily: 'Inter',
    flex: 1,
  },
  checkboxIcon: {
    marginRight: 8,
    padding: 2,
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
});

export default AccountSetupStep; 