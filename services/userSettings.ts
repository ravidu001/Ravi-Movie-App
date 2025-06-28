import * as ImagePicker from 'expo-image-picker';

import { Account, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

import { getCurrentUser } from './auth';

// Database configuration
const DATABASE_ID = process.env.EXPO_PUBLIC_DATABASE_ID!;
const USER_PREFERENCES_COLLECTION_ID = process.env.EXPO_PUBLIC_USER_PREFERENCES_COLLECTION_ID!;
const USER_PROFILES_COLLECTION_ID = process.env.EXPO_PUBLIC_USER_PROFILES_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const account = new Account(client); 
const storage = new Storage(client);

const PROFILE_PICTURES_BUCKET_ID = process.env.EXPO_PUBLIC_PROFILE_PICTURES_BUCKET_ID || 'profile_pictures';

// ==============================================
// TYPES & INTERFACES
// ==============================================

export interface UserPreferences {
    $id?: string;
    user_id: string;
    push_notifications: boolean;
    email_notifications: boolean;
    movie_updates: boolean;
    recommendations: boolean;
    social_activity: boolean;
    profile_visible: boolean;
    analytics_enabled: boolean;
    location_tracking: boolean;
    data_sharing: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    notification_sound: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserProfile {
    $id?: string;
    user_id: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
    profile_picture_url?: string;
    profile_picture_file_id?: string;
    location?: string;
    date_of_birth?: string;
    favorite_genres?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface UpdateProfileData {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    profile_picture_url?: string;
    profile_picture_file_id?: string;
    location?: string;
    date_of_birth?: string;
    favorite_genres?: string[];
}

// ==============================================
// PROFILE PICTURE FUNCTIONS - FINAL WORKING VERSION
// ==============================================

/**
 * Request permission for camera/gallery access
 */
export const requestImagePermissions = async (): Promise<boolean> => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
    }
};

/**
 * Pick image from gallery
 */
export const pickProfileImage = async (): Promise<{ success: boolean; uri?: string; error?: string }> => {
    try {
        const hasPermission = await requestImagePermissions();
        if (!hasPermission) {
            return { success: false, error: 'Camera/Gallery permission is required' };
        }

        // Use array format to avoid deprecation warning
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Alternative to avoid deprecation
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: false,
        });

        if (result.canceled) {
            return { success: false, error: 'Image selection cancelled' };
        }

        return { success: true, uri: result.assets[0].uri };
    } catch (error) {
        console.error('Error picking image:', error);
        return { success: false, error: 'Failed to pick image' };
    }
};

/**
 * Upload profile picture - FINAL VERSION
 */
export const uploadProfilePicture = async (imageUri: string): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> => {
    try {
        console.log('🔄 Starting upload process...');
        
        // Step 1: Check user authentication
        const user = await getCurrentUser();
        if (!user) {
            console.log('❌ User not authenticated');
            return { success: false, error: 'User not authenticated' };
        }
        console.log('✅ User authenticated:', user.$id);

        // Step 2: Validate image URI
        if (!imageUri) {
            console.log('❌ No image URI provided');
            return { success: false, error: 'No image URI provided' };
        }
        console.log('✅ Image URI:', imageUri);

        // Step 3: Create filename
        const fileName = `profile_${user.$id}_${Date.now()}.jpg`;
        console.log('✅ Generated filename:', fileName);

        // Step 4: Test if we can access the image URI
        try {
            const testResponse = await fetch(imageUri, { method: 'HEAD' });
            console.log('✅ Image URI accessible, status:', testResponse.status);
        } catch (uriError) {
            console.log('❌ Image URI not accessible:', uriError);
            return { success: false, error: 'Selected image is not accessible' };
        }

        // Step 5: Create file object with multiple formats to try
        const fileFormats = [
            // Format 1: Basic React Native format
            {
                name: fileName,
                type: 'image/jpg',
                uri: imageUri,
            },
            // Format 2: With explicit size
            {
                name: fileName,
                type: 'image/jpg',
                uri: imageUri,
                size: 1024 * 1024, // 1MB default
            },
            // Format 3: Alternative MIME type
            {
                name: fileName,
                type: 'image/jpg',
                uri: imageUri,
            }
        ];

        let uploadResult = null;
        let lastError = null;

        // Step 6: Try different file formats
        for (let i = 0; i < fileFormats.length; i++) {
            const fileFormat = fileFormats[i];
            console.log(`🔄 Trying file format ${i + 1}:`, fileFormat);

            try {
                uploadResult = await storage.createFile(
                    PROFILE_PICTURES_BUCKET_ID,
                    ID.unique(),
                    fileFormat as any
                );

                if (uploadResult && uploadResult.$id) {
                    console.log('✅ Upload successful with format', i + 1, 'File ID:', uploadResult.$id);
                    break;
                } else {
                    console.log('❌ Upload returned invalid result:', uploadResult);
                }
            } catch (formatError) {
                console.log(`❌ Format ${i + 1} failed:`, formatError);
                lastError = formatError;
                continue;
            }
        }

        // Step 7: Check if upload was successful
        if (!uploadResult || !uploadResult.$id) {
            console.log('❌ All upload formats failed. Last error:', lastError);
            return { 
                success: false, 
                error: `Upload failed: ${lastError || 'Unknown error'}` 
            };
        }

        console.log('✅ File uploaded successfully, ID:', uploadResult.$id);

        // Step 8: Update user profile
        console.log('🔄 Updating user profile...');
        const updateSuccess = await updateUserProfile({
            profile_picture_file_id: uploadResult.$id,
        });

        if (!updateSuccess) {
            console.log('❌ Failed to update user profile');
            return { success: false, error: 'Failed to update profile with file ID' };
        }

        console.log('✅ Profile updated successfully');

        return { 
            success: true, 
            fileId: uploadResult.$id,
            url: `File uploaded: ${uploadResult.$id}`
        };

    } catch (error) {
        console.error('❌ Unexpected upload error:', error);
        
        // More detailed error information
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return { 
            success: false, 
            error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
};

/**
 * Alternative upload method using FormData (fallback)
 */
export const uploadProfilePictureAlternative = async (imageUri: string): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> => {
    try {
        console.log('🔄 Trying alternative upload method...');
        
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const fileName = `profile_${user.$id}_${Date.now()}.jpg`;
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('fileId', ID.unique());
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: fileName,
        } as any);

        // Use REST API directly
        const endpoint = 'https://nyc.cloud.appwrite.io/v1';
        const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
        
        const response = await fetch(
            `${endpoint}/storage/buckets/${PROFILE_PICTURES_BUCKET_ID}/files`,
            {
                method: 'POST',
                headers: {
                    'X-Appwrite-Project': projectId!,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ REST API upload failed:', response.status, errorText);
            return { success: false, error: `Upload failed: ${response.status}` };
        }

        const uploadResult = await response.json();
        console.log('✅ Alternative upload successful:', uploadResult.$id);

        // Update profile
        await updateUserProfile({
            profile_picture_file_id: uploadResult.$id,
        });

        return { 
            success: true, 
            fileId: uploadResult.$id,
            url: `File uploaded: ${uploadResult.$id}`
        };

    } catch (error) {
        console.error('❌ Alternative upload error:', error);
        return { success: false, error: `Alternative upload failed: ${error}` };
    }
};


/**
 * Get profile picture URL - FINAL VERSION (NO TRANSFORMATIONS)
 */
export const getProfilePictureUrl = async (): Promise<string | null> => {
    try {
        const profile = await getUserProfile();
        if (!profile?.profile_picture_file_id) {
            return null;
        }

        // Use the exact URL format from your logs that works
        const url = `https://nyc.cloud.appwrite.io/v1/storage/buckets/profile_pictures/files/${profile.profile_picture_file_id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
        
        console.log('✅ Profile picture URL:', url);
        return url;

    } catch (error) {
        console.error('❌ Error getting profile picture:', error);
        return null;
    }
};

export const getProfilePictureUrlDirect = async (): Promise<string | null> => {
    try {
        const profile = await getUserProfile();
        if (!profile?.profile_picture_file_id) {
            return null;
        }

        // Direct URL construction using your working URL format
        const endpoint = 'https://nyc.cloud.appwrite.io/v1';
        const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
        
        const directUrl = `${endpoint}/storage/buckets/${PROFILE_PICTURES_BUCKET_ID}/files/${profile.profile_picture_file_id}/view?project=${projectId}`;
        
        console.log('✅ Direct profile picture URL:', directUrl);
        return directUrl;

    } catch (error) {
        console.error('❌ Error getting direct profile picture URL:', error);
        return null;
    }
};

/**
 * Update profile picture - FINAL VERSION
 */
export const updateProfilePicture = async (imageUri: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
        console.log('🚀 Starting profile picture update...');

        // Method 1: Try the main upload function
        let result = await uploadProfilePicture(imageUri);
        
        if (result.success) {
            console.log('✅ Main upload method succeeded');
            return result;
        }

        console.log('⚠️ Main upload failed, trying alternative method...');
        
        // Method 2: Try the alternative upload method
        result = await uploadProfilePictureAlternative(imageUri);
        
        if (result.success) {
            console.log('✅ Alternative upload method succeeded');
            return result;
        }

        console.log('❌ Both upload methods failed');
        return {
            success: false,
            error: `All upload methods failed. Main error: ${result.error}`
        };

    } catch (error) {
        console.error('❌ Critical error in updateProfilePicture:', error);
        return { 
            success: false, 
            error: 'Critical error during profile picture update' 
        };
    }
};

/**
 * Delete profile picture from storage
 */
export const deleteProfilePicture = async (fileId: string): Promise<boolean> => {
    try {
        await storage.deleteFile(PROFILE_PICTURES_BUCKET_ID, fileId);
        return true;
    } catch (error) {
        console.error('Error deleting profile picture:', error);
        return false;
    }
};

// ==============================================
// USER PREFERENCES FUNCTIONS
// ==============================================

export const getUserPreferences = async (): Promise<UserPreferences | null> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const result = await database.listDocuments(
            DATABASE_ID,
            USER_PREFERENCES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        if (result.documents.length > 0) {
            return result.documents[0] as unknown as UserPreferences;
        }

        // Create default preferences
        const defaultPreferences: Omit<UserPreferences, '$id' | 'created_at' | 'updated_at'> = {
            user_id: user.$id,
            push_notifications: true,
            email_notifications: true,
            movie_updates: true,
            recommendations: false,
            social_activity: true,
            profile_visible: true,
            analytics_enabled: true,
            location_tracking: false,
            data_sharing: false,
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00',
            notification_sound: 'default'
        };

        const newPreferences = await database.createDocument(
            DATABASE_ID,
            USER_PREFERENCES_COLLECTION_ID,
            ID.unique(),
            {
                ...defaultPreferences,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        );

        return newPreferences as unknown as UserPreferences;
    } catch (error) {
        console.error('Error getting user preferences:', error);
        return null;
    }
};

export const updateUserPreferences = async (
    updates: Partial<Omit<UserPreferences, '$id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<boolean> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const result = await database.listDocuments(
            DATABASE_ID,
            USER_PREFERENCES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        if (result.documents.length === 0) {
            throw new Error('User preferences not found');
        }

        const preferencesId = result.documents[0].$id;

        await database.updateDocument(
            DATABASE_ID,
            USER_PREFERENCES_COLLECTION_ID,
            preferencesId,
            {
                ...updates,
                updated_at: new Date().toISOString()
            }
        );

        return true;
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return false;
    }
};

// ==============================================
// USER PROFILE FUNCTIONS
// ==============================================

export const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const result = await database.listDocuments(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        if (result.documents.length > 0) {
            return result.documents[0] as unknown as UserProfile;
        }

        // Create default profile
        const defaultProfile: Omit<UserProfile, '$id' | 'created_at' | 'updated_at'> = {
            user_id: user.$id,
            display_name: user.fullName,
            bio: '',
            avatar_url: '',
            location: '',
            favorite_genres: []
        };

        const newProfile = await database.createDocument(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            ID.unique(),
            {
                ...defaultProfile,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        );

        return newProfile as unknown as UserProfile;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
};

export const updateUserProfile = async (updates: UpdateProfileData): Promise<boolean> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const result = await database.listDocuments(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        if (result.documents.length === 0) {
            throw new Error('User profile not found');
        }

        const profileId = result.documents[0].$id;

        await database.updateDocument(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            profileId,
            {
                ...updates,
                updated_at: new Date().toISOString()
            }
        );

        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        return false;
    }
};

// ==============================================
// ACCOUNT MANAGEMENT FUNCTIONS
// ==============================================

const hashPassword = (password: string): string => {
    return btoa(password + 'your-secret-salt');
};

export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('Starting password change process...');
        
        if (!currentPassword || !newPassword) {
            return { success: false, error: 'Both current and new password are required' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters long' };
        }

        // Update Appwrite Auth password
        console.log('Updating Appwrite Auth password...');
        await account.updatePassword(newPassword, currentPassword);
        console.log('Appwrite Auth password updated successfully');

        // Update custom users collection
        console.log('Updating custom users collection...');
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('User not found');
        }

        const hashedNewPassword = hashPassword(newPassword);
        
        await database.updateDocument(
            DATABASE_ID,
            process.env.EXPO_PUBLIC_USERS_COLLECTION_ID!,
            user.$id,
            {
                password: hashedNewPassword,
                updatedAt: new Date().toISOString()
            }
        );
        
        console.log('Custom users collection updated successfully');
        return { success: true };

    } catch (error: any) {
        console.error('Error changing password:', error);
        
        if (error.code === 401) {
            return { success: false, error: 'Current password is incorrect' };
        } else if (error.code === 400) {
            return { success: false, error: 'Invalid password format' };
        } else if (error.message?.includes('Invalid credentials')) {
            return { success: false, error: 'Current password is incorrect' };
        } else {
            return { 
                success: false, 
                error: `Failed to change password: ${error.message || 'Unknown error'}` 
            };
        }
    }
};

export const deleteUserAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Delete user preferences
        const preferencesResult = await database.listDocuments(
            DATABASE_ID,
            USER_PREFERENCES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        for (const pref of preferencesResult.documents) {
            await database.deleteDocument(
                DATABASE_ID,
                USER_PREFERENCES_COLLECTION_ID,
                pref.$id
            );
        }

        // Delete user profile
        const profileResult = await database.listDocuments(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        for (const profile of profileResult.documents) {
            await database.deleteDocument(
                DATABASE_ID,
                USER_PROFILES_COLLECTION_ID,
                profile.$id
            );
        }

        // Delete user from users collection
        await database.deleteDocument(
            DATABASE_ID,
            process.env.EXPO_PUBLIC_USERS_COLLECTION_ID!,
            user.$id
        );

        return { success: true };
    } catch (error) {
        console.error('Error deleting user account:', error);
        return { success: false, error: 'Failed to delete account' };
    }
};

// ==============================================
// DATA EXPORT FUNCTIONS
// ==============================================

export const exportUserData = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const [preferences, profile] = await Promise.all([
            getUserPreferences(),
            getUserProfile()
        ]);

        const exportData = {
            user_account: {
                id: user.$id,
                email: user.email,
                full_name: user.fullName,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            },
            preferences,
            profile,
            export_date: new Date().toISOString(),
            export_version: '1.0'
        };

        return { success: true, data: exportData };
    } catch (error) {
        console.error('Error exporting user data:', error);
        return { success: false, error: 'Failed to export user data' };
    }
};

export const clearUserData = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Reset preferences to defaults
        const defaultPreferences = {
            push_notifications: true,
            email_notifications: true,
            movie_updates: true,
            recommendations: false,
            social_activity: true,
            profile_visible: true,
            analytics_enabled: true,
            location_tracking: false,
            data_sharing: false,
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00',
            notification_sound: 'default'
        };

        await updateUserPreferences(defaultPreferences);

        // Reset profile to basics
        const basicProfile = {
            display_name: user.fullName,
            bio: '',
            avatar_url: '',
            location: '',
            favorite_genres: []
        };

        await updateUserProfile(basicProfile);

        return { success: true };
    } catch (error) {
        console.error('Error clearing user data:', error);
        return { success: false, error: 'Failed to clear user data' };
    }
};