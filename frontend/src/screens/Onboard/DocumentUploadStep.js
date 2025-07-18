import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';

const SECTIONS = [
  { key: 'ekyc', label: 'eKYC (Identity Verification)', icon: 'person-circle-outline' },
  { key: 'ssm', label: 'SSM (Business Registration)', icon: 'document-text-outline' },
  { key: 'bank', label: 'Bank Statement', icon: 'card-outline' },
];

function DocumentUploadStep({ completed = {}, onSectionComplete, onNext, onBack }) {
  const navigation = useNavigation();
  const [status, setStatus] = useState({ ekyc: !!completed.ekyc, ssm: !!completed.ssm, bank: !!completed.bank });

  const handleNavigate = (key) => {
    if (key === 'ekyc') {
      navigation.navigate('EKYCStep', {
        onComplete: () => handleComplete('ekyc'),
      });
    } else if (key === 'ssm') {
      navigation.navigate('SSMUploadStep', {
        onComplete: () => handleComplete('ssm'),
      });
    } else if (key === 'bank') {
      navigation.navigate('BankStatementUploadStep', {
        onComplete: () => handleComplete('bank'),
      });
    }
  };

  const handleComplete = (key) => {
    setStatus((prev) => ({ ...prev, [key]: true }));
    if (onSectionComplete) onSectionComplete(key);
  };

  const completedCount = Object.values(status).filter(Boolean).length;
  const allComplete = completedCount === SECTIONS.length;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Verify Once, Apply Everywhere</Text>
      <Text style={styles.subtitle}>
        Verify yourself as a valid merchant once, then apply to any payment gateway with eKYC, SSM, and Bank Statement.
      </Text>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{completedCount} of {SECTIONS.length} steps completed</Text>
      </View>
      <View style={styles.sections}>
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[styles.card, status[section.key] && styles.cardCompleted]}
            onPress={() => handleNavigate(section.key)}
            activeOpacity={0.8}
          >
            <Ionicons name={section.icon} size={32} color={Colors.primary} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>{section.label}</Text>
              <Text style={styles.cardStatus}>{status[section.key] ? 'Completed' : 'Pending'}</Text>
            </View>
            {status[section.key] && (
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.nextBtn, !allComplete && styles.nextBtnDisabled]}
          onPress={onNext}
          disabled={!allComplete}
        >
          <Text style={styles.nextBtnText}>Next</Text>
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
    paddingTop: 8,
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
  progressRow: {
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  progressText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  sections: {
    gap: 18,
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 0,
  },
  cardCompleted: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  cardLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  nextBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  nextBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DocumentUploadStep; 