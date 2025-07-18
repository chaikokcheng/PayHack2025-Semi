import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingFlow from './OnboardingFlow';
import EKYCStep from './EKYCStep';
import SSMUploadStep from './SSMUploadStep';
import SSMSummaryStep from './SSMSummaryStep';
import BankStatementUploadStep from './BankStatementUploadStep';
import BankStatementSummaryStep from './BankStatementSummaryStep';

const Stack = createStackNavigator();

export default function OnboardingScreen(props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="OnboardingFlow"
        children={navProps => <OnboardingFlow {...navProps} onDashboard={props.onFinish} />}
      />
      <Stack.Screen name="EKYCStep" component={EKYCStep} />
      <Stack.Screen name="SSMUploadStep" component={SSMUploadStep} />
      <Stack.Screen name="SSMSummaryStep" component={SSMSummaryStep} />
      <Stack.Screen name="BankStatementUploadStep" component={BankStatementUploadStep} />
      <Stack.Screen name="BankStatementSummaryStep" component={BankStatementSummaryStep} />
    </Stack.Navigator>
  );
} 