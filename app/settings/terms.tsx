import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import React from 'react';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const TermsOfService = () => {
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mt-16 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image source={icons.arrow} className="w-6 h-6 rotate-180" tintColor="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Terms of Service</Text>
        </View>

        <View className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4 text-center">Welcome to Movie Ravi App!</Text>
          
          <Text className="text-gray-300 text-base leading-6 mb-6">
            These terms of service outline the rules and regulations for the use of Movie App.
          </Text>

          <Text className="text-white text-base font-semibold mb-3">1. Acceptance of Terms</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>

          <Text className="text-white text-base font-semibold mb-3">2. Use License</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            Permission is granted to temporarily use Movie App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </Text>

          <Text className="text-white text-base font-semibold mb-3">3. User Account</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password.
          </Text>

          <Text className="text-white text-base font-semibold mb-3">4. Privacy Policy</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.
          </Text>

          <Text className="text-white text-base font-semibold mb-3">5. Prohibited Uses</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            You may not use our service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction.
          </Text>

          <Text className="text-white text-base font-semibold mb-3">6. Disclaimer</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            The information on this app is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all warranties.
          </Text>

          <Text className="text-white text-base font-semibold mb-3">7. Contact Information</Text>
          <Text className="text-gray-300 text-base leading-6">
            If you have any questions about these Terms of Service, please contact us at: support@movieapp.com
          </Text>
        <Text className="text-gray-400 text-sm mb-0 mt-10">Last updated: January 15, 2024</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsOfService;