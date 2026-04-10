import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import AuthLayout from '../components/AuthLayout';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import SocialButtons from '../components/SocialButtons';
import { useToast } from '../context/ToastContext';
import { auth } from '../services/firebaseSetup';
import { signInWithEmailAndPassword } from '@react-native-firebase/auth';

const LoginScreen = ({ navigation, route }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 
  useEffect(() => {
    if (route.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route.params?.prefillEmail]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
        props: { uuid: Math.random() } // Forces bar restart
      });
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Fixed: auth instead of auth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Welcome back!',
        props: { uuid: Math.random() }
      });

    } catch (error) {
      let friendlyMessage = "An unexpected error occurred.";

      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          friendlyMessage = "Incorrect email or password.";
          break;
        case 'auth/invalid-email':
          friendlyMessage = "Please enter a valid email address.";
          break;
        case 'auth/network-request-failed':
          friendlyMessage = "Network error. Check your connection.";
          break;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: friendlyMessage,
        props: { uuid: Math.random() } // Forces bar restart
      });
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleSocialLogin = (provider) => {
    showToast('Coming Soon', `${provider} login will be available in the next update.`, 'info');
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="welcome back we missed you"
      character={require('../assets/login-char.png')}
    >
      <AppInput
        label="Email"
        placeholder="e.g. hello@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <AppInput
        label="Password"
        placeholder="At least 8 characters"
        secure
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('AuthForgotPassword')}
        style={{ alignSelf: 'flex-end', marginBottom: 24 }}
      >
        <Text style={{ color: '#10B981', fontWeight: '600', fontSize: 14 }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <AppButton title="Sign in" onPress={handleSignIn} loading={isLoading} />

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ alignItems: 'center', marginTop: 16 }}>
        <Text style={{ fontSize: 14, color: '#6B7280' }}>
          Don't have an account? <Text style={{ color: '#10B981', fontWeight: '700' }}>Sign Up</Text>
        </Text>
      </TouchableOpacity>

      <SocialButtons 
        onGooglePress={() => handleSocialLogin('Google')}
        onApplePress={() => handleSocialLogin('Apple')}
        onFacebookPress={() => handleSocialLogin('Facebook')}
      />
    </AuthLayout>
  );
};

export default LoginScreen;