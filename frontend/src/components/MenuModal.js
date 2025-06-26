import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function MenuModal({ visible, onClose, menu, language }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 400 }}>
            {menu && menu.length > 0 ? (
              menu.map((item, idx) => (
                <View key={idx} style={styles.menuItem}>
                  <Text style={styles.menuName}>{item.name?.[language] || item.name?.en || item.name || `Item ${idx+1}`}</Text>
                  <Text style={styles.menuPrice}>RM {item.price?.toFixed ? item.price.toFixed(2) : item.price}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>No menu available.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuName: {
    fontSize: 16,
    color: '#333',
  },
  menuPrice: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'bold',
  },
}); 