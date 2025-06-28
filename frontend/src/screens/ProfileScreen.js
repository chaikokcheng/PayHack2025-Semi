import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function ProfileScreen({ navigation }) {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [carWalletEnabled, setCarWalletEnabled] = useState(true);

  const user = {
    name: 'Kok Cheng',
    email: 'kokcheng@example.com',
    phone: '+60 12-345 6789',
    digitalId: 'MyDigitalID Verified',
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
      rightElement: <Text style={styles.verifiedBadge}>Verified</Text>
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

  return (
    <ScreenSafeArea style={styles.container}>
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
                  <Ionicons name="shield-checkmark" size={16} color="white" />
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
          {menuItems.map(renderMenuItem)}
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
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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