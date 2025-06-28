import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { User, getCurrentUser, signOut } from '@/services/auth';
import { router, useFocusEffect } from 'expo-router';

import { getProfilePictureUrl } from '@/services/userSettings';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Load user data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  // Reload data when screen comes into focus (after returning from settings)
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);

      // Load profile picture
      const pictureUrl = await getProfilePictureUrl();
      setProfilePictureUrl(pictureUrl);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      Alert.alert('Success', 'Logged out successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(auth)/login');
          },
        },
      ]);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading spinner while fetching user data
  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Image source={images.bg} className="absolute w-full z-0" />
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-white mt-4">Loading profile...</Text>
      </View>
    );
  }

  // Show error message if user data couldn't be loaded
  if (!user) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-5">
        <Image source={images.bg} className="absolute w-full z-0" />
        <Text className="text-white text-lg text-center mb-4">
          Unable to load profile information
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={loadUserData}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="w-full flex-row justify-center mt-20 items-center mb-8">
          <Image source={icons.logo} className="w-12 h-10" />
        </View>

        {/* Profile Card */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          {/* Avatar Section */}
          <View className="items-center mb-6">
            {profilePictureUrl ? (
              <Image 
                source={{ uri: profilePictureUrl }}
                className="w-24 h-24 rounded-full mb-4"
                style={{ backgroundColor: '#3B82F6' }}
              />
            ) : (
              <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text className="text-white text-xl font-bold">{user.fullName}</Text>
            <Text className="text-gray-400 text-sm">{user.email}</Text>
          </View>

          {/* User Info */}
          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-600">
              <Text className="text-gray-400">Member Since</Text>
              <Text className="text-white">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-600">
              <Text className="text-gray-400">Account Status</Text>
              <View className="bg-green-600 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">Active</Text>
              </View>
            </View>

            {profilePictureUrl && (
              <View className="flex-row items-center justify-between py-3 border-b border-gray-600">
                <Text className="text-gray-400">Profile Picture</Text>
                <View className="bg-blue-600 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-semibold">Custom</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Settings Options */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Settings</Text>
          
          {/* Account Settings */}
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={() => router.push('/settings/account')}
          >
            <View className="flex-row items-center">
              <Image source={icons.person} className="w-5 h-5 mr-3" tintColor="#9CA3AF" />
              <Text className="text-white">Account Settings</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={() => router.push('/settings/notifications')}
          >
            <View className="flex-row items-center">
              <Image source={icons.save} className="w-5 h-5 mr-3" tintColor="#9CA3AF" />
              <Text className="text-white">Notifications</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          {/* Privacy */}
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4"
            onPress={() => router.push('/settings/privacy')}
          >
            <View className="flex-row items-center">
              <Image source={icons.search} className="w-5 h-5 mr-3" tintColor="#9CA3AF" />
              <Text className="text-white">Privacy</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">About</Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={() => Alert.alert('App Version', 'Movie App v1.0.0')}
          >
            <Text className="text-white">App Version</Text>
            <Text className="text-gray-400">1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={() => router.push('/settings/help')}
          >
            <Text className="text-white">Help & Support</Text>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-4"
            onPress={() => router.push('/settings/terms')}
          >
            <Text className="text-white">Terms of Service</Text>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className={`bg-red-600 py-4 rounded-xl flex-row items-center justify-center ${
            isLoggingOut ? 'opacity-50' : ''
          }`}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#fff" className="mr-2" />
          ) : (
            <Image source={icons.arrow} className="w-5 h-5 mr-2 rotate-180" tintColor="#fff" />
          )}
          <Text className="text-white font-semibold text-lg">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Profile;