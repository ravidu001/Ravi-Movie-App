import {
  Alert,
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

const PrivacySettings = () => {
  const [profileVisible, setProfileVisible] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'This will remove all your app data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Data cleared successfully!')
        }
      ]
    );
  };

  const PrivacyRow = ({ title, description, value, onValueChange }: {
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
          <Text className="text-white text-xl font-bold">Privacy Settings</Text>
        </View>

        {/* Profile Privacy */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Profile Privacy</Text>
          
          <PrivacyRow
            title="Public Profile"
            description="Allow others to see your profile and movie lists"
            value={profileVisible}
            onValueChange={setProfileVisible}
          />
        </View>

        {/* Data & Analytics */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Data & Analytics</Text>
          
          <PrivacyRow
            title="Usage Analytics"
            description="Help us improve the app by sharing usage data"
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
          />

          <PrivacyRow
            title="Location Tracking"
            description="Use location for movie theater recommendations"
            value={locationTracking}
            onValueChange={setLocationTracking}
          />

          <PrivacyRow
            title="Data Sharing"
            description="Share data with partners for better recommendations"
            value={dataSharing}
            onValueChange={setDataSharing}
          />
        </View>

        {/* Data Management */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Data Management</Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={() => Alert.alert('Info', 'Download data feature coming soon!')}
          >
            <View>
              <Text className="text-white">Download My Data</Text>
              <Text className="text-gray-400 text-sm">Get a copy of your data</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-4"
            onPress={handleClearData}
          >
            <View>
              <Text className="text-red-400">Clear All Data</Text>
              <Text className="text-gray-400 text-sm">Remove all your app data</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Legal</Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={() => router.push('/settings/terms')}
          >
            <Text className="text-white">Privacy Policy</Text>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-4"
            onPress={() => router.push('/settings/terms')}
          >
            <Text className="text-white">Cookie Policy</Text>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacySettings;