import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

export default function TransferScreen({ navigation, route }) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(route?.params?.recipient || '');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);

  const recentContacts = [
    { id: 1, name: 'John Doe', phone: '+60 12-345 6789', avatar: 'JD' },
    { id: 2, name: 'Alice Chen', phone: '+60 19-876 5432', avatar: 'AC' },
    { id: 3, name: 'Bob Wilson', phone: '+60 11-222 3333', avatar: 'BW' },
    { id: 4, name: 'Sarah Lee', phone: '+60 18-444 5555', avatar: 'SL' },
  ];

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  const handleTransfer = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!recipient && !selectedContact) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }
    const recipientName = selectedContact ? selectedContact.name : recipient;
    const transferAmount = parseFloat(amount);
    Alert.alert(
      'Confirm Transfer',
      `Send RM ${transferAmount.toFixed(2)} to ${recipientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          onPress: async () => {
            // Biometric authentication after confirmation
            try {
              const hasHardware = await LocalAuthentication.hasHardwareAsync();
              const isEnrolled = await LocalAuthentication.isEnrolledAsync();
              if (!hasHardware || !isEnrolled) {
                // Allow bypass in development
                if (__DEV__) {
                  Alert.alert(
                    'Biometric Not Available',
                    'Biometric authentication is not available on this device. Do you want to proceed for development/testing?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Proceed', style: 'destructive', onPress: () => {
                        // Simulate transfer
                        Alert.alert(
                          'Transfer Successful',
                          `RM ${transferAmount.toFixed(2)} has been sent to ${recipientName}`,
                          [{ text: 'OK', onPress: () => navigation.goBack() }]
                        );
                      }}
                    ]
                  );
                  return;
                } else {
                  Alert.alert('Biometric Error', 'Biometric authentication not available on this device.');
                  return;
                }
              }
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to confirm transfer',
                fallbackLabel: 'Enter Passcode',
              });
              if (!result.success) {
                Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again.');
                return;
              }
            } catch (e) {
              Alert.alert('Authentication Error', 'An error occurred during authentication.');
              return;
            }
            // Simulate transfer
            Alert.alert(
              'Transfer Successful',
              `RM ${transferAmount.toFixed(2)} has been sent to ${recipientName}`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      ]
    );
  };

  const selectQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  const selectContact = (contact) => {
    setSelectedContact(contact);
    setRecipient('');
  };

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer Money</Text>
        <TouchableOpacity>
          <Ionicons name="scan" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recipient Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send To</Text>

          {/* Recent Contacts */}
          <Text style={styles.subsectionTitle}>Recent Contacts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.contactsContainer}>
              {recentContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    selectedContact?.id === contact.id && styles.selectedContact
                  ]}
                  onPress={() => selectContact(contact)}
                >
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>{contact.avatar}</Text>
                  </View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Manual Entry */}
          <Text style={styles.subsectionTitle}>Or Enter Details</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
              style={styles.textInput}
              placeholder="Phone number or username"
              value={recipient}
              onChangeText={(text) => {
                setRecipient(text);
                setSelectedContact(null);
              }}
            />
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>RM</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Quick Amount Buttons */}
          <Text style={styles.subsectionTitle}>Quick Amount</Text>
          <View style={styles.quickAmountGrid}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() && styles.selectedQuickAmount
                ]}
                onPress={() => selectQuickAmount(quickAmount)}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === quickAmount.toString() && styles.selectedQuickAmountText
                ]}>
                  RM {quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Note (Optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <TextInput
              style={styles.textInput}
              placeholder="What's this for?"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>

        {/* Transfer Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transfer Options</Text>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="flash" size={20} color="#FFB800" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Instant Transfer</Text>
              <Text style={styles.optionSubtitle}>Delivered immediately • Free</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="time" size={20} color="#666" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Scheduled Transfer</Text>
              <Text style={styles.optionSubtitle}>Send later at specific time</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Security Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.securityFeature}>
            <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
            <Text style={styles.securityText}>
              End-to-end encryption enabled
            </Text>
          </View>

          <View style={styles.securityFeature}>
            <Ionicons name="finger-print" size={20} color="#8B5CF6" />
            <Text style={styles.securityText}>
              Biometric confirmation required
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Transfer Button */}
      <View style={styles.transferButtonContainer}>
        <TouchableOpacity
          style={[
            styles.transferButton,
            (!amount || (!recipient && !selectedContact)) && styles.disabledButton
          ]}
          onPress={handleTransfer}
          disabled={!amount || (!recipient && !selectedContact)}
        >
          <Text style={styles.transferButtonText}>
            {amount ? `Transfer RM ${parseFloat(amount || 0).toFixed(2)}` : 'Enter Amount'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  contactsContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  selectedContact: {
    backgroundColor: '#F0F7FF',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    minWidth: 120,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '30%',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedQuickAmount: {
    backgroundColor: '#007AFF',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedQuickAmountText: {
    color: 'white',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  transferButtonContainer: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transferButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  transferButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 