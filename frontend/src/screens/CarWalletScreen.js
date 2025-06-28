import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function CarWalletScreen({ navigation }) {
  const [plateNumber, setPlateNumber] = useState('');
  const [carName, setCarName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [registeredCars, setRegisteredCars] = useState([
    {
      id: 1,
      plateNumber: 'VJS9998',
      carName: 'Honda Civic',
      isActive: true,
      autoPayEnabled: {
        parking: true,
        tolls: true,
        petrol: true,
      },
      paymentMethod: 'Touch \'n Go eWallet',
      totalSpent: 71.10,
    },
    {
      id: 2,
      plateNumber: 'PAY9876',
      carName: 'Tesla Model 3',
      isActive: false,
      autoPayEnabled: {
        parking: true,
        tolls: true,
        charging: true,
      },
      paymentMethod: 'Maybank Account',
      totalSpent: 189.50,
    },
  ]);

  const recentTransactions = [
    { id: 1, type: 'parking', location: 'Pavilion KL', amount: 8.00, time: '2 hours ago', plate: 'VJS9998' },
    { id: 2, type: 'toll', location: 'PLUS Highway', amount: 12.50, time: '1 day ago', plate: 'VJS9998' },
    { id: 3, type: 'charging', location: 'ChargEV Station', amount: 25.80, time: '2 days ago', plate: 'PAY9876' },
    { id: 4, type: 'petrol', location: 'Shell Station', amount: 45.60, time: '3 days ago', plate: 'VJS9998' },
  ];

  const handleAddCar = () => {
    if (!plateNumber.trim() || !carName.trim()) {
      Alert.alert('Error', 'Please enter both plate number and car name');
      return;
    }

    const newCar = {
      id: registeredCars.length + 1,
      plateNumber: plateNumber.toUpperCase(),
      carName: carName,
      isActive: true,
      autoPayEnabled: {
        parking: true,
        tolls: true,
        petrol: true,
      },
      paymentMethod: 'Touch \'n Go eWallet',
      totalSpent: 0,
    };

    setRegisteredCars([...registeredCars, newCar]);
    setPlateNumber('');
    setCarName('');
    setIsAdding(false);
    Alert.alert('Success', `${carName} (${plateNumber.toUpperCase()}) has been registered!`);
  };

  const toggleCarStatus = (carId) => {
    setRegisteredCars(registeredCars.map(car => 
      car.id === carId ? { ...car, isActive: !car.isActive } : car
    ));
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'parking': return 'car';
      case 'toll': return 'trail-sign';
      case 'charging': return 'battery-charging';
      case 'petrol': return 'water';
      default: return 'card';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'parking': return '#3B82F6';
      case 'toll': return '#10B981';
      case 'charging': return '#F59E0B';
      case 'petrol': return '#EF4444';
      default: return '#6366F1';
    }
  };

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car-as-Wallet</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(!isAdding)}>
          <Ionicons name={isAdding ? "close" : "add"} size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color="#6366F1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Auto-pay for parking, tolls & fuel</Text>
            <Text style={styles.infoDescription}>
              Your vehicle will automatically pay using your linked payment methods when detected at parking lots, toll booths, petrol stations, and charging stations.
            </Text>
          </View>
        </View>

        {/* Add Car Form */}
        {isAdding && (
          <View style={styles.addCarForm}>
            <Text style={styles.formTitle}>Register New Vehicle</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Car Plate Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., WKL1234A"
                value={plateNumber}
                onChangeText={setPlateNumber}
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Car Name/Model</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Honda Civic"
                value={carName}
                onChangeText={setCarName}
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAdding(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addCarButton} onPress={handleAddCar}>
                <Text style={styles.addCarButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Registered Cars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registered Vehicles</Text>
          {registeredCars.map((car) => (
            <View key={car.id} style={styles.carCard}>
              <View style={styles.carHeader}>
                <View style={styles.carInfo}>
                  <View style={styles.plateContainer}>
                    <Text style={styles.plateNumber}>{car.plateNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: car.isActive ? '#10B981' : '#9CA3AF' }]}>
                      <Text style={styles.statusText}>{car.isActive ? 'Active' : 'Inactive'}</Text>
                    </View>
                  </View>
                  <Text style={styles.carName}>{car.carName}</Text>
                  <Text style={styles.paymentMethod}>Payment: {car.paymentMethod}</Text>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => toggleCarStatus(car.id)}
                >
                  <Ionicons 
                    name={car.isActive ? "toggle" : "toggle-outline"} 
                    size={32} 
                    color={car.isActive ? '#10B981' : '#9CA3AF'} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.autoPaySettings}>
                <Text style={styles.autoPayTitle}>Auto-pay Enabled:</Text>
                <View style={styles.autoPayOptions}>
                  <View style={styles.autoPayOption}>
                    <Ionicons 
                      name="car" 
                      size={16} 
                      color={car.autoPayEnabled.parking ? '#3B82F6' : '#9CA3AF'} 
                    />
                    <Text style={[styles.autoPayText, { color: car.autoPayEnabled.parking ? '#3B82F6' : '#9CA3AF' }]}>
                      Parking
                    </Text>
                  </View>
                  <View style={styles.autoPayOption}>
                    <Ionicons 
                      name="trail-sign" 
                      size={16} 
                      color={car.autoPayEnabled.tolls ? '#10B981' : '#9CA3AF'} 
                    />
                    <Text style={[styles.autoPayText, { color: car.autoPayEnabled.tolls ? '#10B981' : '#9CA3AF' }]}>
                      Tolls
                    </Text>
                  </View>
                  {car.autoPayEnabled.hasOwnProperty('petrol') ? (
                    <View style={styles.autoPayOption}>
                      <Ionicons 
                        name="water" 
                        size={16} 
                        color={car.autoPayEnabled.petrol ? '#EF4444' : '#9CA3AF'} 
                      />
                      <Text style={[styles.autoPayText, { color: car.autoPayEnabled.petrol ? '#EF4444' : '#9CA3AF' }]}>
                        Petrol
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.autoPayOption}>
                      <Ionicons 
                        name="battery-charging" 
                        size={16} 
                        color={car.autoPayEnabled.charging ? '#F59E0B' : '#9CA3AF'} 
                      />
                      <Text style={[styles.autoPayText, { color: car.autoPayEnabled.charging ? '#F59E0B' : '#9CA3AF' }]}>
                        Charging
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.carStats}>
                <Text style={styles.totalSpent}>Total Spent: RM {car.totalSpent.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Auto-Payments</Text>
          <View style={styles.transactionsContainer}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
                  <Ionicons
                    name={getTransactionIcon(transaction.type)}
                    size={20}
                    color={getTransactionColor(transaction.type)}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionLocation}>{transaction.location}</Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionPlate}>{transaction.plate}</Text>
                    <Text style={styles.transactionTime}> • {transaction.time}</Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>-RM {transaction.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={24} color="#6366F1" />
              <Text style={styles.benefitText}>Seamless payments without stopping</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Secure RFID/ANPR detection</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="receipt" size={24} color="#3B82F6" />
              <Text style={styles.benefitText}>Automatic receipt & tracking</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    padding: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    margin: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  addCarForm: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  addCarButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  addCarButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  carCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  carInfo: {
    flex: 1,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plateNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginRight: 12,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleButton: {
    padding: 4,
  },
  autoPaySettings: {
    marginBottom: 16,
  },
  autoPayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  autoPayOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  autoPayOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoPayText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  carStats: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  totalSpent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  transactionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionPlate: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  transactionTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  benefitsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
}); 