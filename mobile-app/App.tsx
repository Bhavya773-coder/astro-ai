import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Send, Calendar, Clock, Sparkles, CheckCircle2, Compass, Check, ShieldCheck, X } from 'lucide-react-native';
import { CustomAlertContainer } from './CustomAlert';
import type OnboardingScreenComp from './OnboardingScreen';
import type DashboardScreenComp from './DashboardScreen';
import AstroSplashScreen from './AstroSplashScreen';
import { ThemeProvider } from './theme';
import { haptic } from './haptics';

// Lazily load large components to optimize app startup time
const OnboardingScreen = (props: React.ComponentProps<typeof OnboardingScreenComp>) => {
  const Screen = require('./OnboardingScreen').default;
  return <Screen {...props} />;
};

const DashboardScreen = (props: React.ComponentProps<typeof DashboardScreenComp>) => {
  const Screen = require('./DashboardScreen').default;
  return <Screen {...props} />;
};

import {
  setAuthToken,
  saveAuthToken,
  loadAuthToken,
  loginUser,
  googleAuthUser,
  registerUser,
  verifyOtp,
  resendOtp,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
  fetchProfile,
  saveBasicProfile
} from './api';

const { width, height } = Dimensions.get('window');

type AuthMode = 'login' | 'signup' | 'signup_otp' | 'forgot_email' | 'forgot_otp' | 'forgot_new' | 'onboarding' | 'dashboard';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Answers from interactive onboarding
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});

  // Helper to change screen mode and clear errors
  const changeMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrors({});
  };

  // OTP Fields (6-digit code to match database backend)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Focused fields states
  const [activeField, setActiveField] = useState<string | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleGoogleSignIn = () => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '92991229834-mbdk1f4qrbv8ip67fohh1m3en3dkjl35.apps.googleusercontent.com';

    let origin = 'https://astroai4u.com';
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      origin = window.location.origin;
    }

    const redirectUri = `${origin}/auth/google/callback`;
    const scope = 'openid email profile';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = authUrl;
    } else {
      Linking.openURL(authUrl);
    }
  };

  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        setIsLoading(true);
        const origin = window.location.origin;
        const redirectUri = `${origin}/auth/google/callback`;

        googleAuthUser(code, redirectUri)
          .then((res: any) => {
            if (res?.token) {
              setAuthToken(res.token);
              setAuthTokenState(res.token);
              saveAuthToken(res.token);
              changeMode('dashboard');
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              Alert.alert('Google Sign-In Failed', res?.message || 'Authentication failed.');
            }
          })
          .catch((err: any) => {
            console.error('Google Auth error:', err);
            Alert.alert('Google Sign-In Failed', err?.message || 'Failed to authenticate with Google.');
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, []);

  // Restore auth token from secure storage on app launch
  React.useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const token = await loadAuthToken();
        if (token && active) {
          setAuthToken(token);
          setAuthTokenState(token);
          // Fetch profile to decide if onboarding is needed
          try {
            const profileRes = await fetchProfile();
            if (profileRes.success && profileRes.data) {
              const p = profileRes.data;
              setOnboardingAnswers({
                full_name: p.full_name || 'Seeker',
                date_of_birth: p.date_of_birth || '',
                birthtime: p.time_of_birth || '',
                birthplace: p.place_of_birth || '',
                gender: p.gender || 'neutral',
              });
              changeMode('dashboard');
            } else {
              changeMode('onboarding');
            }
          } catch {
            changeMode('dashboard');
          }
        }
      } catch {
        // Ignore storage errors and stay on login screen
      }
    };
    restore();
    return () => { active = false; };
  }, []);

  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    'ArcaneWhispers': require('./assets/fonts/ArcaneWhispers.ttf'),
    'MFZodiacDings': require('./assets/fonts/MFZodiacDings.ttf'),
    'Cinzel': require('./assets/fonts/Cinzel-Regular.ttf'),
    'Cinzel-Bold': require('./assets/fonts/Cinzel-Bold.ttf'),
    'SourceSerif4': require('./assets/fonts/SourceSerif4-Regular.ttf'),
    'SourceSerif4-Bold': require('./assets/fonts/SourceSerif4-Bold.ttf'),
  });

  const handleAuth = async () => {
    // Clear previous errors
    setErrors({});
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const newErrors: Record<string, string> = {};
        if (!email) newErrors.email = "Email address is required";
        if (!password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsLoading(false);
          return;
        }

        const res = await loginUser(email, password);
        if (res.token) {
          setAuthToken(res.token);
          setAuthTokenState(res.token);
          saveAuthToken(res.token);

          // Fetch profile if available
          try {
            const profileRes = await fetchProfile();
            if (profileRes.success && profileRes.data) {
              const p = profileRes.data;
              setOnboardingAnswers({
                full_name: p.full_name || (res.user?.email ? res.user.email.split('@')[0] : 'Seeker'),
                date_of_birth: p.date_of_birth || '',
                birthtime: p.time_of_birth || '',
                birthplace: p.place_of_birth || '',
                gender: p.gender || 'neutral',
              });
            } else {
              setOnboardingAnswers({
                full_name: res.user?.email ? res.user.email.split('@')[0] : 'Seeker',
              });
            }
          } catch (profileErr) {
            setOnboardingAnswers({
              full_name: res.user?.email ? res.user.email.split('@')[0] : 'Seeker',
            });
          }
          changeMode('dashboard');
        } else {
          Alert.alert('Login Failed', 'Failed to authenticate user.');
        }

      } else if (authMode === 'signup') {
        const newErrors: Record<string, string> = {};
        if (!name) newErrors.name = "Full name is required";
        if (!email) newErrors.email = "Email address is required";
        if (!password) newErrors.password = "Password is required";
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }

        if (!agreedPrivacy) {
          Alert.alert('Terms & Privacy Agreement Required', 'Please accept the Terms of Service & Privacy Policy to create your account.');
          setIsLoading(false);
          return;
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsLoading(false);
          return;
        }

        const res = await registerUser(email, password);
        if (res.success) {
          Alert.alert('Verification Code Sent', 'We\'ve sent a 6-digit verification code to your email address. Please check your inbox and spam folder.');
          setOnboardingAnswers({
            full_name: name,
          });
          changeMode('signup_otp');
        }

      } else if (authMode === 'signup_otp') {
        const code = otp.join('');
        if (code.length < 6) {
          setErrors({ otp: "Please enter the complete 6-digit code" });
          setIsLoading(false);
          return;
        }

        const res = await verifyOtp(email, code);
        if (res.token) {
          setAuthToken(res.token);
          setAuthTokenState(res.token);
          saveAuthToken(res.token);
          Alert.alert('Success', 'Email verified successfully!');
          changeMode('onboarding');
        }

      } else if (authMode === 'forgot_email') {
        if (!email) {
          setErrors({ email: "Email address is required" });
          setIsLoading(false);
          return;
        }

        const res = await requestPasswordResetOtp(email);
        if (res.ok) {
          Alert.alert('Reset Code Sent', 'We\'ve sent a password reset code to your email. Please check your inbox and spam folder.');
          changeMode('forgot_otp');
        }

      } else if (authMode === 'forgot_otp') {
        const code = otp.join('');
        if (code.length < 6) {
          setErrors({ otp: "Please enter the complete 6-digit code" });
          setIsLoading(false);
          return;
        }

        const res = await verifyPasswordResetOtp(email, code);
        if (res.ok && res.resetSessionToken) {
          setResetToken(res.resetSessionToken);
          changeMode('forgot_new');
        } else {
          Alert.alert('Verification Failed', 'The code you entered is incorrect or has expired. Please try again or request a new code.');
        }

      } else if (authMode === 'forgot_new') {
        const newErrors: Record<string, string> = {};
        if (!password) newErrors.password = "Password is required";
        if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsLoading(false);
          return;
        }

        if (!resetToken) {
          Alert.alert('Session Expired', 'Your password reset session has expired. Please request a new verification code.');
          changeMode('forgot_email');
          setIsLoading(false);
          return;
        }

        const res = await resetPasswordWithOtp(password, resetToken);
        if (res.ok) {
          Alert.alert("Success", "Password reset successfully! Returning to Sign In.");
          changeMode('login');
          setPassword('');
          setConfirmPassword('');
          setOtp(['', '', '', '', '', '']);
          setResetToken(null);
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      const userMsg = msg.includes('non-JSON') || msg.includes('network') || msg.includes('fetch')
        ? 'Unable to connect to the server. Please check your internet connection and try again.'
        : msg.includes('Invalid') || msg.includes('incorrect') || msg.includes('wrong')
        ? msg
        : msg.includes('already') || msg.includes('exists')
        ? msg
        : 'Something went wrong. Please try again.';
      Alert.alert('Oops!', userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Show Sequential Construction Splash Screen on startup
  if (showSplash) {
    return (
      <AstroSplashScreen
        size={340}
        backgroundColor="#070816"
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  // If fonts are still loading, show a loading spinner
  if (!fontsLoaded && !fontError) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#B3A2E7" />
      </View>
    );
  }

  // Helper to determine if we are in one of the forgot password sub-flows
  const isForgotFlow = ['forgot_email', 'forgot_otp', 'forgot_new'].includes(authMode);

  if (authMode === 'onboarding') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <OnboardingScreen
            onBack={() => changeMode('signup')}
            onComplete={async (answers) => {
              setIsLoading(true);
              try {
                await saveBasicProfile({
                  full_name: answers.full_name,
                  date_of_birth: answers.date_of_birth,
                  time_of_birth: answers.birthtime,
                  place_of_birth: answers.birthplace,
                  gender: answers.gender || 'neutral',
                });
                setOnboardingAnswers(answers);
                changeMode('dashboard');
              } catch (err: any) {
                Alert.alert('Error Saving Profile', err.message || 'Failed to save birth details.');
              } finally {
                setIsLoading(false);
              }
            }}
          />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (authMode === 'dashboard') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <DashboardScreen
            answers={onboardingAnswers}
            token={authToken}
            onLogout={async () => {
              setAuthToken(null);
              setAuthTokenState(null);
              setOnboardingAnswers({});
              await saveAuthToken(null);
              changeMode('login');
            }}
          />
          <CustomAlertContainer />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <LinearGradient
          colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']}
          locations={[0, 0.5, 1]}
          style={styles.container}
        >
        <StatusBar style="dark" />

        {/* Background Watermark & Decorative Icons (Merged into background, cannot block touch events) */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Image
            source={require('./assets/icons/astro_icon_9.png')}
            style={styles.bgWatermark}
            resizeMode="contain"
          />
          <Image
            source={require('./assets/icons/astro_icon_4.png')}
            style={[styles.bgIcon, styles.bgIconLeft]}
          />
          <Image
            source={require('./assets/icons/astro_icon_10.png')}
            style={[styles.bgIcon, styles.bgIconRight]}
          />
        </View>

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Section */}
              <View style={styles.headerContainer}>
                <Image
                  source={require('./assets/icon.png')}
                  style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12, alignSelf: 'center' }}
                  resizeMode="contain"
                />
                <Text style={styles.brandTitle}>AstroAi4u</Text>
                <Text style={styles.brandSubtitle}>Your celestial guide through the stars</Text>
              </View>

              {/* Auth Card */}
              <View style={styles.authCard}>

                {/* Header Back Button & Title for Forgot Flow */}
                {(isForgotFlow || authMode === 'signup_otp') && (
                  <View style={styles.forgotHeaderRow}>
                    <TouchableOpacity
                      onPress={() => {
                        if (authMode === 'forgot_email') changeMode('login');
                        else if (authMode === 'forgot_otp') changeMode('forgot_email');
                        else if (authMode === 'forgot_new') changeMode('forgot_otp');
                        else if (authMode === 'signup_otp') changeMode('signup');
                      }}
                      style={styles.backButton}
                      activeOpacity={0.7}
                    >
                      <ArrowLeft size={20} color="#2C2B3D" />
                    </TouchableOpacity>
                    <Text style={styles.forgotCardTitle}>
                      {authMode === 'forgot_email' && 'Reset Password'}
                      {authMode === 'forgot_otp' && 'Verification'}
                      {authMode === 'forgot_new' && 'New Password'}
                      {authMode === 'signup_otp' && 'Verify Email'}
                    </Text>
                    {/* Placeholder to balance the row */}
                    <View style={{ width: 24 }} />
                  </View>
                )}

                {/* Tab Selector (Hidden during Forgot Flow) */}
                {!isForgotFlow && (
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tab, authMode === 'login' && styles.activeTab]}
                      onPress={() => { haptic.tap(); changeMode('login'); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabText, authMode === 'login' && styles.activeTabText]}>
                        Sign In
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tab, authMode === 'signup' && styles.activeTab]}
                      onPress={() => { haptic.tap(); changeMode('signup'); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabText, authMode === 'signup' && styles.activeTabText]}>
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Form Content */}
                <View style={styles.formContainer}>

                  {/* === SIGN UP: Full Name === */}
                  {authMode === 'signup' && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <View style={[
                        styles.inputFieldContainer,
                        activeField === 'name' && styles.inputFieldActive,
                        errors.name && styles.inputFieldError
                      ]}>
                        <User size={18} color={errors.name ? '#E63946' : (activeField === 'name' ? '#B3A2E7' : '#9E9BB3')} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="John Doe"
                          placeholderTextColor="#9E9BB3"
                          value={name}
                          onChangeText={(text) => {
                            setName(text);
                            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                          }}
                          onFocus={() => setActiveField('name')}
                          onBlur={() => setActiveField(null)}
                        />
                      </View>
                      {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                    </View>
                  )}

                  {/* === SIGN IN / SIGN UP / FORGOT EMAIL: Email Address === */}
                  {(authMode === 'login' || authMode === 'signup' || authMode === 'forgot_email') && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <View style={[
                        styles.inputFieldContainer,
                        activeField === 'email' && styles.inputFieldActive,
                        errors.email && styles.inputFieldError
                      ]}>
                        <Mail size={18} color={errors.email ? '#E63946' : (activeField === 'email' ? '#B3A2E7' : '#9E9BB3')} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="your.email@astro.com"
                          placeholderTextColor="#9E9BB3"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={email}
                          onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                          }}
                          onFocus={() => setActiveField('email')}
                          onBlur={() => setActiveField(null)}
                        />
                      </View>
                      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                      {authMode === 'forgot_email' && !errors.email && (
                        <Text style={styles.forgotHelperText}>
                          Enter your registered email address and we'll send you a 6-digit code to reset your password.
                        </Text>
                      )}
                    </View>
                  )}

                  {/* === SIGN IN / SIGN UP: Password === */}
                  {(authMode === 'login' || authMode === 'signup') && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <View style={[
                        styles.inputFieldContainer,
                        activeField === 'password' && styles.inputFieldActive,
                        errors.password && styles.inputFieldError
                      ]}>
                        <Lock size={18} color={errors.password ? '#E63946' : (activeField === 'password' ? '#B3A2E7' : '#9E9BB3')} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor="#9E9BB3"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          value={password}
                          onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                          }}
                          onFocus={() => setActiveField('password')}
                          onBlur={() => setActiveField(null)}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                          {showPassword ? (
                            <EyeOff size={18} color="#9E9BB3" />
                          ) : (
                            <Eye size={18} color="#9E9BB3" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </View>
                  )}

                  {/* === SIGN UP: Confirm Password === */}
                  {authMode === 'signup' && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Confirm Password</Text>
                      <View style={[
                        styles.inputFieldContainer,
                        activeField === 'confirmPassword' && styles.inputFieldActive,
                        errors.confirmPassword && styles.inputFieldError
                      ]}>
                        <Lock size={18} color={errors.confirmPassword ? '#E63946' : (activeField === 'confirmPassword' ? '#B3A2E7' : '#9E9BB3')} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor="#9E9BB3"
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          value={confirmPassword}
                          onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }}
                          onFocus={() => setActiveField('confirmPassword')}
                          onBlur={() => setActiveField(null)}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} color="#9E9BB3" />
                          ) : (
                            <Eye size={18} color="#9E9BB3" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                    </View>
                  )}

                  {/* === FORGOT / SIGNUP OTP: OTP Input === */}
                  {(authMode === 'forgot_otp' || authMode === 'signup_otp') && (
                    <View style={styles.otpSection}>
                      <Text style={styles.forgotHelperTextCenter}>
                        We have sent a verification code to{'\n'}
                        <Text style={styles.boldText}>{email || 'your email'}</Text>
                      </Text>

                      <View style={styles.otpInputContainer}>
                        {otp.map((digit, idx) => (
                          <TextInput
                            key={idx}
                            ref={otpRefs[idx]}
                            style={[
                              styles.otpInputBox,
                              activeField === `otp_${idx}` && styles.otpInputBoxActive,
                              errors.otp && styles.otpInputBoxError
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => {
                              handleOtpChange(text, idx);
                              if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                            }}
                            onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                            onFocus={() => setActiveField(`otp_${idx}`)}
                            onBlur={() => setActiveField(null)}
                            textAlign="center"
                          />
                        ))}
                      </View>
                      {errors.otp ? <Text style={styles.errorTextCenter}>{errors.otp}</Text> : null}

                      <View style={styles.resendRow}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={async () => {
                            setIsLoading(true);
                            try {
                              if (authMode === 'signup_otp') {
                                await resendOtp(email);
                                Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
                              } else {
                                await requestPasswordResetOtp(email);
                                Alert.alert('Code Resent', 'A new password reset code has been sent to your email.');
                              }
                            } catch (err: any) {
                              Alert.alert('Resend Failed', 'We couldn\'t resend the code right now. Please wait a moment and try again.');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                        >
                          <Text style={styles.resendLink}>Resend</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* === FORGOT PASSWORD: New Password === */}
                  {authMode === 'forgot_new' && (
                    <View style={styles.otpSection}>
                      <Text style={styles.forgotHelperText}>
                        Create your new secure password. Ensure it's strong and unique.
                      </Text>

                      {/* New Password */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <View style={[
                          styles.inputFieldContainer,
                          activeField === 'new_password' && styles.inputFieldActive,
                          errors.password && styles.inputFieldError
                        ]}>
                          <Lock size={18} color={errors.password ? '#E63946' : (activeField === 'new_password' ? '#B3A2E7' : '#9E9BB3')} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9E9BB3"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            value={password}
                            onChangeText={(text) => {
                              setPassword(text);
                              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                            }}
                            onFocus={() => setActiveField('new_password')}
                            onBlur={() => setActiveField(null)}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          >
                            {showPassword ? (
                              <EyeOff size={18} color="#9E9BB3" />
                            ) : (
                              <Eye size={18} color="#9E9BB3" />
                            )}
                          </TouchableOpacity>
                        </View>
                        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                      </View>

                      {/* Confirm New Password */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <View style={[
                          styles.inputFieldContainer,
                          activeField === 'new_confirmPassword' && styles.inputFieldActive,
                          errors.confirmPassword && styles.inputFieldError
                        ]}>
                          <Lock size={18} color={errors.confirmPassword ? '#E63946' : (activeField === 'new_confirmPassword' ? '#B3A2E7' : '#9E9BB3')} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9E9BB3"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            value={confirmPassword}
                            onChangeText={(text) => {
                              setConfirmPassword(text);
                              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }}
                            onFocus={() => setActiveField('new_confirmPassword')}
                            onBlur={() => setActiveField(null)}
                          />
                          <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} color="#9E9BB3" />
                            ) : (
                              <Eye size={18} color="#9E9BB3" />
                            )}
                          </TouchableOpacity>
                        </View>
                        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                      </View>
                    </View>
                  )}

                  {/* === SIGN IN: Forgot Password Link === */}
                  {authMode === 'login' && (
                    <TouchableOpacity
                      style={styles.forgotContainer}
                      activeOpacity={0.7}
                      onPress={() => setAuthMode('forgot_email')}
                    >
                      <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  )}

                  {/* === SIGN UP: Privacy Policy & Terms Checkbox === */}
                  {authMode === 'signup' && (
                    <View style={styles.privacyCheckboxRow}>
                      <TouchableOpacity
                        style={[styles.checkbox, agreedPrivacy && styles.checkboxActive]}
                        onPress={() => setAgreedPrivacy(!agreedPrivacy)}
                        activeOpacity={0.8}
                      >
                        {agreedPrivacy ? <Check size={12} color="#FFFFFF" /> : null}
                      </TouchableOpacity>
                      <Text style={styles.privacyCheckboxText}>
                        I agree to the{' '}
                        <Text style={styles.privacyLinkText} onPress={() => setShowPrivacyModal(true)}>
                          Terms of Service & Privacy Policy
                        </Text>
                      </Text>
                    </View>
                  )}

                  {/* Main Action Button */}
                  <TouchableOpacity
                    style={[styles.buttonContainer, isLoading && styles.buttonDisabled]}
                    onPress={() => { haptic.tap(); handleAuth(); }}
                    activeOpacity={0.9}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#B3A2E7', '#A0C9E9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                      ) : null}
                      <Text style={styles.buttonText}>
                        {authMode === 'login' && 'Sign In'}
                        {authMode === 'signup' && 'Create Account'}
                        {authMode === 'signup_otp' && 'Verify Code'}
                        {authMode === 'forgot_email' && 'Send Code'}
                        {authMode === 'forgot_otp' && 'Verify Code'}
                        {authMode === 'forgot_new' && 'Reset Password'}
                      </Text>
                      {!isLoading && <ArrowRight size={18} color="#FFFFFF" style={styles.buttonIcon} />}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider & Google Login (Hidden during verification flows) */}
                  {!isForgotFlow && authMode !== 'signup_otp' && (
                    <>
                      <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                      </View>

                      {/* Social Login Button (Google only, centered and full-width) */}
                      <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8} onPress={() => { haptic.tap(); handleGoogleSignIn(); }}>
                          <Image
                            source={{ uri: 'https://img.icons8.com/color/70/000000/google-logo.png' }}
                            style={styles.socialLogo}
                          />
                          <Text style={styles.socialButtonText}>Sign in with Google</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
          {/* Privacy Policy & Terms Modal (Google Play & Apple App Store Compliant) */}
          <Modal visible={showPrivacyModal} animationType="slide" transparent={true} onRequestClose={() => setShowPrivacyModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.privacyModalContainer}>
                <View style={styles.privacyModalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ShieldCheck size={24} color="#7209B7" style={{ marginRight: 8 }} />
                    <Text style={styles.privacyModalTitle}>Privacy Policy & Terms</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowPrivacyModal(false)} style={styles.modalCloseBtn}>
                    <X size={20} color="#726F8D" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.privacyModalScroll} showsVerticalScrollIndicator={true}>
                  <Text style={styles.privacySectionHeading}>AstroAi4u — Privacy Policy</Text>
                  <Text style={styles.privacyLastUpdated}>Effective Date: July 24, 2026 | App Store & Google Play Compliant</Text>

                  <Text style={styles.privacyParagraph}>
                    AstroAi4u ("we", "our", or "us"), operated under Arcadian Works (astroai4u.com), respects your privacy and is committed to protecting your personal data in full compliance with Google Play Store and Apple App Store Developer Policies.
                  </Text>

                  <Text style={styles.privacySectionTitle}>1. Data We Collect</Text>
                  <Text style={styles.privacyParagraph}>
                    • <Text style={{ fontWeight: '700' }}>Birth Profile Data:</Text> Full Name, Date of Birth, Time of Birth, and Place of Birth to calculate astronomical charts, nakshatras, and numerology maps.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Account Credentials:</Text> Email address and securely hashed authentication credentials.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Camera & Image Analysis:</Text> Real-time camera or photo upload captures used exclusively for on-demand Palm, Face, and Coffee Reading analyses. Images are processed ephemerally and are never stored for biometric tracking or sold to third parties.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>In-App Transactions:</Text> Purchase records processed securely via Razorpay PCI-DSS compliant gateways.
                  </Text>

                  <Text style={styles.privacySectionTitle}>2. How Your Data Is Used</Text>
                  <Text style={styles.privacyParagraph}>
                    Your information is strictly used to deliver customized astrological insights, personalized outfit/style recommendations, tarot interpretations, and AI consultations.
                  </Text>

                  <Text style={styles.privacySectionTitle}>3. Strict Zero Data Selling Policy</Text>
                  <Text style={styles.privacyParagraph}>
                    We do NOT sell, rent, lease, or trade your personal information or image scans to advertising networks or third-party brokers.
                  </Text>

                  <Text style={styles.privacySectionTitle}>4. User Rights & Account Deletion</Text>
                  <Text style={styles.privacyParagraph}>
                    You maintain complete ownership of your data. You may request full account and data deletion at any time by emailing us at: <Text style={{ color: '#7209B7', fontWeight: '700' }}>arcadian@arcddia.co.in</Text>.
                  </Text>

                  <Text style={styles.privacySectionTitle}>5. Contact & Support</Text>
                  <Text style={styles.privacyParagraph}>
                    Arcadian Works — AstroAi4u{'\n'}
                    Support Email: arcadian@arcddia.co.in{'\n'}
                    Website: https://astroai4u.com
                  </Text>

                  <View style={{ height: 30 }} />
                </ScrollView>
                <TouchableOpacity style={styles.modalAcceptBtn} onPress={() => { setAgreedPrivacy(true); setShowPrivacyModal(false); }}>
                  <Text style={styles.modalAcceptBtnText}>I Accept & Agree</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </SafeAreaView>
      </LinearGradient>
      <CustomAlertContainer />
    </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EFFF',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 50,
    justifyContent: 'center',
  },
  // Background Watermark (merged into the background)
  bgWatermark: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.12,
    alignSelf: 'center',
    opacity: 0.08,
  },
  // Background decorative elements
  bgIcon: {
    position: 'absolute',
    width: 140,
    height: 140,
    opacity: 0.1,
  },
  bgIconLeft: {
    top: 50,
    left: -40,
    transform: [{ rotate: '-15deg' }],
  },
  bgIconRight: {
    bottom: 30,
    right: -40,
    transform: [{ rotate: '25deg' }],
  },
  // Header Section
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  zodiacSymbols: {
    fontFamily: 'MFZodiacDings',
    fontSize: 24,
    color: '#B3A2E7',
    opacity: 0.5,
    marginBottom: 8,
    letterSpacing: 6,
  },
  brandTitle: {
    fontFamily: 'ArcaneWhispers',
    fontSize: 44,
    color: '#2C2B3D',
    letterSpacing: 1,
    lineHeight: 52,
  },
  brandSubtitle: {
    fontFamily: 'Cinzel',
    fontSize: 12,
    color: '#726F8D',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Auth Card
  authCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 26,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  // Header details for forgot password screens
  forgotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  forgotCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#2C2B3D',
    textAlign: 'center',
  },
  forgotHelperText: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    color: '#726F8D',
    lineHeight: 16,
    marginTop: 8,
    marginLeft: 2,
  },
  forgotHelperTextCenter: {
    fontFamily: 'Cinzel',
    fontSize: 12,
    color: '#726F8D',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  boldText: {
    fontFamily: 'Cinzel-Bold',
    color: '#2C2B3D',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(114, 111, 141, 0.06)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 22,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#726F8D',
  },
  activeTabText: {
    color: '#2C2B3D',
  },
  formContainer: {},
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#2C2B3D',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E7ED',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputFieldActive: {
    borderColor: '#B3A2E7',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    color: '#2C2B3D',
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  // OTP Section Styles
  otpSection: {
    marginBottom: 12,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 24,
  },
  otpInputBox: {
    width: 42,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E7ED',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2B3D',
  },
  otpInputBoxActive: {
    borderColor: '#B3A2E7',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inputFieldError: {
    borderColor: '#E63946',
  },
  errorText: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    color: '#E63946',
    marginTop: 4,
    marginLeft: 4,
  },
  otpInputBoxError: {
    borderColor: '#E63946',
  },
  errorTextCenter: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    color: '#E63946',
    textAlign: 'center',
    marginBottom: 16,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resendText: {
    fontFamily: 'Cinzel',
    fontSize: 12,
    color: '#726F8D',
  },
  resendLink: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#B3A2E7',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#B3A2E7',
  },
  buttonContainer: {
    marginTop: 4,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#B3A2E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
  },
  buttonText: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 6,
  },
  buttonIcon: {
    marginTop: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E7ED',
  },
  dividerText: {
    fontFamily: 'Cinzel',
    fontSize: 10,
    color: '#9E9BB3',
    paddingHorizontal: 10,
    textTransform: 'lowercase',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E7ED',
    borderRadius: 14,
    width: '100%',
    height: 50,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  socialLogo: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  socialButtonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#2C2B3D',
  },
  privacyCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7209B7',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#7209B7',
    borderColor: '#7209B7',
  },
  privacyCheckboxText: {
    fontSize: 12,
    color: '#555171',
    flex: 1,
  },
  privacyLinkText: {
    color: '#7209B7',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  privacyModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  privacyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E7ED',
    paddingBottom: 12,
    marginBottom: 12,
  },
  privacyModalTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
  },
  modalCloseBtn: {
    padding: 4,
  },
  privacyModalScroll: {
    maxHeight: 400,
  },
  privacySectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2B3D',
    marginBottom: 4,
  },
  privacyLastUpdated: {
    fontSize: 11,
    color: '#726F8D',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  privacySectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7209B7',
    marginTop: 12,
    marginBottom: 4,
  },
  privacyParagraph: {
    fontSize: 12.5,
    color: '#4A485B',
    lineHeight: 18,
    marginBottom: 8,
  },
  modalAcceptBtn: {
    backgroundColor: '#7209B7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  modalAcceptBtnText: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
});
