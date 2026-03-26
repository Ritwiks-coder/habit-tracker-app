import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import AuthLayout from './components/AuthLayout';
import AppInput from './components/AppInput';
import AppButton from './components/AppButton';
import SocialButtons from './components/SocialButtons';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    navigation.navigate('Main');
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="welcome back we missed you"
      character={require('./assets/login-char.png')}
    >
      <AppInput
        label="Username"
        placeholder="e.g. Taskmaster69"
        value={username}
        onChangeText={setUsername}
      />
      <AppInput
        label="Password"
        placeholder="At least 8 characters"
        secure
        value={password}
        onChangeText={setPassword}
      />

      {/* UPDATE: Changed 'ForgotPassword' to 'AuthForgotPassword' to match App.js */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AuthForgotPassword')}
        style={{ alignSelf: 'flex-end', marginBottom: 24 }}
      >
        <Text style={{ color: '#10B981', fontWeight: '600', fontSize: 14 }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <AppButton title="Sign in" onPress={handleLogin} />
      <SocialButtons />
    </AuthLayout>
  );
};

export default LoginScreen;