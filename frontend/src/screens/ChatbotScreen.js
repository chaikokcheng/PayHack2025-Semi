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

// Utility to clean amount (remove currency symbols/letters, keep numbers, dot, comma)
function cleanAmount(amount) {
  if (!amount) return '';
  // Remove all non-digit, non-dot, non-comma characters
  return amount.replace(/[^\d.,]/g, '');
}

const SYSTEM_PROMPT = `You are a financial assistant. When the user wants to transfer money, always reply with a JSON object in this format:
{
  "category": "transfer",
  "content": "Here is your transfer summary...",
  "recipientName": "...",
  "bankName": "...",
  "accountNumber": "...",
  "amount": "...",
  "fromRegion": "MY",
  "toRegion": "MY",
  "missingFields": []
}
If the user attaches an image (such as a screenshot), use OCR to extract any transfer details (account number, recipient name, bank, amount) from the image. Pay special attention to text near keywords like 'Name', 'Recipient', 'To', 'Beneficiary', or similar, to identify the recipient's name. If a chat history or screenshot is provided, the name at the top of the chat or in the first message is likely the recipient's name—use this as the recipient name for the transfer, unless the user specifies otherwise. When extracting the amount, always return only the number (no currency symbols or letters). If both text and image are provided, combine information from both sources. If only text is provided, extract details from the text. Only check for missing fields: recipientName, bankName, accountNumber, and amount. Do NOT include fromRegion or toRegion in missingFields - they are always set to "MY" by default. If the user specifies different regions, use their values instead of "MY". If the user is not requesting a transfer, reply with:
{
  "category": "normal",
  "content": "Your normal reply here."
}
Always return only a valid JSON object, never plain text or code blocks.`;

const initialMessages = [
  { from: 'ai', text: 'Hi! I\'m PinkPay AI. How can I help you with your finances today?' },
];

// Currency mapping utility
const regionCurrencyMap = {
  MY: { code: 'MYR', symbol: 'RM' },
  US: { code: 'USD', symbol: '$' },
  CN: { code: 'CNY', symbol: '¥' },
  KR: { code: 'KRW', symbol: '₩' },
  TH: { code: 'THB', symbol: '฿' },
  SG: { code: 'SGD', symbol: 'S$' },
  IN: { code: 'INR', symbol: '₹' },
  ID: { code: 'IDR', symbol: 'Rp' },
};
function getCurrencyInfo(region) {
  return regionCurrencyMap[region] || { code: region, symbol: '' };
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [doneDisabled, setDoneDisabled] = useState(false);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  // Image picker handler
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1.0,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  // Simulate payment success
  const simulatePayment = (fields) => {
    setMessages(current => [
      ...current,
      { from: 'ai', type: 'success', transfer: fields }
    ]);
    setPendingTransfer(null);
    setAwaitingConfirmation(false);
    setDoneDisabled(false);
  };

  // Process transfer data with default regions
  const processTransferData = (parsed) => {
    // Set default regions if not specified
    const processed = {
      ...parsed,
      fromRegion: parsed.fromRegion || 'MY',
      toRegion: parsed.toRegion || 'MY'
    };

    // Filter out region fields from missingFields
    if (processed.missingFields) {
      processed.missingFields = processed.missingFields.filter(
        field => field !== 'fromRegion' && field !== 'toRegion'
      );
    }

    return processed;
  };

  // Send message handler
  const sendMessage = async (overrideInput, suppressGemini = false) => {
    const messageToSend = overrideInput !== undefined ? overrideInput : input;
    if (!messageToSend.trim() && !image) return;
    const userMsg = { from: 'user', text: messageToSend, image: image?.uri };
    setMessages([...messages, userMsg]);
    setInput('');
    setImage(null);
    setLoading(true);

    // If awaiting confirmation for transfer
    if (awaitingConfirmation && pendingTransfer) {
      if (/^yes$/i.test(messageToSend.trim())) {
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
      setConfirmDisabled(false);
      return;
    }

    if (suppressGemini) {
      setLoading(false);
      return;
    }

    // Prepare Gemini API call
    const userText = SYSTEM_PROMPT + '\n' + messageToSend;
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
      console.log('Gemini API raw response:', data);
      let aiText = 'Sorry, I could not understand.';
      if (data && data.candidates && data.candidates[0]?.content?.parts) {
        aiText = data.candidates[0].content.parts.map(p => p.text).join(' ');
      } else if (data && data.error) {
        aiText = `Gemini API error: ${data.error.message}`;
      }
      console.log('aiText:', aiText);

      // Parse Gemini's response as JSON
      const parsed = parseGeminiResponse(aiText);
      console.log('Parsed Gemini response:', parsed);

      if (parsed.category === 'transfer') {
        // Process transfer data with default regions
        const processedTransfer = processTransferData(parsed);
        setPendingTransfer(processedTransfer);
        
        if (processedTransfer.missingFields && processedTransfer.missingFields.length > 0) {
          // Ask for the next missing field
          setMessages(current => [
            ...current,
            { from: 'ai', text: processedTransfer.content }
          ]);
        } else {
          // All fields present, show confirmation
          setMessages(current => [
            ...current,
            { from: 'ai', type: 'confirm', transfer: processedTransfer }
          ]);
          setAwaitingConfirmation(true);
          setConfirmDisabled(false);
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

  const handleConfirmationButton = (reply) => {
    if (confirmDisabled) return;
    setConfirmDisabled(true);
    setInput(reply);
    sendMessage(reply, true); // suppressGemini = true
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
        }}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => {
          if (msg.type === 'confirm') {
            return (
              <View key={idx} style={[styles.messageRow, styles.aiRow]}>
                <LinearGradient
                  colors={Colors.gradientPurple}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="sparkles" size={20} color="white" />
                </LinearGradient>
                <View style={[styles.messageCardBubble, styles.aiBubble, { padding: 0, backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]}> 
                  <View style={styles.confirmCard}>
                    <Ionicons name="shield-checkmark" size={40} color={Colors.primary} style={{ marginBottom: 0 }} />
                    <Text style={styles.confirmTitle}>Confirm Payment</Text>
                    <View style={styles.confirmDetails}>
                      <Text style={styles.confirmLabel}>{msg.transfer.recipientName}</Text>
                      <Text style={styles.confirmAmount}>
                        {getCurrencyInfo(msg.transfer.fromRegion).symbol}{cleanAmount(msg.transfer.amount)}
                      </Text>
                      <Text style={styles.confirmSubLabel}>{msg.transfer.bankName} • {msg.transfer.accountNumber}</Text>
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmDetailLabel}>From:</Text>
                        <Text style={styles.confirmDetailValue}>{msg.transfer.fromRegion}</Text>
                      </View>
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmDetailLabel}>To:</Text>
                        <Text style={styles.confirmDetailValue}>{msg.transfer.toRegion}</Text>
                      </View>
                    </View>
                    <Text style={styles.confirmQuestion}>Would you like to proceed with this transfer?</Text>
                    <View style={styles.confirmButtons}>
                      <TouchableOpacity
                        style={[styles.confirmButton, styles.yesButton, confirmDisabled && styles.disabledButton]}
                        onPress={() => handleConfirmationButton('yes')}
                        disabled={confirmDisabled}
                      >
                        <Text style={styles.confirmButtonText}>YES</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmButton, styles.noButton, confirmDisabled && styles.disabledButton]}
                        onPress={() => handleConfirmationButton('no')}
                        disabled={confirmDisabled}
                      >
                        <Text style={styles.confirmButtonText}>NO</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          }
          if (msg.type === 'success') {
            return (
              <View key={idx} style={[styles.messageRow, styles.aiRow]}>
                <LinearGradient
                  colors={Colors.gradientPurple}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="sparkles" size={20} color="white" />
                </LinearGradient>
                <View style={[styles.messageCardBubble, styles.aiBubble, { padding: 0, backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]}> 
                  <View style={styles.successCard}>
                    <Ionicons name="checkmark-circle" size={48} color="#22C55E" style={{ marginBottom: 8 }} />
                    <Text style={styles.successTitle}>Payment Successful!</Text>
                    <View style={styles.successDetails}>
                      <Text style={styles.confirmLabel}>{msg.transfer.recipientName}</Text>
                      <Text style={styles.confirmAmount}>
                        {getCurrencyInfo(msg.transfer.fromRegion).symbol}{cleanAmount(msg.transfer.amount)}
                      </Text>
                      <Text style={styles.confirmSubLabel}>{msg.transfer.bankName} • {msg.transfer.accountNumber}</Text>
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmDetailLabel}>From:</Text>
                        <Text style={styles.confirmDetailValue}>{msg.transfer.fromRegion}</Text>
                      </View>
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmDetailLabel}>To:</Text>
                        <Text style={styles.confirmDetailValue}>{msg.transfer.toRegion}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.doneButton, doneDisabled && styles.disabledButton]}
                      onPress={() => {
                        if (doneDisabled) return;
                        setDoneDisabled(true);
                        setMessages(current => [
                          ...current,
                          { from: 'ai', text: initialMessages[0].text }
                        ]);
                      }}
                      disabled={doneDisabled}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }
          return (
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
          );
        })}
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
        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
              <Ionicons name="close-circle" size={20} color="#f44" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputArea}>
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Ionicons name="image" size={22} color={image ? Colors.primary : '#888'} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()} disabled={loading}>
            <Ionicons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
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
  messageCardBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  removeImageButton: {
    marginLeft: 8,
    padding: 2,
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
  disabledButton: {
    opacity: 0.5,
  },
}); 