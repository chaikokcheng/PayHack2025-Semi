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
import { analyzeTransferIntent } from '../services/geminiService';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a financial assistant. If the user wants to transfer money, always include a JSON object in your response in the following format: {"transfer": {"recipient": "Name", "amount": 123.45}}. Otherwise, just answer normally.`;

const initialMessages = [
  { from: 'ai', text: 'Hi! I\'m PinkPay AI. How can I help you with your finances today?' },
];

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
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

  // Send message to Gemini API
  const sendMessage = async () => {
    if (!input.trim() && !image) return;
    const userMsg = { from: 'user', text: input, image: image?.uri };
    setMessages([...messages, userMsg]);
    setInput('');
    setImage(null);
    setLoading(true);

    // Prepend system prompt to user message
    const userText = SYSTEM_PROMPT + '\n' + input;
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
      let transfer = null;
      if (data && data.candidates && data.candidates[0]?.content?.parts) {
        aiText = data.candidates[0].content.parts.map(p => p.text).join(' ');
        // Try to extract transfer JSON from the response
        const jsonMatch = aiText.match(/\{\s*"transfer"\s*:\s*\{[^}]+\}\s*\}/);
        if (jsonMatch) {
          try {
            transfer = JSON.parse(jsonMatch[0]);
          } catch (e) {}
        }
      } else if (data && data.error) {
        aiText = `Gemini API error: ${data.error.message}`;
      }
      setMessages(current => [...current, { from: 'ai', text: aiText }]);
      if (transfer && transfer.transfer) {
        setTimeout(() => {
          navigation.navigate('Transfer', {
            recipient: transfer.transfer.recipient,
            amount: transfer.transfer.amount.toString(),
          });
        }, 500);
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
        <TouchableOpacity
          onPress={() => navigation.navigate('AnalyticsMain')}
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
}); 