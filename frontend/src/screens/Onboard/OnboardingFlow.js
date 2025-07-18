import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import ProgressBar from './ProgressBar';
import PhoneNumberStep from './PhoneNumberStep';
import OTPVerificationStep from './OTPVerificationStep';
import AccountSetupStep from './AccountSetupStep';
import BusinessNeedsStep from './BusinessNeedsStep';
import DocumentUploadStep from './DocumentUploadStep';
import SuccessScreen from './SuccessScreen';
import RecommendedPaymentGatewaysStep from './RecommendedPaymentGatewaysStep';
import { Colors } from '../../constants/Colors';

const TOTAL_STEPS = 6;

function OnboardingFlow({ onDashboard }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = (data = {}) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PhoneNumberStep onNext={handleNext} />;
      case 2:
        return <OTPVerificationStep onNext={handleNext} onBack={handleBack} phoneNumber={formData.phoneNumber} />;
      case 3:
        return <AccountSetupStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <BusinessNeedsStep onNext={handleNext} onBack={handleBack} />;
      // case 5:
      //   return <RecommendedPaymentGatewaysStep onNext={handleNext} onBack={handleBack} businessNeedsData={formData} />;
      case 5:
        return <DocumentUploadStep onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <SuccessScreen onDashboard={onDashboard} key="SuccessOnboardingStep" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {currentStep <= TOTAL_STEPS && (
          <View style={styles.progressBarContainer}>
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} onBack={currentStep > 1 ? handleBack : undefined} onSkip={onDashboard} />
          </View>
        )}
        <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>
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
    backgroundColor: Colors.background,
    paddingTop: 0,
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  stepContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});

export default OnboardingFlow; 