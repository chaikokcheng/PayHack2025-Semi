import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { useRoute } from '@react-navigation/native';

export default function EKYCStep({ navigation }) {
  const route = useRoute();
  const [ekycVisible, setEkycVisible] = useState(true);
  const [ekycStep, setEkycStep] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [icFront, setIcFront] = useState(null);
  const [icBack, setIcBack] = useState(null);
  const [blinked, setBlinked] = useState(false);
  const [icFrontText, setIcFrontText] = useState('');
  const [icBackText, setIcBackText] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessLoading, setLivenessLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleCaptureIC = async (side) => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.cancelled) {
      if (side === 'front') {
        setIcFront(result.uri);
        setTimeout(() => {
          setIcFrontText('MOCKED IC FRONT TEXT');
          setEkycStep(2);
        }, 1000);
      } else {
        setIcBack(result.uri);
        setTimeout(() => {
          setIcBackText('MOCKED IC BACK TEXT');
          setEkycStep(3);
        }, 1000);
      }
    }
  };

  const handleLivenessProceed = () => {
    setLivenessLoading(true);
    setTimeout(() => {
      setLivenessLoading(false);
      setEkycStep(1);
    }, 1500);
  };

  const handleEKYCComplete = () => {
    if (route.params?.onComplete) route.params.onComplete();
    navigation.goBack();
  };

  const renderEkycModal = () => (
    <Modal visible={ekycVisible} animationType="slide" onRequestClose={() => setEkycVisible(false)}>
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24, paddingTop: 50 }}>
        {ekycStep === 0 && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="happy-outline" size={80} color="#E91E63" style={{ marginBottom: 24 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Liveness Check</Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' }}>
              Please blink at the camera to verify you are a real person.
            </Text>
            {hasPermission === false ? (
              <Text style={{ color: 'red' }}>Camera permission denied.</Text>
            ) : (
              <CameraView
                style={{ width: 240, height: 320, borderRadius: 16, marginBottom: 24 }}
                facing="front"
              />
            )}
            <TouchableOpacity
              style={{ backgroundColor: livenessLoading ? '#ccc' : '#E91E63', borderRadius: 12, padding: 16, marginTop: 8 }}
              onPress={handleLivenessProceed}
              disabled={livenessLoading}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                {livenessLoading ? 'Checking...' : 'Proceed'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {ekycStep === 1 && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="id-card-outline" size={80} color="#E91E63" style={{ marginBottom: 24 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Scan IC - Front</Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' }}>
              Please capture the front of your identification card.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#E91E63', borderRadius: 12, padding: 16, marginTop: 8 }}
              onPress={() => handleCaptureIC('front')}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Capture Front</Text>
            </TouchableOpacity>
            {icFront && (
              <Image source={{ uri: icFront }} style={{ width: 200, height: 120, marginTop: 16, borderRadius: 8 }} />
            )}
            {icFrontText ? (
              <Text style={{ color: '#22C55E', marginTop: 8 }}>OCR: {icFrontText}</Text>
            ) : null}
          </View>
        )}
        {ekycStep === 2 && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="id-card-outline" size={80} color="#E91E63" style={{ marginBottom: 24 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Scan IC - Back</Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' }}>
              Please capture the back of your identification card.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#E91E63', borderRadius: 12, padding: 16, marginTop: 8 }}
              onPress={() => handleCaptureIC('back')}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Capture Back</Text>
            </TouchableOpacity>
            {icBack && (
              <Image source={{ uri: icBack }} style={{ width: 200, height: 120, marginTop: 16, borderRadius: 8 }} />
            )}
            {icBackText ? (
              <Text style={{ color: '#22C55E', marginTop: 8 }}>OCR: {icBackText}</Text>
            ) : null}
          </View>
        )}
        {ekycStep === 3 && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={80} color="#22C55E" style={{ marginBottom: 24 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>eKYC Complete</Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' }}>
              Your identity is now linked to <Text style={{ color: '#E91E63', fontWeight: 'bold' }}>MyDigitalID</Text>!
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#E91E63', borderRadius: 12, padding: 16, marginTop: 8 }}
              onPress={handleEKYCComplete}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );

  return renderEkycModal();
} 