import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { CameraView, Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { runOnJS } from 'react-native-reanimated';

export default function ProfileScreen({ navigation }) {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [carWalletEnabled, setCarWalletEnabled] = useState(true);
  const [ekycVisible, setEkycVisible] = useState(false);
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

  const user = {
    name: 'Fatimah binti Hisham',
    email: 'fatimah@example.com',
    phone: '+60 12-345 6789',
    digitalId: isVerified ? 'MyDigitalID Verified' : 'MyDigitalID Unverified',
    memberSince: 'Member since Jan 2024'
  };

  const menuItems = [
    {
      icon: 'person-circle',
      title: 'Personal Information',
      subtitle: 'Edit your profile details',
      action: () => Alert.alert('Feature', 'Personal Information editing coming soon')
    },
    {
      icon: 'finger-print',
      title: 'Digital Identity',
      subtitle: 'MyDigitalID • SingPass • e-KTP',
      action: () => Alert.alert('Digital ID', 'Manage your digital identity verification'),
      rightElement: <Text style={isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>{isVerified ? 'Verified' : 'Unverified'}</Text>
    },
    {
      icon: 'shield-checkmark',
      title: 'Security & Privacy',
      subtitle: 'Biometrics, PIN, security settings',
      action: () => Alert.alert('Security', 'Security settings'),
    },
    {
      icon: 'card',
      title: 'Payment Methods',
      subtitle: 'Manage cards and bank accounts',
      action: () => navigation.navigate('Wallet')
    },
    {
      icon: 'car',
      title: 'Car-as-Wallet',
      subtitle: 'WJK1234 • Smart auto-payments',
      action: () => { },
      rightElement: (
        <Switch
          value={carWalletEnabled}
          onValueChange={setCarWalletEnabled}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={carWalletEnabled ? '#ffffff' : '#f4f3f4'}
        />
      )
    },
    {
      icon: 'receipt',
      title: 'Transaction History',
      subtitle: 'View all your transactions',
      action: () => Alert.alert('History', 'Transaction history coming soon')
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'FAQs, contact support',
      action: () => Alert.alert('Support', 'Help & Support coming soon')
    },
  ];

  const settingsItems = [
    {
      icon: 'finger-print',
      title: 'Biometric Authentication',
      subtitle: 'Use Face ID / Touch ID',
      rightElement: (
        <Switch
          value={biometricEnabled}
          onValueChange={setBiometricEnabled}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={biometricEnabled ? '#ffffff' : '#f4f3f4'}
        />
      )
    },
    {
      icon: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Transaction alerts and updates',
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
        />
      )
    },
    {
      icon: 'language',
      title: 'Language',
      subtitle: 'English',
      action: () => Alert.alert('Language', 'Language selection coming soon')
    },
    {
      icon: 'moon',
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      action: () => Alert.alert('Theme', 'Dark mode coming soon')
    },
  ];

  // Single MSME Tools entry point
  const msmeToolsItem = {
    icon: 'briefcase-outline',
    title: 'MSME Business Tools',
    subtitle: 'Manage your business efficiently',
    action: () => navigation.navigate('MSMETools')
  };

  const ekycMenuItem = {
    icon: 'id-card',
    title: 'eKYC Verification',
    subtitle: 'Liveness & IC Scan',
    action: async () => {
      setEkycVisible(true);
      setEkycStep(0);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    }
  };

  const menuItemsWithEkyc = [ekycMenuItem, ...menuItems];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.action}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={item.icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      {item.rightElement || (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  const handleCaptureIC = async (side) => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.cancelled) {
      if (side === 'front') {
        setIcFront(result.uri);
        // Mock OCR: simulate delay and set placeholder text
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
              onPress={() => {
                setIsVerified(true);
                setEkycVisible(false);
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={Colors.gradientPink}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>{user.phone}</Text>
                <View style={styles.digitalIdBadge}>
                  <Ionicons name={isVerified ? "shield-checkmark" : "shield-outline"} size={16} color="white" />
                  <Text style={styles.digitalIdText}>{user.digitalId}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.memberSince}>{user.memberSince}</Text>
          </LinearGradient>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItemsWithEkyc.map(renderMenuItem)}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsItems.map(renderMenuItem)}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Fraud Protection', 'Your account is protected with AI-powered fraud detection')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="shield" size={24} color="#22C55E" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Fraud Protection</Text>
              <Text style={styles.menuSubtitle}>AI-powered security monitoring</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* MSME Business Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Tools</Text>
          {renderMenuItem(msmeToolsItem, 0)}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive' }
              ]
            )}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>PayHack2025 v1.0.0</Text>
          <Text style={styles.copyrightText}>Built for PayHack2025 Hackathon</Text>
        </View>
      </ScrollView>
      {renderEkycModal()}
    </View>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 8,
  },
  digitalIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  digitalIdText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  memberSince: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  verifiedBadge: {
    backgroundColor: '#22C55E',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  unverifiedBadge: {
    backgroundColor: '#EF4444',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
}); 