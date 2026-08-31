import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import { Sparkles, Send, Share2 } from 'lucide-react-native';
import { ZODIAC_ICONS } from '../../constants/astrology';
import { haptic } from '../../haptics';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  oracleMetadata?: any;
}

interface HopeChatScreenProps {
  answers: Record<string, string>;
  zodiacIndex: number;
  insets: { bottom: number; top: number; left: number; right: number };
  chatMessages: ChatMessage[];
  isAiTyping: boolean;
  chatInput: string;
  setChatInput: (text: string) => void;
  handleChatSend: (method?: string, text?: string) => void;
  chatListRef: React.RefObject<FlatList | null>;
  onShareMessage?: (text: string) => void;
}

export function HopeChatScreen({
  answers,
  zodiacIndex,
  insets,
  chatMessages,
  isAiTyping,
  chatInput,
  setChatInput,
  handleChatSend,
  chatListRef,
  onShareMessage,
}: HopeChatScreenProps) {
  const baseBottomPadding = (insets.bottom || 0) > 0 ? insets.bottom + 8 : 12;
  const bottomPaddingAnim = useRef(new Animated.Value(baseBottomPadding)).current;
  const [inputHeight, setInputHeight] = useState(44);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isKeyboardOpen) {
      bottomPaddingAnim.setValue((insets.bottom || 0) > 0 ? insets.bottom + 8 : 12);
    }
  }, [insets.bottom, isKeyboardOpen]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      setIsKeyboardOpen(true);
      const keyboardHeight = e.endCoordinates ? e.endCoordinates.height : 300;
      const targetPadding = keyboardHeight + 8;

      Animated.timing(bottomPaddingAnim, {
        toValue: targetPadding,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 200,
        easing: Platform.OS === 'ios' ? Easing.bezier(0.17, 0.59, 0.4, 0.77) : Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        chatListRef.current?.scrollToEnd({ animated: true });
      });
    };

    const onHide = (e: any) => {
      setIsKeyboardOpen(false);
      const restPadding = (insets.bottom || 0) > 0 ? insets.bottom + 8 : 12;

      Animated.timing(bottomPaddingAnim, {
        toValue: restPadding,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 200,
        easing: Platform.OS === 'ios' ? Easing.bezier(0.17, 0.59, 0.4, 0.77) : Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    let androidWillShowSub: any;
    let androidWillHideSub: any;
    if (Platform.OS === 'android') {
      androidWillShowSub = Keyboard.addListener('keyboardWillShow', onShow);
      androidWillHideSub = Keyboard.addListener('keyboardWillHide', onHide);
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      androidWillShowSub?.remove?.();
      androidWillHideSub?.remove?.();
    };
  }, [insets.bottom]);

  return (
    <Animated.View
      style={[
        styles.tabContainer,
        {
          paddingBottom: bottomPaddingAnim,
        },
      ]}
    >
      {/* Astrologer Header */}
      <View style={styles.chatHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.avatarIconWrapper}>
            <Sparkles size={20} color="#7209B7" />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontFamily: 'Cinzel-Bold', color: '#2C2B3D' }}>Hope</Text>
            <Text style={{ fontSize: 11.5, fontFamily: 'SourceSerif4', color: '#726F8D' }}>Your Personal Astrologer & Guide</Text>
          </View>
        </View>
      </View>

      {/* Chat Feed */}
      <View style={styles.chatArea}>
        <FlatList
          ref={chatListRef}
          data={chatMessages}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => chatListRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.chatListContent}
          renderItem={({ item }) => {
            const isAi = item.sender === 'ai';
            return (
              <View style={[styles.msgRow, isAi ? styles.msgRowAi : styles.msgRowUser]}>
                {isAi && (
                  <View style={styles.avatarContainer}>
                    <Image
                      source={ZODIAC_ICONS[zodiacIndex + 1] || ZODIAC_ICONS[1]}
                      style={styles.avatarImage}
                    />
                  </View>
                )}
                <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
                  <Text style={[styles.msgText, isAi ? styles.msgTextAi : styles.msgTextUser]}>
                    {item.text}
                  </Text>
                  {isAi && onShareMessage && (
                    <TouchableOpacity
                      style={{ marginTop: 6, alignSelf: 'flex-end', opacity: 0.85, padding: 4 }}
                      onPress={() => onShareMessage(item.text)}
                      activeOpacity={0.7}
                    >
                      <Share2 size={14} color="#D946EF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
        {isAiTyping && (
          <View style={[styles.msgRow, styles.msgRowAi, { paddingLeft: 36, marginBottom: 12 }]}>
            <Text style={styles.typingText}>✦ Hope is consulting the stars...</Text>
          </View>
        )}
      </View>

      {/* Quick Action Chips */}
      {!isKeyboardOpen && (
        <View style={{ maxHeight: 44, marginBottom: 8 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['🔮 Today\'s vibe?', '💼 Career move?', '❤️ Love forecast', '⚡ Lucky color', '🌙 Moon phase']}
            keyExtractor={item => item}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
            renderItem={({ item: chip }) => (
              <TouchableOpacity
                key={chip}
                onPress={() => { haptic.press(); handleChatSend('astrology', chip); }}
                activeOpacity={0.8}
                style={styles.quickChip}
              >
                <Text style={styles.quickChipText}>{chip}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.chatInputContainer}>
        <TextInput
          style={[
            styles.chatTextInput,
            {
              height: Math.min(Math.max(44, inputHeight), 120),
            }
          ]}
          placeholder="Ask Hope anything about your alignment..."
          placeholderTextColor="#9E9BB3"
          value={chatInput}
          onChangeText={setChatInput}
          multiline
          scrollEnabled={inputHeight >= 120}
          returnKeyType="default"
          blurOnSubmit={false}
          textAlignVertical={inputHeight > 50 ? "top" : "center"}
          onContentSizeChange={(e) => {
            const h = e.nativeEvent.contentSize.height;
            if (h && Math.abs(h - inputHeight) > 2) {
              setInputHeight(h + (Platform.OS === 'ios' ? 16 : 8));
            }
          }}
        />
        <TouchableOpacity
          style={[styles.chatSendBtn, !chatInput.trim() && styles.chatSendBtnDisabled]}
          onPress={() => {
            handleChatSend('astrology');
            setInputHeight(44);
          }}
          disabled={!chatInput.trim()}
          activeOpacity={0.8}
        >
          <Send size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 9, 183, 0.08)',
    marginBottom: 8,
  },
  avatarIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(114, 9, 183, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: 12,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  msgRowAi: {
    justifyContent: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
  },
  avatarImage: {
    width: 18,
    height: 18,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAi: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.12)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: '#7209B7',
    borderTopRightRadius: 4,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  msgText: {
    fontFamily: 'SourceSerif4',
    fontSize: 14.5,
    lineHeight: 21,
  },
  msgTextAi: {
    color: '#2C2B3D',
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  typingText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#7209B7',
    fontStyle: 'italic',
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.14)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  quickChipText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#2C2B3D',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 9, 183, 0.16)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 14,
    color: '#2C2B3D',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  chatSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7209B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chatSendBtnDisabled: {
    backgroundColor: '#B3A2E7',
    opacity: 0.6,
  },
});

export default HopeChatScreen;
