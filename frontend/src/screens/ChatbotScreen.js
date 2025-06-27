import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { parseGeminiResponse } from '../services/geminiService';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;

console.log(GEMINI_API_KEY);
console.log(GEMINI_API_URL);

const SYSTEM_PROMPT = `You are a financial assistant. When the user wants to transfer money, always reply with a JSON object in this format:
{
  "category": "transfer",
  "content": "Here is your transfer summary...",
  "recipientName": "...",
  "bankName": "...",
  "accountNumber": "...",
  "amount": "...",
  "fromRegion": "...",
  "toRegion": "...",
  "missingFields": []
}
If any field is missing, include its name in the missingFields array and ask the user for it in the content field. If the user is not requesting a transfer, reply with:
{
  "category": "normal",
  "content": "Your normal reply here."
}
Always return only a valid JSON object, never plain text or code blocks.`;

const initialMessages = [
  { from: 'ai', text: 'Hi! I\'m PinkPay AI. How can I help you with your finances today?' },
];

export default function ChatbotScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  // Image picker handler
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  // Simulate payment success
  const simulatePayment = (fields) => {
    setSuccessDetails(fields);
    setShowSuccess(true);
    setPendingTransfer(null);
    setAwaitingConfirmation(false);
  };

  // Handler for YES/NO button
  const handleConfirmationButton = (reply) => {
    setInput(reply);
    setTimeout(() => sendMessage(), 0);
  };

  // Render confirmation card and buttons
  const renderConfirmation = () => {
    if (!awaitingConfirmation || !pendingTransfer) return null;
    return (
      <View style={styles.confirmCard}>
        <Ionicons name="shield-checkmark" size={40} color={Colors.primary} style={{ marginBottom: 8 }} />
        <Text style={styles.confirmTitle}>Confirm Payment</Text>
        <View style={styles.confirmDetails}>
          <Text style={styles.confirmLabel}>{pendingTransfer.recipientName}</Text>
          <Text style={styles.confirmAmount}>{pendingTransfer.amount}</Text>
          <Text style={styles.confirmSubLabel}>{pendingTransfer.bankName} • {pendingTransfer.accountNumber}</Text>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmDetailLabel}>From:</Text>
            <Text style={styles.confirmDetailValue}>{pendingTransfer.fromRegion}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmDetailLabel}>To:</Text>
            <Text style={styles.confirmDetailValue}>{pendingTransfer.toRegion}</Text>
          </View>
        </View>
        <Text style={styles.confirmQuestion}>Would you like to proceed with this transfer?</Text>
        <View style={styles.confirmButtons}>
          <TouchableOpacity style={[styles.confirmButton, styles.yesButton]} onPress={() => handleConfirmationButton('yes')}>
            <Text style={styles.confirmButtonText}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.confirmButton, styles.noButton]} onPress={() => handleConfirmationButton('no')}>
            <Text style={styles.confirmButtonText}>NO</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render payment success card
  const renderSuccess = () => {
    if (!showSuccess || !successDetails) return null;
    return (
      <View style={styles.successCard}>
        <Ionicons name="checkmark-circle" size={48} color="#22C55E" style={{ marginBottom: 8 }} />
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <View style={styles.successDetails}>
          <Text style={styles.confirmLabel}>{successDetails.recipientName}</Text>
          <Text style={styles.confirmAmount}>{successDetails.amount}</Text>
          <Text style={styles.confirmSubLabel}>{successDetails.bankName} • {successDetails.accountNumber}</Text>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmDetailLabel}>From:</Text>
            <Text style={styles.confirmDetailValue}>{successDetails.fromRegion}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmDetailLabel}>To:</Text>
            <Text style={styles.confirmDetailValue}>{successDetails.toRegion}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.doneButton} onPress={() => setShowSuccess(false)}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Send message handler
  const sendMessage = async () => {
    if (!input.trim() && !image) return;
    const userMsg = { from: 'user', text: input, image: image?.uri };
    setMessages([...messages, userMsg]);
    setInput('');
    setImage(null);
    setLoading(true);

    // If awaiting confirmation for transfer
    if (awaitingConfirmation && pendingTransfer) {
      if (/^yes$/i.test(userMsg.text.trim())) {
        simulatePayment(pendingTransfer);
      } else {
        setMessages(current => [
          ...current,
          { from: 'ai', text: 'Transfer cancelled.' }
        ]);
        setPendingTransfer(null);
      }
      setAwaitingConfirmation(false);
      setLoading(false);
      return;
    }

    // Prepare Gemini API call
    const userText = SYSTEM_PROMPT + '\n' + userMsg.text;
    let contents = [];
    if (userText.trim()) {
      contents.push({ role: 'user', parts: [{ text: userText }] });
    }
    if (image) {
      contents.push({
        role: 'user',
        parts: [
          { text: userText },
          {
            inlineData: {
              mimeType: image.mimeType || 'image/jpeg',
              data: image.base64,
            },
          },
        ],
      });
    }
    if (!contents.length) return;

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });
      const data = await response.json();
      let aiText = 'Sorry, I could not understand.';
      if (data && data.candidates && data.candidates[0]?.content?.parts) {
        aiText = data.candidates[0].content.parts.map(p => p.text).join(' ');
      } else if (data && data.error) {
        aiText = `Gemini API error: ${data.error.message}`;
      }

      // Parse Gemini's response as JSON
      const parsed = parseGeminiResponse(aiText);

      if (parsed.category === 'transfer') {
        setPendingTransfer(parsed);
        if (parsed.missingFields && parsed.missingFields.length > 0) {
          // Ask for the next missing field
          setMessages(current => [
            ...current,
            { from: 'ai', text: parsed.content }
          ]);
        } else {
          // All fields present, show confirmation
          setMessages(current => [
            ...current,
            { from: 'ai', text: `${parsed.content}\n\nWould you like to proceed with this transfer? (yes/no)` }
          ]);
          setAwaitingConfirmation(true);
        }
      } else {
        // Normal reply
        setMessages(current => [
          ...current,
          { from: 'ai', text: parsed.content }
        ]);
      }
    } catch (err) {
      setMessages(current => [...current, { from: 'ai', text: 'Error: Could not get response from Gemini.' }]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Navigation removed: do not navigate to AnalyticsMain */}
        <TouchableOpacity
          onPress={() => {}}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={{ padding: 8, borderRadius: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PinkPay AI Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat Area */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={{
          paddingVertical: 24,
          flexDirection: 'column-reverse',
          display: 'flex',
        }}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        {[...messages].reverse().map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.messageRow,
              msg.from === 'user' ? styles.userRow : styles.aiRow,
            ]}
          >
            {msg.from === 'ai' && (
              <LinearGradient
                colors={Colors.gradientPurple}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="sparkles" size={20} color="white" />
              </LinearGradient>
            )}
            <View
              style={[
                styles.messageBubble,
                msg.from === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.from === 'user' ? styles.userText : styles.aiText,
              ]}>{msg.text}</Text>
              {msg.image && (
                <Image
                  source={{ uri: msg.image }}
                  style={{ width: 120, height: 120, borderRadius: 10, marginTop: 8 }}
                  resizeMode="cover"
                />
              )}
            </View>
            {msg.from === 'user' && (
              <View style={styles.avatarUser}>
                <Ionicons name="person-circle" size={28} color={Colors.primary} />
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <LinearGradient
              colors={Colors.gradientPurple}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={20} color="white" />
            </LinearGradient>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {renderConfirmation()}
        {renderSuccess()}
        <View style={styles.inputArea}>
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Ionicons name="image" size={22} color={image ? Colors.primary : '#888'} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
            <Ionicons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
              <Ionicons name="close-circle" size={20} color="#f44" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarUser: {
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  aiBubble: {
    backgroundColor: `${Colors.primary}15`,
    borderTopLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: Colors.text,
  },
  userText: {
    color: 'white',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginRight: 12,
    color: Colors.text,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  previewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 12,
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  confirmLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  confirmAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  confirmSubLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmDetails: {
    marginBottom: 12,
    width: '100%',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  confirmDetailLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  confirmDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  confirmQuestion: {
    fontSize: 16,
    marginVertical: 12,
    textAlign: 'center',
    color: '#333',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: Colors.primary,
  },
  noButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successCard: {
    backgroundColor: '#e6fff2',
    borderRadius: 20,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 8,
  },
  successDetails: {
    marginBottom: 12,
    width: '100%',
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 