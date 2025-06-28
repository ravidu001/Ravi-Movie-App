import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { User, getCurrentUser } from '@/services/auth';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const AccountSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await getCurrentUser();
    if (userData) {
      setUser(userData);
      setFullName(userData.fullName);
      setEmail(userData.email);
    }
  };

  const handleSave = () => {
    Alert.alert('Success', 'Account settings saved!', [
      { text: 'OK', onPress: () => setIsEditing(false) }
    ]);
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mt-16 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image source={icons.arrow} className="w-6 h-6 rotate-180" tintColor="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Account Settings</Text>
        </View>

        {/* Profile Section */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-xl font-bold">
                {user?.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-blue-400 text-sm">Change Avatar</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <Text className="text-white text-lg font-bold mb-4">Personal Information</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-400 text-sm mb-2">Full Name</Text>
              <TextInput
                className="bg-gray-700 text-white p-4 rounded-lg border border-gray-600"
                value={fullName}
                onChangeText={setFullName}
                editable={isEditing}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">Email Address</Text>
              <TextInput
                className="bg-gray-700 text-white p-4 rounded-lg border border-gray-600"
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mt-6 space-x-3 gap-2">
            {isEditing ? (
              <>
                <TouchableOpacity
                  className="flex-1 bg-green-600 py-3 rounded-lg"
                  onPress={handleSave}
                >
                  <Text className="text-white text-center font-semibold">Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-600 py-3 rounded-lg"
                  onPress={() => setIsEditing(false)}
                >
                  <Text className="text-white text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg"
                onPress={() => setIsEditing(true)}
              >
                <Text className="text-white text-center font-semibold">Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Security Section */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Security</Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={() => Alert.alert('Info', 'Change password feature coming soon!')}
          >
            <Text className="text-white">Change Password</Text>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between py-4">
            <Text className="text-white">Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={emailNotifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View className="bg-red-900/20 rounded-2xl p-6 border border-red-800">
          <Text className="text-red-400 text-lg font-bold mb-4">Danger Zone</Text>
          
          <TouchableOpacity 
            className="bg-red-600 py-3 rounded-lg"
            onPress={() => Alert.alert(
              'Delete Account',
              'Are you sure? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' }
              ]
            )}
          >
            <Text className="text-white text-center font-semibold">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountSettings;