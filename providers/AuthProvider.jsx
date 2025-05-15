import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import useAxios from '../hooks/useAxios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { axiosPublic, axiosSecure } = useAxios();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Show animated message
  const showMessage = (message, type = 'success') => {
    setAuthMessage(message);
    setMessageType(type);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hide message with animation
  const hideMessage = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setAuthMessage(null);
    });
  };

  // Auto-hide message after delay
  useEffect(() => {
    let timer;
    if (authMessage) {
      timer = setTimeout(() => {
        hideMessage();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [authMessage]);

  // Storage functions
  const storeAuthData = async (userData, token) => {
    try {
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['token', token]
      ]);
    } catch (e) {
      showMessage('Failed to save session', 'error');
      throw e;
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'token']);
    } catch (e) {
      showMessage('Failed to clear session', 'error');
      throw e;
    }
  };

  // Check auth state
  const checkAuthState = useCallback(async () => {
    try {
      const [userData, token] = await AsyncStorage.multiGet(['user', 'token']);
      
      if (userData[1] && token[1]) {
        const parsedUser = JSON.parse(userData[1]);
        setUser(parsedUser);
        axiosSecure.defaults.headers['Authorization'] = `Bearer ${token[1]}`;
      }
    } catch (e) {
      await clearAuthData();
    } finally {
      setAuthChecked(true);
    }
  }, [axiosSecure]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Auth methods
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosPublic.post('/api/users/register', userData);
      
      setUser(response.data.user);
      showMessage('Account created! Redirecting to login...');
      setTimeout(() => {
        hideMessage();
        router.replace('/loginScreen');
      }, 1500);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      showMessage(errorMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axiosPublic.post('/api/users/login', credentials);
      await storeAuthData(response.data.user, response.data.token);
      setUser(response.data.user);
      axiosSecure.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;
      showMessage('Login successful!');
      setTimeout(() => {
        hideMessage();
        router.replace('/');
      }, 500);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      showMessage(errorMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await clearAuthData();
      setUser(null);
      delete axiosSecure.defaults.headers['Authorization'];
      showMessage('Logged out successfully');
      setTimeout(() => {
        hideMessage();
       // router.replace('/loginScreen');
      }, 1500);
    } catch (err) {
      showMessage('Logout failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Message component
  const MessageOverlay = () => (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          backgroundColor: messageType === 'success' ? '#4BB543' : '#FF4D4D',
          opacity: fadeAnim,
          pointerEvents: 'none',  // Make sure it doesn't block interactions
        }
      ]}
    >
      <Ionicons 
        name={messageType === 'success' ? 'checkmark-circle' : 'close-circle'} 
        size={24} 
        color="#fff" 
      />
      <Text style={styles.messageText}>{authMessage}</Text>
      <TouchableOpacity onPress={hideMessage}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <AuthContext.Provider 
      value={{
        user,
        authChecked,
        loading,
        register,
        login,
        logout,
        hideMessage
      }}
    >
      <View style={{ flex: 1 }}>
        {children}
      </View>
      
      {/* Only show message overlay when there is a message and it's not loading */}
      {authMessage && !loading && <MessageOverlay />}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,  // Ensure it's above other elements
    elevation: 3,
  },
  messageText: {
    color: '#fff',
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    flex: 1,
  },
});

export default AuthProvider;
