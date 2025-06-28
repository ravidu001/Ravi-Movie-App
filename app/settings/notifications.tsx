import {
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const NotificationSettings = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [movieUpdates, setMovieUpdates] = useState(true);
  const [recommendations, setRecommendations] = useState(false);
  const [socialActivity, setSocialActivity] = useState(true);

  const SettingRow = ({ title, description, value, onValueChange }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-600">
      <View className="flex-1 mr-4">
        <Text className="text-white text-base font-medium">{title}</Text>
        <Text className="text-gray-400 text-sm mt-1">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#374151', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mt-16 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image source={icons.arrow} className="w-6 h-6 rotate-180" tintColor="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Notification Settings</Text>
        </View>

        {/* Push Notifications */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Push Notifications</Text>
          
          <SettingRow
            title="Enable Push Notifications"
            description="Receive notifications on your device"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />

          <SettingRow
            title="Movie Updates"
            description="Get notified about new movies and releases"
            value={movieUpdates}
            onValueChange={setMovieUpdates}
          />

          <SettingRow
            title="Recommendations"
            description="Receive personalized movie recommendations"
            value={recommendations}
            onValueChange={setRecommendations}
          />
        </View>

        {/* Email Notifications */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Email Notifications</Text>
          
          <SettingRow
            title="Email Updates"
            description="Receive updates via email"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />

          <SettingRow
            title="Social Activity"
            description="Get notified when friends share movies"
            value={socialActivity}
            onValueChange={setSocialActivity}
          />
        </View>

        {/* Notification Schedule */}
        <View className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Schedule</Text>
          
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-600">
            <View>
              <Text className="text-white">Quiet Hours</Text>
              <Text className="text-gray-400 text-sm">10:00 PM - 8:00 AM</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4">
            <View>
              <Text className="text-white">Notification Sound</Text>
              <Text className="text-gray-400 text-sm">Default</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettings;