import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoginData, signIn } from '@/services/auth';
import React, { useState } from 'react';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';
import { useSession } from '@/contexts/SessionContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSession();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const loginData: LoginData = {
        email: email,
        password: password,
      };

      console.log('🔄 Attempting login for:', email);
      const result = await signIn(loginData);
      console.log('📝 Login result:', result);

      if (result.success && result.user) {
        // Update the session context
        login(result.user);
        
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]);
      } else {
        console.error('❌ Login failed:', result.error);
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error details:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push('/(auth)/signup');
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mt-12 mb-8">
            <Text className="text-white text-3xl font-bold mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-400 text-base text-center">
              Sign in to continue watching your favorite movies
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-white text-sm font-medium mb-2">
                Email Address
              </Text>
              <TextInput
                className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2 mt-2">
                Password
              </Text>
              <TextInput
                className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-blue-600 py-4 rounded-lg mt-6 ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity className="mt-4">
              <Text className="text-blue-400 text-center">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text className="text-blue-400 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Login;