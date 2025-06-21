import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import { Colors } from '../constants/Colors';

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.log('Camera permission error:', error);
        setHasPermission(false);
        setDemoMode(true);
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    processQRCode(data);
  };

  const simulateQRScan = (demoData) => {
    setScanned(true);
    processQRCode(demoData);
  };

  const processQRCode = (data) => {
    // Smart QR routing logic
    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'payment') {
        // Navigate to payment screen
        navigation.navigate('Wallet', { 
          screen: 'Payment', 
          params: { 
            merchant: qrData.merchant,
            amount: qrData.amount,
            reference: qrData.reference
          }
        });
      } else if (qrData.type === 'product') {
        // Navigate to product details
        navigation.navigate('Shopping', {
          screen: 'ProductDetail',
          params: { productId: qrData.productId }
        });
      } else if (qrData.type === 'transfer') {
        // Navigate to transfer screen
        navigation.navigate('Wallet', {
          screen: 'Transfer',
          params: { recipient: qrData.recipient }
        });
      }
    } catch (error) {
      // If not JSON, treat as simple merchant payment
      Alert.alert(
        'QR Code Detected',
        `Merchant: ${data}\nWould you like to make a payment?`,
        [
          { text: 'Cancel', onPress: () => setScanned(false) },
          { 
            text: 'Pay', 
            onPress: () => navigation.navigate('Wallet', { 
              screen: 'Payment', 
              params: { merchant: data }
            })
          }
        ]
      );
    }
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      processQRCode(manualCode);
      setManualEntry(false);
      setManualCode('');
    }
  };

  const demoOptions = [
    { label: 'Jaya Grocer Payment', data: 'Jaya Grocer KL' },
    { label: 'Coffee Bean Payment', data: 'Coffee Bean KLCC' },
    { label: 'Transfer to John', data: '{"type":"transfer","recipient":"John Doe"}' },
    { label: 'Product Scan', data: '{"type":"product","productId":"milk-1l"}' }
  ];

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false || demoMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.demoContainer}>
          <Text style={styles.demoIcon}>📱</Text>
          <Text style={styles.demoTitle}>QR Scanner Demo Mode</Text>
          <Text style={styles.demoSubtitle}>
            {demoMode ? 
              'Camera unavailable - Try these demo QR codes:' : 
              'No camera access - Try these demo QR codes:'
            }
          </Text>
          
          <View style={styles.demoOptions}>
            {demoOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.demoOption}
                onPress={() => simulateQRScan(option.data)}
              >
                <Ionicons name="qr-code" size={24} color={Colors.primary} />
                <Text style={styles.demoOptionText}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.manualButton}
            onPress={() => setManualEntry(true)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.manualButtonText}>Manual Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Manual Entry Modal */}
        <Modal
          visible={manualEntry}
          transparent
          animationType="slide"
          onRequestClose={() => setManualEntry(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter QR Code Manually</Text>
              <TextInput
                style={styles.manualInput}
                placeholder="Paste or type QR code content here..."
                value={manualCode}
                onChangeText={setManualCode}
                multiline
                numberOfLines={4}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setManualEntry(false);
                    setManualCode('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleManualEntry}
                >
                  <Text style={styles.confirmButtonText}>Process</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <TouchableOpacity onPress={() => setFlashOn(!flashOn)}>
          <Ionicons 
            name={flashOn ? "flash" : "flash-off"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanningArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Point your camera at a QR code to scan
        </Text>
        <Text style={styles.subInstructionText}>
          Works with payment QR codes, product codes, and transfer codes
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setManualEntry(true)}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Manual Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setScanned(false)}
          disabled={!scanned}
        >
          <Ionicons name="refresh-outline" size={24} color={scanned ? "#007AFF" : "#999"} />
          <Text style={[styles.actionButtonText, { color: scanned ? "#007AFF" : "#999" }]}>
            Scan Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Home</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={manualEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setManualEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter QR Code Manually</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="Paste or type QR code content here..."
              value={manualCode}
              onChangeText={setManualCode}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setManualEntry(false);
                  setManualCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleManualEntry}
              >
                <Text style={styles.confirmButtonText}>Process</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
  // Demo Mode Styles
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  demoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  demoOptions: {
    width: '100%',
    marginBottom: 32,
  },
  demoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  demoOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 