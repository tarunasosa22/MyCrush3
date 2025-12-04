import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IMAGES from './assets/images';
import { scale, verticalScale } from './utils/Scale';

const { width } = Dimensions.get('window');

const DatingChatDemo = () => {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const scrollViewRef = useRef(null);

  // Static chat messages
  const chatMessages = [
    {
      id: 1,
      text: 'I am really missing you so bad, please share your photos baby 😞👄💖',
      sender: 'me',
      delay: 500,
      bold: true,
    },
    {
      id: 2,
      text: 'I miss you too my love ❤️, Here is the photo just for you! 😘',
      sender: 'them',
      hasImage: true,
      image: require('./assets/images/dummy_chat.jpg'),
      delay: 2000,
    },
    {
      id: 3,
      text: 'I also want to see you darling! 🥰',
      sender: 'them',
      delay: 3000,
      bold: true,
    },
    {
      id: 4,
      text: 'Sure my love! 😘, Here is the photo just for you! 😘💖',
      sender: 'me',
      image: require('./assets/images/dummy_chat1.png'),
      hasImage: true,
      delay: 6000,
    },
    {
      id: 5,
      text: 'Can you send one more photo for me? 😘, I love seeing you in your sexy clothes!👄',
      sender: 'me',
      delay: 7500,
      bold: true,
    },
    {
      id: 6,
      text: 'Yes my love! 😘, Here is the photo just for you! 😘💖',
      sender: 'them',
      hasImage: true,
      delay: 9500,
    },
  ];

  useEffect(() => {
    // Animate messages one by one
    chatMessages.forEach((message, index) => {
      setTimeout(() => {
        // Show typing indicator
        setShowTyping(true);

        // After 1.5s, hide typing and show message
        setTimeout(() => {
          setShowTyping(false);
          setVisibleMessages(prev => [...prev, message]);
        }, 1500);
      }, message.delay);
    });
  }, []);

  const MessageBubble = ({ message, animate }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (animate) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setHasAnimated(true);
        });
      }
    }, []);

    const isMe = message.sender === 'me';

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
          animate && {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.bubbleWrapper}>
          {isMe ? (
            <LinearGradient
              colors={['#E91E63', '#9C27B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble,
              ]}
            >
              <Text style={[styles.messageText, styles.myMessageText]}>
                {message.text}
              </Text>
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.theirBubble]}>
              <Text style={[styles.messageText, styles.theirMessageText]}>
                {message.text}
              </Text>
            </View>
          )}

          {message.hasImage && (
            <View style={styles.imageContainer}>
              <ImageBackground
                source={message.image}
                style={styles.imagePlaceholder}
                blurRadius={10}
              />
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animateDot = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: -8,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };

      animateDot(dot1, 0);
      animateDot(dot2, 150);
      animateDot(dot3, 300);
    }, []);

    return (
      <View style={[styles.messageContainer, styles.theirMessage]}>
        <View style={styles.avatar}>👩</View>
        <View style={styles.typingBubble}>
          <Animated.View
            style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]}
          />
          <Animated.View
            style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]}
          />
          <Animated.View
            style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]}
          />
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('./assets/images/dummy_chat_wallpaper3.jpg')}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={['rgba(233, 30, 99, 0.95)', 'rgba(156, 39, 176, 0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('./assets/images/video_profile.webp')}
                style={styles.profileAvatar}
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.headerName}>Your Crush❤️</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Image
                source={IMAGES.Hchat}
                style={{ width: 24, height: 24, tintColor: '#FFFFFF' }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image
                source={IMAGES.call}
                style={{ width: 24, height: 24, tintColor: '#FFFFFF' }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <View style={{ height: '80%' }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {visibleMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              animate={index == visibleMessages.length - 1}
            />
          ))}

          {showTyping && <TypingIndicator />}
        </ScrollView>
          </View>
          <Image source={require('./assets/images/women.png')} style={{
             width:scale(500),
              height: scale(500),
              resizeMode: 'contain',
              position: 'absolute',
              bottom: 0, left: -170
          }} />
           <Image source={require('./assets/images/men.png')} style={{
             width:scale(500),
              height: scale(500),
              resizeMode: 'contain',
              position: 'absolute',
              bottom: 0, right: -180
          }} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    // marginTop: 50,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
      elevation: 5,
    marginTop: verticalScale(30),
  },
  headerContent: {
    paddingHorizontal: 20,
    marginVertical: 15,
    marginTop: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    resizeMode: 'cover',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameSection: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerStatus: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  avatar: {
    fontSize: 28,
    marginHorizontal: 8,
  },
  bubbleWrapper: {
    maxWidth: width * 0.7,
  },
  bubble: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myBubble: {
    borderTopRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#333333',
  },
  boldText: {
    fontSize: 17,
  },
  imageContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderTopLeftRadius: 1,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 210,
    resizeMode: 'cover',
    borderRadius: 12,
    borderTopLeftRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999999',
  },
});

export default DatingChatDemo;
