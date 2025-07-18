import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

function FileUploadArea({ file, onPress }) {
  return (
    <TouchableOpacity style={styles.uploadArea} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="cloud-upload-outline" size={36} color={Colors.primary} style={{ marginBottom: 8 }} />
      {file ? (
        <Text style={styles.fileName}>{file.name}</Text>
      ) : (
        <>
          <Text style={styles.uploadText}>Upload your files here</Text>
          <Text style={styles.browseText}>Browse</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function SSMUploadStep({ route, navigation }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const pickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // More permissive for debugging
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFile(result.assets[0]);
      setError(null);
    } else {
      setError('File selection cancelled.');
    }
  };

  const handleNext = () => {
    if (!file) {
      setError('Please upload your SSM document.');
      return;
    }
    navigation.navigate('SSMSummaryStep', { file, onComplete: route.params?.onComplete });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Upload your SSM Document</Text>
      <Text style={styles.subtitle}>Upload a PDF or image of your business registration (SSM).</Text>
      <FileUploadArea file={file} onPress={pickFile} />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={[styles.nextBtn, !file && styles.nextBtnDisabled]} onPress={handleNext} disabled={!file}>
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : undefined,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : undefined,
  },
  uploadBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  fileName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  error: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 4,
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  nextBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    paddingVertical: 40,
    marginBottom: 16,
  },
  uploadText: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: 2,
  },
  browseText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  fileName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
});

export default SSMUploadStep; 