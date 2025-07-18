import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../../constants/Colors';

function OTPVerificationStep({ onNext, onBack, phoneNumber }) {
  const [otp, setOtp] = useState('');
  const [touched, setTouched] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  React.useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  // Only allow numbers
  const handleChange = (text) => {
    setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
    if (!touched) setTouched(true);
  };

  const isValid = otp.length === 6;
  const showError = touched && !isValid && otp.length > 0;

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      setOtp('');
      setTouched(false);
      console.log('Resend OTP');
    }
  };

  // Render 6 boxes for OTP
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      boxes.push(
        <View
          key={i}
          style={[styles.otpBox, otp.length === i && styles.otpBoxActive, showError && styles.otpBoxError]}
        >
          <Text style={styles.otpDigit}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={32}
      >
        <View style={styles.flexGrow}>
          {/* Back button removed */}

          <Text style={styles.header}>Verify Your Phone Number</Text>
          <Text style={styles.subHeader}>
            We've sent a 6-digit verification code to <Text style={styles.phoneNumber}>+60 {phoneNumber}</Text>.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter OTP</Text>
            <TouchableWithoutFeedback onPress={() => inputRef.current && inputRef.current.focus()}>
              <View style={styles.otpRow}>
                {renderOtpBoxes()}
                <TextInput
                  ref={inputRef}
                  style={styles.otpHiddenInput}
                  value={otp}
                  onChangeText={handleChange}
                  maxLength={6}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onBlur={() => setTouched(true)}
                  textContentType="oneTimeCode"
                  autoFocus
                />
              </View>
            </TouchableWithoutFeedback>
            {showError && (
              <Text style={styles.errorText}>Please enter the 6-digit code.</Text>
            )}
          </View>

          <View style={styles.linksRow}>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.link}>Change Phone Number</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
              <Text style={[styles.link, resendTimer > 0 && styles.linkDisabled]}>
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Sticky bottom button */}
        <View style={styles.buttonStickyContainer}>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={() => isValid && onNext({ otp })}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Verify</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
    fontWeight: '500',
  },
  phoneNumber: {
    color: Colors.text,
    fontWeight: 'bold',
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 4,
    marginHorizontal: 2,
  },
  otpBox: {
    width: 56,
    height: 68,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  otpBoxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  otpDigit: {
    fontSize: 32,
    color: Colors.text,
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  otpHiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter',
  },
  linkDisabled: {
    color: Colors.textLight,
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

export default OTPVerificationStep; 