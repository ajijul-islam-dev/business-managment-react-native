import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Animated
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState, useRef, useContext, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../providers/AuthProvider';

const LoginScreen = () => {
  const router = useRouter();
  const { login, loading, error, errorField, success, resetAuthState } = useContext(AuthContext);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [inputErrors, setInputErrors] = useState({});
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const errorScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      setLoginError(error);
      Animated.spring(errorScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
      
      // Highlight specific fields if errorField is provided
      if (errorField) {
        setInputErrors(prev => ({
          ...prev,
          [errorField]: true
        }));
      }
    } else {
      setInputErrors({});
    }
  }, [error, errorField]);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) return;
    
    try {
      await login({ emailOrPhone, password });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const animateSuccess = () => {
    Animated.spring(checkmarkScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true
    }).start();
  };

  const handleInputChange = (name, value) => {
    if (name === 'emailOrPhone') setEmailOrPhone(value);
    if (name === 'password') setPassword(value);
    
    // Clear error when user starts typing
    if (inputErrors[name]) {
      setInputErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
    if (loginError) setLoginError(null);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <Animated.View style={[styles.checkmark, { transform: [{ scale: checkmarkScale }] }]}>
          <LinearGradient
            colors={['#4BB543', '#2E8B57']}
            style={styles.checkmarkBackground}
          >
            <Ionicons name="checkmark" size={40} color="#fff" />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.successTitle}>Login Successful!</Text>
        <Text style={styles.successText}>
          You have successfully logged in. Welcome back to your store management dashboard.
        </Text>
        
        <TouchableOpacity 
          style={styles.successButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.successButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loginError) {
    return (
      <SafeAreaView style={styles.errorFullScreenContainer}>
        <Animated.View style={[styles.errorIcon, { transform: [{ scale: errorScale }] }]}>
          <LinearGradient
            colors={['#FF4D4D', '#FF0000']}
            style={styles.errorIconBackground}
          >
            <Ionicons name="close" size={40} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.errorTitle}>Login Failed</Text>
        <Text style={styles.errorMessage}>
          {loginError.includes('credentials') 
            ? 'Invalid email/phone or password' 
            : loginError}
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => {
            setLoginError(null);
            resetAuthState();
          }}
        >
          <Text style={styles.errorButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Store Login</Text>
              <Text style={styles.subtitle}>Manage your store inventory</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email or Phone</Text>
                <TextInput
                  style={[
                    styles.input,
                    inputErrors.emailOrPhone && styles.errorInput
                  ]}
                  placeholder="Enter your email or phone"
                  value={emailOrPhone}
                  onChangeText={(text) => handleInputChange('emailOrPhone', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    inputErrors.password && styles.errorInput
                  ]}
                  placeholder="Enter your password"
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => handleInputChange('password', text)}
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.button,
                  (!emailOrPhone || !password) && styles.disabledButton
                ]}
                onPress={handleLogin}
                disabled={!emailOrPhone || !password || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.linkRow}>
                <Text style={styles.linkText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/registerScreen')}>
                  <Text style={[styles.linkText, styles.linkHighlight]}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1, 
    backgroundColor: "#f5f6fa" 
  },
  flex: { 
    flex: 1 
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  formContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 6,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFF",
    fontSize: 14,
    color: '#2c3e50',
  },
  errorInput: {
    borderColor: '#e74c3c'
  },
  button: {
    backgroundColor: "#FF7D33",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: '#FF7D33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
    shadowOpacity: 0
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "600",
    fontSize: 14,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  linkText: { 
    color: "#7f8c8d",
    fontSize: 13,
  },
  linkHighlight: {
    color: "#3498db",
    fontWeight: '600',
    marginLeft: 6
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f5f6fa'
  },
  checkmark: {
    marginBottom: 25
  },
  checkmarkBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center'
  },
  successText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 20
  },
  successButton: {
    backgroundColor: '#4BB543',
    borderRadius: 8,
    padding: 14,
    width: '100%',
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  successButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  errorFullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f5f6fa'
  },
  errorIcon: {
    marginBottom: 25
  },
  errorIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e74c3c',
    marginBottom: 12,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 20
  },
  errorButton: {
    backgroundColor: '#FF4D4D',
    borderRadius: 8,
    padding: 14,
    width: '100%',
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
});

export default LoginScreen;