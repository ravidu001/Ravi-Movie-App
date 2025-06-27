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
import React, { useState } from 'react';
import { SignupData, signUp } from '@/services/auth';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const signupData: SignupData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      const result = await signUp(signupData);

      if (result.success) {
        Alert.alert(
          'Success',
          'Account created successfully! You can now sign in.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/(auth)/login');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
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
              Create Account
            </Text>
            <Text className="text-gray-400 text-base text-center">
              Join us to discover amazing movies and shows
            </Text>
          </View>

          {/* Signup Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-white text-sm font-medium mb-2">
                Full Name
              </Text>
              <TextInput
                className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">
                Email Address
              </Text>
              <TextInput
                className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">
                Password
              </Text>
              <TextInput
                className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
              />
            </View>

            {/* Terms and Conditions */}
            <View className="mt-4">
              <Text className="text-gray-400 text-sm text-center">
                By creating an account, you agree to our{' '}
                <Text className="text-blue-400">Terms of Service</Text> and{' '}
                <Text className="text-blue-400">Privacy Policy</Text>
              </Text>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              className={`bg-blue-600 py-4 rounded-lg mt-6 ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text className="text-blue-400 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Signup;