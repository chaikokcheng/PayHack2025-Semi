import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

function ProgressBar({ currentStep, totalSteps, onBack, onSkip }) {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Back button (if not first step) */}
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.progressLabelContainer}>
          <Text style={styles.label}>Step {currentStep} of {totalSteps}</Text>
        </View>
        {/* Skip button on the right */}
        {onSkip ? (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'flex-start',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  backButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  progressLabelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    fontFamily: 'Inter',
  },
  barBackground: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.divider,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  skipButtonText: {
    color: '#EC4899', // Pink-500
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Inter',
  },
});

export default ProgressBar; 