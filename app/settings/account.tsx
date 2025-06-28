import {
  ActivityIndicator,
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
import {
  UserProfile,
  changePassword,
  deleteUserAccount,
  getUserPreferences,
  getUserProfile,
  pickProfileImage,
  updateProfilePicture,
  updateUserPreferences,
  updateUserProfile
} from '@/services/userSettings';

import { getProfilePictureUrl } from '@/services/userSettings';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';

const AccountSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user account data
      const userData = await getCurrentUser();
      if (!userData) {
        Alert.alert('Error', 'User not found');
        return;
      }
      setUser(userData);

      // Load user profile
      const pictureUrl = await getProfilePictureUrl();
      if (pictureUrl) {
        setProfilePictureUrl(pictureUrl);
      } 

      // Load user profile data
      const profileData = await getUserProfile();
      if (profileData) {
        setProfile(profileData);
        // Set form fields with profile data
        setDisplayName(profileData.display_name || userData.fullName);
        setBio(profileData.bio || '');
        setLocation(profileData.location || '');
      } else {
        // Set defaults if no profile exists
        setDisplayName(userData.fullName);
        setBio('');
        setLocation('');
      }

      // Load user preferences for email notifications
      const preferences = await getUserPreferences();
      if (preferences) {
        setEmailNotifications(preferences.email_notifications);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose from Gallery', onPress: selectFromGallery },
        { text: 'Remove Picture', onPress: removePicture, style: 'destructive' }
      ]
    );
  };

  const selectFromGallery = async () => {
    setUploadingImage(true);
    try {
      // Pick image
      const result = await pickProfileImage();
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to pick image');
        return;
      }

      // Upload and update profile
      const uploadResult = await updateProfilePicture(result.uri!);
      if (uploadResult.success) {
        setProfilePictureUrl(uploadResult.url || null);
        Alert.alert('Success', 'Profile picture updated successfully!');
        await loadUserData(); // Reload to get fresh data
      } else {
        Alert.alert('Error', uploadResult.error || 'Failed to update profile picture');
      }

    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const removePicture = async () => {
    setSaving(true);
    try {
      // Update profile to clear both picture URL and file ID
      const success = await updateUserProfile({
        profile_picture_url: '',
        profile_picture_file_id: '' // This is the key fix - clear the file ID too
      });

      if (success) {
        setProfilePictureUrl(null);
        Alert.alert('Success', 'Profile picture removed successfully!');
        
        // Reload user data to ensure UI is updated
        await loadUserData();
      } else {
        Alert.alert('Error', 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      Alert.alert('Error', 'Failed to remove profile picture');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setSaving(true);
    try {
      // Update profile
      const profileSuccess = await updateUserProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
      });

      // Update email notification preference
      const preferencesSuccess = await updateUserPreferences({
        email_notifications: emailNotifications,
      });

      if (profileSuccess && preferencesSuccess) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => setIsEditing(false) }
        ]);
        await loadUserData();
      } else {
        Alert.alert('Error', 'Failed to update some settings. Please try again.');
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Please confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setSaving(true);
    try {
      const result = await changePassword(currentPassword.trim(), newPassword.trim());
      
      if (result.success) {
        Alert.alert(
          'Success', 
          'Password changed successfully! Please use your new password for future logins.', 
          [
            { 
              text: 'OK', 
              onPress: () => {
                setShowPasswordForm(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }

    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setSaving(true);
    try {
      const result = await deleteUserAccount();
      
      if (result.success) {
        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted.',
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to delete account');
      }

    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Image source={images.bg} className="absolute w-full z-0" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-white mt-4">Loading account settings...</Text>
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
          <Text className="text-white text-xl font-bold">Account Settings</Text>
        </View>

        {/* Profile Section */}
        <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <View className="items-center mb-6">
            {/* Profile Picture */}
            <TouchableOpacity 
              onPress={handleProfilePictureChange}
              className="items-center mb-4"
              disabled={uploadingImage}
            >
              {profilePictureUrl ? (
                <Image 
                  source={{ uri: profilePictureUrl }}
                  className="w-24 h-24 rounded-full mb-4"
                  style={{ backgroundColor: '#3B82F6' }}
                />
              ) : (
                <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              {/* Upload indicator
              {uploadingImage && (
                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )} */}
              
              {/* Camera icon overlay */}
              <View className="absolute bottom-3 right-0 bg-blue-600 rounded-full p-2">
                <Image source={icons.search} className="w-3 h-3" tintColor="#fff" />
              </View>
            </TouchableOpacity>
            
            <Text className="text-blue-400 text-sm">
              {uploadingImage ? 'Uploading...' : 'Tap to change picture'}
            </Text>
          </View>

          {/* Personal Information */}
          <Text className="text-white text-lg font-bold mb-4">Personal Information</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-400 text-sm mb-2">Full Name</Text>
              <TextInput
                className={`text-white p-4 rounded-lg border ${
                  isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'
                }`}
                value={displayName}
                onChangeText={setDisplayName}
                editable={isEditing}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">Email Address</Text>
              <TextInput
                className="bg-gray-800 text-gray-400 p-4 rounded-lg border border-gray-700"
                value={user?.email}
                editable={false}
                placeholder="Email cannot be changed"
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-gray-500 text-xs mt-1">
                Email address cannot be changed from the app
              </Text>
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">Bio</Text>
              <TextInput
                className={`text-white p-4 rounded-lg border ${
                  isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'
                }`}
                value={bio}
                onChangeText={setBio}
                editable={isEditing}
                placeholder="Tell us about yourself"
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">Location</Text>
              <TextInput
                className={`text-white p-4 rounded-lg border ${
                  isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'
                }`}
                value={location}
                onChangeText={setLocation}
                editable={isEditing}
                placeholder="Your location"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mt-6 space-x-3">
            {isEditing ? (
              <>
                <TouchableOpacity
                  className={`flex-1 bg-green-600 py-3 rounded-lg ${saving ? 'opacity-50' : ''}`}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-center font-semibold">Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-600 py-3 rounded-lg"
                  onPress={() => {
                    setIsEditing(false);
                    loadUserData(); // Reset form
                  }}
                  disabled={saving}
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
            onPress={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Text className="text-white">Change Password</Text>
            <Image 
              key={showPasswordForm ? 'expanded' : 'collapsed'}
              source={icons.arrow} 
              className={showPasswordForm ? "w-4 h-4 rotate-90" : "w-4 h-4"} 
              tintColor="#9CA3AF" 
            />
          </TouchableOpacity>

          {/* Password Change Form */}
          {showPasswordForm && (
            <View className="mt-4 space-y-3">
              <View>
                <Text className="text-gray-400 text-sm mb-2">Current Password</Text>
                <TextInput
                  className="bg-gray-700 text-white p-4 rounded-lg border border-gray-600"
                  placeholder="Enter your current password"
                  placeholderTextColor="#9CA3AF"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View>
                <Text className="text-gray-400 text-sm mb-2">New Password</Text>
                <TextInput
                  className="bg-gray-700 text-white p-4 rounded-lg border border-gray-600"
                  placeholder="Enter new password (min. 6 characters)"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <Text className="text-red-400 text-xs mt-1">Password too short</Text>
                )}
              </View>
              
              <View>
                <Text className="text-gray-400 text-sm mb-2">Confirm New Password</Text>
                <TextInput
                  className="bg-gray-700 text-white p-4 rounded-lg border border-gray-600"
                  placeholder="Confirm your new password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <Text className="text-red-400 text-xs mt-1">Passwords don't match</Text>
                )}
              </View>
              
              <TouchableOpacity
                className={`bg-blue-600 py-3 rounded-lg mt-4 ${
                  saving || !currentPassword || !newPassword || !confirmPassword || 
                  newPassword !== confirmPassword || newPassword.length < 6 ? 'opacity-50' : ''
                }`}
                onPress={handlePasswordChange}
                disabled={
                  saving || !currentPassword || !newPassword || !confirmPassword || 
                  newPassword !== confirmPassword || newPassword.length < 6
                }
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">Update Password</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-gray-600 py-3 rounded-lg"
                onPress={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                disabled={saving}
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

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
          <Text className="text-gray-400 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </Text>
          
          <TouchableOpacity 
            className={`bg-red-600 py-3 rounded-lg ${saving ? 'opacity-50' : ''}`}
            onPress={handleDeleteAccount}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold">Delete Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountSettings;