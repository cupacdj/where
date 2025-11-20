import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Keyboard, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string };

const AnimatedMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.row,
        item.role === 'user' ? styles.rowUser : styles.rowAssistant,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {item.role === 'assistant' && (
        <View style={styles.assistantAvatar}>
          <Ionicons name="sparkles" size={20} color="#f97316" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.bubbleText, item.role === 'user' && { color: '#ffffff' }]}>
          {item.text}
        </Text>
      </View>
      {item.role === 'user' && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={20} color="#0284c7" />
        </View>
      )}
    </Animated.View>
  );
};

export const AssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm0', role: 'assistant', text: 'Hi! Ask me about places you would like to visit.' },
  ]);
  const [input, setInput] = useState('');
  const [keyboardUp, setKeyboardUp] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTyping]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now() + '_u', role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: Date.now() + '_a',
        role: 'assistant',
        text: `Mock answer about "${text}". (Integrate real AI later.)`,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
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
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 8}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="chatbubbles" size={24} color="#0284c7" />
            </View>
            <View>
              <Text style={styles.title}>AI Assistant</Text>
              <Text style={styles.subtitle}>Ask me anything</Text>
            </View>
          </View>
        </View>

        <View style={styles.messagesArea}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.listContent, { paddingBottom: keyboardUp ? 8 : 80 }]}
            renderItem={({ item, index }) => <AnimatedMessage item={item} index={index} />}
            showsVerticalScrollIndicator={false}
          />
          {isTyping && (
            <Animated.View style={[styles.typingIndicator, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, { marginLeft: 4 }]} />
              <View style={[styles.typingDot, { marginLeft: 4 }]} />
            </Animated.View>
          )}
        </View>

        <View
          style={[
            styles.inputWrapper,
            keyboardUp && { marginBottom: Platform.OS === 'ios' ? insets.bottom : 0 },
          ]}
        >
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.leftIcon} activeOpacity={0.7}>
              <Ionicons name="image-outline" size={22} color="#64748b" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask something..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={send}
              disabled={!input.trim() || isTyping}
              style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="#ffffff" />
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  rowAssistant: {
    alignSelf: 'flex-start',
  },
  rowUser: {
    alignSelf: 'flex-end',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    maxWidth: '100%',
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#0284c7',
    borderTopRightRadius: 4,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleText: {
    color: '#0f172a',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  inputWrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  leftIcon: {
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    maxHeight: 100,
    fontSize: 15,
    paddingVertical: 6,
    fontWeight: '500',
  },
  sendBtn: {
    backgroundColor: '#0284c7',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
});
