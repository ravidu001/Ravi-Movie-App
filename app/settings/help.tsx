import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import React from 'react';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const HelpSupport = () => {
  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you want to contact us:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL('mailto:support@movieapp.com')
        },
        { 
          text: 'Phone', 
          onPress: () => Alert.alert('Phone Support', '+1 (555) 123-4567')
        }
      ]
    );
  };

  const faqData = [
    {
      question: 'How do I search for movies?',
      answer: 'Use the search tab to find movies by title, genre, or actor.'
    },
    {
      question: 'How do I save movies to my list?',
      answer: 'Tap the bookmark icon on any movie to add it to your saved list.'
    },
    {
      question: 'Can I change my profile information?',
      answer: 'Yes! Go to Profile > Account Settings to update your details.'
    },
    {
      question: 'How do I turn off notifications?',
      answer: 'Go to Profile > Notifications to customize your notification preferences.'
    }
  ];

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mt-16 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image source={icons.arrow} className="w-6 h-6 rotate-180" tintColor="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Help & Support</Text>
        </View>

        {/* Quick Actions */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Get Help</Text>
          
          <TouchableOpacity 
            className="flex-row items-center py-4 border-b border-gray-600"
            onPress={handleContactSupport}
          >
            <Image source={icons.person} className="w-5 h-5 mr-3" tintColor="#3B82F6" />
            <View className="flex-1">
              <Text className="text-white font-medium">Contact Support</Text>
              <Text className="text-gray-400 text-sm">Get help from our team</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-4 border-b border-gray-600"
            onPress={() => Alert.alert('Chat Support', 'Live chat coming soon!')}
          >
            <Image source={icons.search} className="w-5 h-5 mr-3" tintColor="#10B981" />
            <View className="flex-1">
              <Text className="text-white font-medium">Live Chat</Text>
              <Text className="text-gray-400 text-sm">Chat with us in real-time</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-4"
            onPress={() => Alert.alert('Bug Report', 'Bug reporting feature coming soon!')}
          >
            <Image source={icons.save} className="w-5 h-5 mr-3" tintColor="#EF4444" />
            <View className="flex-1">
              <Text className="text-white font-medium">Report a Bug</Text>
              <Text className="text-gray-400 text-sm">Let us know about issues</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Frequently Asked Questions</Text>
          
          {faqData.map((faq, index) => (
            <TouchableOpacity 
              key={index}
              className="py-4 border-b border-gray-600"
              onPress={() => Alert.alert(faq.question, faq.answer)}
            >
              <Text className="text-white font-medium mb-1">{faq.question}</Text>
              <Text className="text-gray-400 text-sm">{faq.answer}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">App Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Version</Text>
              <Text className="text-white">1.0.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Build</Text>
              <Text className="text-white">2024.01.15</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Platform</Text>
              <Text className="text-white">React Native</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpSupport;
