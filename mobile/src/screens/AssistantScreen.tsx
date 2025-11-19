import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string };

export const AssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm0', role: 'assistant', text: 'Hi! Ask me about places you would like to visit.' },
  ]);
  const [input, setInput] = useState('');
  const [keyboardUp, setKeyboardUp] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const insets = useSafeAreaInsets();

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now() + '_u', role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: Date.now() + '_a',
        role: 'assistant',
        text: `Mock answer about "${text}". (Integrate real AI later.)`,
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 8}
      >
        <Text style={styles.title}>AI Assistant</Text>
        <View style={styles.messagesArea}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.listContent, { paddingBottom: keyboardUp ? 8 : 72 }]}
            renderItem={({ item }) => (
              <View style={[styles.row, item.role === 'user' ? styles.rowUser : styles.rowAssistant]}>
                {item.role === 'assistant' && (
                  <Ionicons name="sparkles" size={28} color="#f97316" style={styles.avatar} />
                )}
                <View
                  style={[
                    styles.bubble,
                    item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text style={[styles.bubbleText, item.role === 'user' && { color: '#ffffff' }]}>{item.text}</Text>
                </View>
                {item.role === 'user' && (
                  <Ionicons name="person-circle" size={32} color="#3b82f6" style={styles.avatar} />
                )}
              </View>
            )}
          />
        </View>
        <View
          style={[
            styles.inputWrapper,
            keyboardUp && { marginBottom: Platform.OS === 'ios' ? insets.bottom : 0 },
          ]}
        >
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.leftIcon}>
              <Ionicons name="image-outline" size={22} color="#64748b" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask something..."
              placeholderTextColor="#64748b"
              multiline
            />
            <TouchableOpacity
              onPress={send}
              disabled={!input.trim()}
              style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  listContent: {
    paddingBottom: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  rowAssistant: { justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    marginHorizontal: 4,
  },
  bubble: {
    maxWidth: '70%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  assistantBubble: { backgroundColor: '#e2e8f0', borderTopLeftRadius: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#0284c7', borderTopRightRadius: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  bubbleText: { color: '#0f172a', fontSize: 14, lineHeight: 18 },
  messagesArea: { flex: 1 },
  inputWrapper: {
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 8,
   
  },
  leftIcon: {
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    maxHeight: 120,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendBtn: {
    backgroundColor: '#0284c7',
    padding: 10,
    borderRadius: 24,
  },
});
