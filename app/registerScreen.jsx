import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { AuthContext } from '../providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const REGISTRATION_STEPS = [
  { title: 'Business Info', fields: ['storeName', 'proprietor'], color: '#FF7D33' },
  { title: 'Contact Details', fields: ['email', 'phone', 'address'], color: '#33C4FF' },
  { title: 'Security', fields: ['password', 'confirmPassword'], color: '#8E33FF' }
];

const RegisterScreen = () => {
  const router = useRouter();
  const { register, loading, error, errorField, success, resetAuthState } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    proprietor: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [registrationError, setRegistrationError] = useState(null);
  const [errorFieldState, setErrorFieldState] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const errorScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      setRegistrationError(error);
      setErrorFieldState(errorField);
    }
  }, [error, errorField]);

  useEffect(() => {
    if (success) {
      animateSuccess();
    } else if (registrationError) {
      Animated.spring(errorScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else {
      errorScale.setValue(0);
    }
  }, [success, registrationError]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorFieldState === name) {
      setRegistrationError(null);
      setErrorFieldState(null);
    }
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.storeName.trim() && formData.proprietor.trim();
      case 2:
        return formData.email.trim() && formData.phone.trim();
      case 3:
        return formData.password.trim() && 
               formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    
    Animated.timing(slideAnim, {
      toValue: -width * step,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    Animated.timing(progressAnim, {
      toValue: ((step) / REGISTRATION_STEPS.length) * 100,
      duration: 300,
      useNativeDriver: false
    }).start();
    
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    Animated.timing(slideAnim, {
      toValue: -width * (step - 2),
      duration: 300,
      useNativeDriver: true
    }).start();
    
    Animated.timing(progressAnim, {
      toValue: ((step - 2) / REGISTRATION_STEPS.length) * 100,
      duration: 300,
      useNativeDriver: false
    }).start();
    
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    try {
      const registrationData = {
        storeName: formData.storeName,
        proprietor: formData.proprietor,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role : 'user',
        password: formData.password
      };
      await register(registrationData);
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: REGISTRATION_STEPS[step - 1]?.color,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      </View>
    </View>
  );

  const StepIndicators = () => (
    <View style={styles.stepIndicators}>
      {REGISTRATION_STEPS.map((stepItem, index) => (
        <View
          key={index}
          style={[
            styles.stepIndicator,
            index + 1 === step && styles.activeIndicator,
            index + 1 < step && styles.completedIndicator
          ]}
        >
          {index + 1 < step ? (
            <Ionicons name="checkmark" size={14} color="#fff" />
          ) : (
            <Text style={[
              styles.stepNumber,
              index + 1 === step && styles.activeStepNumber
            ]}>
              {index + 1}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderStepFields = () => (
    REGISTRATION_STEPS.map((stepItem, index) => {
      const isActive = index + 1 === step;

      return (
        <Animated.View
          key={index}
          style={[
            styles.stepContainer,
            {
              transform: [{ translateX: slideAnim }],
              opacity: isActive ? 1 : 0
            }
          ]}
        >
          <View style={[styles.stepHeader, { backgroundColor: stepItem.color }]}>
            <Text style={styles.stepTitle}>{stepItem.title}</Text>
          </View>

          {stepItem.fields.map(field => (
            <View key={field} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errorFieldState === field && styles.errorInput
                ]}
                placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                value={formData[field]}
                onChangeText={(text) => handleChange(field, text)}
                secureTextEntry={field.includes('password')}
                keyboardType={
                  field === 'email' ? 'email-address' :
                  field === 'phone' ? 'phone-pad' : 'default'
                }
                autoCapitalize={field === 'email' ? 'none' : 'words'}
              />
              {field === 'confirmPassword' && formData.password !== formData.confirmPassword && (
                <Text style={styles.errorText}>Passwords don't match</Text>
              )}
            </View>
          ))}
        </Animated.View>
      );
    })
  );

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
        <Text style={styles.successTitle}>Registration Complete!</Text>
        <Text style={styles.successText}>
          Your account has been successfully created.
        </Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => {
            resetAuthState();
            router.replace('loginScreen');
          }}
        >
          <Text style={styles.successButtonText}>Continue to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (registrationError) {
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
        <Text style={styles.errorTitle}>Registration Failed</Text>
        <Text style={styles.errorMessage}>
          {registrationError.includes('already in use') 
            ? `This ${registrationError.split(' ')[0]} is already registered.` 
            : registrationError}
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => {
            setRegistrationError(null);
            setErrorFieldState(null);
            resetAuthState();
          }}
        >
          <Text style={styles.errorButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Store Registration</Text>
              <StepIndicators />
              <ProgressBar />
            </View>

            <View style={styles.formContainer}>
              {renderStepFields()}
            </View>

            <View style={styles.buttonContainer}>
              {step > 1 && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={prevStep}
                >
                  <Ionicons name="arrow-back" size={16} color="#3498db" />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              {step < REGISTRATION_STEPS.length ? (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: REGISTRATION_STEPS[step - 1]?.color },
                    !validateStep(step) && styles.disabledButton
                  ]}
                  onPress={nextStep}
                  disabled={!validateStep(step) || loading}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: REGISTRATION_STEPS[step - 1]?.color },
                    (!validateStep(step) || loading) && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={loading || !validateStep(step)}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Complete</Text>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/loginScreen')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa'
  },
  flex: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: 30,
  },
  header: {
    padding: 20,
    paddingBottom: 10
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center'
  },
  progressContainer: {
    marginBottom: 15,
    marginTop: 10
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeIndicator: {
    backgroundColor: '#FF7D33'
  },
  completedIndicator: {
    backgroundColor: '#4BB543'
  },
  stepNumber: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600'
  },
  activeStepNumber: {
    color: '#fff'
  },
  formContainer: {
    flex: 1,
    width: width * REGISTRATION_STEPS.length,
    flexDirection: 'row'
  },
  stepContainer: {
    width: width - 40,
    marginHorizontal: 20,
    paddingBottom: 15
  },
  stepHeader: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  inputContainer: {
    marginBottom: 15
  },
  inputLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 6,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  errorInput: {
    borderColor: '#e74c3c'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11,
    marginTop: 4
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 15
  },
  primaryButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 10,
    backgroundColor: '#fff'
  },
  secondaryButtonText: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 13
  },
  footerLink: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 5
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

export default RegisterScreen;