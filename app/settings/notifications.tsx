import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  UserPreferences,
  getUserPreferences,
  updateUserPreferences
} from '@/services/userSettings';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Individual state for each setting for better UX
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [movieUpdates, setMovieUpdates] = useState(true);
  const [recommendations, setRecommendations] = useState(false);
  const [socialActivity, setSocialActivity] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [notificationSound, setNotificationSound] = useState('default');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const userPrefs = await getUserPreferences();
      
      if (userPrefs) {
        setPreferences(userPrefs);
        setPushNotifications(userPrefs.push_notifications);
        setEmailNotifications(userPrefs.email_notifications);
        setMovieUpdates(userPrefs.movie_updates);
        setRecommendations(userPrefs.recommendations);
        setSocialActivity(userPrefs.social_activity);
        setQuietHoursStart(userPrefs.quiet_hours_start);
        setQuietHoursEnd(userPrefs.quiet_hours_end);
        setNotificationSound(userPrefs.notification_sound);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const savePreference = async (key: string, value: boolean | string) => {
    setSaving(true);
    try {
      const updates = { [key]: value };
      const success = await updateUserPreferences(updates);
      
      if (!success) {
        Alert.alert('Error', 'Failed to save setting. Please try again.');
        // Revert the change
        await loadPreferences();
      }
    } catch (error) {
      console.error('Error saving preference:', error);
      Alert.alert('Error', 'Failed to save setting');
      // Revert the change
      await loadPreferences();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    key: string,
    currentValue: boolean,
    setState: (value: boolean) => void
  ) => {
    const newValue = !currentValue;
    setState(newValue); // Optimistic update for better UX
    await savePreference(key, newValue);
  };

  const SettingRow = ({ 
    title, 
    description, 
    value, 
    onValueChange,
    disabled = false
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View className={`flex-row items-center justify-between py-4 border-b border-gray-600 ${disabled ? 'opacity-50' : ''}`}>
      <View className="flex-1 mr-4">
        <Text className="text-white text-base font-medium">{title}</Text>
        <Text className="text-gray-400 text-sm mt-1">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || saving}
        trackColor={{ false: '#374151', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
      />
    </View>
  );

  const handleQuietHours = () => {
    Alert.alert(
      'Quiet Hours',
      `Current quiet hours: ${quietHoursStart} - ${quietHoursEnd}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change Time', 
          onPress: () => Alert.alert('Info', 'Time picker coming in future update!')
        }
      ]
    );
  };

  const handleNotificationSound = () => {
    Alert.alert(
      'Notification Sound',
      'Choose your notification sound:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Default', 
          onPress: async () => {
            setNotificationSound('default');
            await savePreference('notification_sound', 'default');
          }
        },
        { 
          text: 'Chime', 
          onPress: async () => {
            setNotificationSound('chime');
            await savePreference('notification_sound', 'chime');
          }
        },
        { 
          text: 'Bell', 
          onPress: async () => {
            setNotificationSound('bell');
            await savePreference('notification_sound', 'bell');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Image source={images.bg} className="absolute w-full z-0" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-white mt-4">Loading notification settings...</Text>
      </View>
    );
  }

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
          {saving && (
            <ActivityIndicator size="small" color="#3B82F6" className="ml-4" />
          )}
        </View>

        {/* Push Notifications */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Push Notifications</Text>
          
          <SettingRow
            title="Enable Push Notifications"
            description="Receive notifications on your device"
            value={pushNotifications}
            onValueChange={(value) => handleToggle('push_notifications', pushNotifications, setPushNotifications)}
          />

          <SettingRow
            title="Movie Updates"
            description="Get notified about new movies and releases"
            value={movieUpdates}
            onValueChange={(value) => handleToggle('movie_updates', movieUpdates, setMovieUpdates)}
            disabled={!pushNotifications}
          />

          <SettingRow
            title="Recommendations"
            description="Receive personalized movie recommendations"
            value={recommendations}
            onValueChange={(value) => handleToggle('recommendations', recommendations, setRecommendations)}
            disabled={!pushNotifications}
          />

          <SettingRow
            title="Social Activity"
            description="Get notified when friends share movies"
            value={socialActivity}
            onValueChange={(value) => handleToggle('social_activity', socialActivity, setSocialActivity)}
            disabled={!pushNotifications}
          />
        </View>

        {/* Email Notifications */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Email Notifications</Text>
          
          <SettingRow
            title="Email Updates"
            description="Receive updates via email"
            value={emailNotifications}
            onValueChange={(value) => handleToggle('email_notifications', emailNotifications, setEmailNotifications)}
          />

          {emailNotifications && (
            <View className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
              <Text className="text-blue-300 text-sm">
                📧 Email notifications will be sent to: {preferences?.user_id && 'your registered email'}
              </Text>
            </View>
          )}
        </View>

        {/* Notification Schedule */}
        <View className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Schedule & Sounds</Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-gray-600"
            onPress={handleQuietHours}
            disabled={!pushNotifications}
          >
            <View className={pushNotifications ? '' : 'opacity-50'}>
              <Text className="text-white">Quiet Hours</Text>
              <Text className="text-gray-400 text-sm">{quietHoursStart} - {quietHoursEnd}</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-4"
            onPress={handleNotificationSound}
            disabled={!pushNotifications}
          >
            <View className={pushNotifications ? '' : 'opacity-50'}>
              <Text className="text-white">Notification Sound</Text>
              <Text className="text-gray-400 text-sm capitalize">{notificationSound}</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        {!pushNotifications && (
          <View className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-800">
            <Text className="text-yellow-300 text-sm text-center">
              ⚠️ Push notifications are disabled. Enable them to receive app notifications.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationSettings;