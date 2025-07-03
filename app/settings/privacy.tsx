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
  clearUserData,
  exportUserData,
  getUserPreferences,
  updateUserPreferences
} from '@/services/userSettings';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const PrivacySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Privacy states
  const [profileVisible, setProfileVisible] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const preferences = await getUserPreferences();
      
      if (preferences) {
        setProfileVisible(preferences.profile_visible);
        setAnalyticsEnabled(preferences.analytics_enabled);
        setLocationTracking(preferences.location_tracking);
        setDataSharing(preferences.data_sharing);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySetting = async (key: string, value: boolean) => {
    setSaving(true);
    try {
      const updates = { [key]: value };
      const success = await updateUserPreferences(updates);
      
      if (!success) {
        Alert.alert('Error', 'Failed to save setting. Please try again.');
        // Revert the change
        await loadPrivacySettings();
      }
    } catch (error) {
      console.error('Error saving privacy setting:', error);
      Alert.alert('Error', 'Failed to save setting');
      await loadPrivacySettings();
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
    setState(newValue); // Optimistic update
    await savePrivacySetting(key, newValue);
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'This will create a file with all your app data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: performExport }
      ]
    );
  };

  const performExport = async () => {
    setExporting(true);
    try {
      const result = await exportUserData();
      
      if (result.success) {
        Alert.alert(
          'Export Successful',
          'Your data has been exported. In a real app, this would download a file.',
          [
            {
              text: 'View Data',
              onPress: () => console.log('Exported data:', JSON.stringify(result.data, null, 2))
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'This will reset all your preferences and profile data to defaults. Your account will remain active. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: performClearData
        }
      ]
    );
  };

  const performClearData = async () => {
    setClearing(true);
    try {
      const result = await clearUserData();
      
      if (result.success) {
        Alert.alert(
          'Data Cleared',
          'Your data has been reset to defaults.',
          [
            { 
              text: 'OK', 
              onPress: () => loadPrivacySettings() // Reload to show new defaults
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to clear data');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      Alert.alert('Error', 'Failed to clear data');
    } finally {
      setClearing(false);
    }
  };

  const PrivacyRow = ({ 
    title, 
    description, 
    value, 
    onValueChange,
    warning = false
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    warning?: boolean;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-600">
      <View className="flex-1 mr-4">
        <Text className={`text-base font-medium ${warning && value ? 'text-yellow-400' : 'text-white'}`}>
          {title}
        </Text>
        <Text className="text-gray-400 text-sm mt-1">{description}</Text>
        {warning && value && (
          <Text className="text-yellow-500 text-xs mt-1">⚠️ This shares your data with third parties</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={saving}
        trackColor={{ false: '#374151', true: warning && value ? '#F59E0B' : '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
      />
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-primary">
        <Image 
          source={images.bg} 
          className="absolute w-full h-full z-0" 
          resizeMode="cover" 
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-white mt-4 text-center">Loading Privacy Settings...</Text>
        </View>
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
          <Text className="text-white text-xl font-bold">Privacy Settings</Text>
          {saving && (
            <ActivityIndicator size="small" color="#3B82F6" className="ml-4" />
          )}
        </View>

        {/* Profile Privacy */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Profile Privacy</Text>
          
          <PrivacyRow
            title="Public Profile"
            description="Allow others to see your profile and movie lists"
            value={profileVisible}
            onValueChange={(value) => handleToggle('profile_visible', profileVisible, setProfileVisible)}
          />

          {!profileVisible && (
            <View className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-800">
              <Text className="text-green-300 text-sm">
                🔒 Your profile is private. Only you can see your movie lists and activity.
              </Text>
            </View>
          )}
        </View>

        {/* Data & Analytics */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Data & Analytics</Text>
          
          <PrivacyRow
            title="Usage Analytics"
            description="Help us improve the app by sharing usage data"
            value={analyticsEnabled}
            onValueChange={(value) => handleToggle('analytics_enabled', analyticsEnabled, setAnalyticsEnabled)}
          />

          <PrivacyRow
            title="Location Tracking"
            description="Use location for movie theater recommendations"
            value={locationTracking}
            onValueChange={(value) => handleToggle('location_tracking', locationTracking, setLocationTracking)}
            warning={true}
          />

          <PrivacyRow
            title="Data Sharing"
            description="Share data with partners for better recommendations"
            value={dataSharing}
            onValueChange={(value) => handleToggle('data_sharing', dataSharing, setDataSharing)}
            warning={true}
          />

          {!analyticsEnabled && (
            <View className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
              <Text className="text-blue-300 text-sm">
                📊 Analytics disabled. We won't collect usage data to improve the app.
              </Text>
            </View>
          )}
        </View>

        {/* Data Management */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <Text className="text-white text-lg font-bold mb-4">Data Management</Text>
          
          <TouchableOpacity 
            className={`flex-row items-center justify-between py-4 border-b border-gray-600 ${exporting ? 'opacity-50' : ''}`}
            onPress={handleExportData}
            disabled={exporting}
          >
            <View className="flex-1 mr-4">
              <View className="flex-row items-center">
                <Text className="text-white">Download My Data</Text>
                {exporting && <ActivityIndicator size="small" color="#3B82F6" className="ml-2" />}
              </View>
              <Text className="text-gray-400 text-sm">Get a copy of all your data (GDPR compliance)</Text>
            </View>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-row items-center justify-between py-4 ${clearing ? 'opacity-50' : ''}`}
            onPress={handleClearData}
            disabled={clearing}
          >
            <View className="flex-1 mr-4">
              <View className="flex-row items-center">
                <Text className="text-red-400">Clear All Data</Text>
                {clearing && <ActivityIndicator size="small" color="#EF4444" className="ml-2" />}
              </View>
              <Text className="text-gray-400 text-sm">Reset all preferences and profile data</Text>
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
            onPress={() => Alert.alert('Cookie Policy', 'We use essential cookies to make our app work. We do not use tracking cookies without your consent.')}
          >
            <Text className="text-white">Cookie Policy</Text>
            <Image source={icons.arrow} className="w-4 h-4" tintColor="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Privacy Summary */}
        <View className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <Text className="text-gray-300 text-sm text-center">
            🛡️ Your privacy matters. Review these settings regularly to control how your data is used.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacySettings;