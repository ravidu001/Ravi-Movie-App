import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';

import { getCurrentUser } from './auth';

// Database configuration
const DATABASE_ID = process.env.EXPO_PUBLIC_DATABASE_ID!;
const USER_PREFERENCES_COLLECTION_ID = process.env.EXPO_PUBLIC_USER_PREFERENCES_COLLECTION_ID!;
const USER_PROFILES_COLLECTION_ID = process.env.EXPO_PUBLIC_USER_PROFILES_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const account = new Account(client); // Add this for password changes

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
    location?: string;
    date_of_birth?: string;
    favorite_genres?: string[];
}

// ==============================================
// USER PREFERENCES FUNCTIONS
// ==============================================

/**
 * Get user preferences, create default if not exists
 */
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Try to get existing preferences
        const result = await database.listDocuments(
            DATABASE_ID,
            USER_PREFERENCES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        if (result.documents.length > 0) {
            return result.documents[0] as unknown as UserPreferences;
        }

        // Create default preferences if none exist
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

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
    updates: Partial<Omit<UserPreferences, '$id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<boolean> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Get existing preferences
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

/**
 * Get user profile, create default if not exists
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Try to get existing profile
        const result = await database.listDocuments(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            [Query.equal('user_id', user.$id)]
        );

        if (result.documents.length > 0) {
            return result.documents[0] as unknown as UserProfile;
        }

        // Create default profile if none exists
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

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: UpdateProfileData): Promise<boolean> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Get existing profile
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

/**
 * Hash password (same function as in auth.ts)
 */
const hashPassword = (password: string): string => {
    return btoa(password + 'your-secret-salt');
};

/**
 * Change user password - REAL IMPLEMENTATION
 */
export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('Starting password change process...');
        
        // Validate inputs
        if (!currentPassword || !newPassword) {
            return { success: false, error: 'Both current and new password are required' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters long' };
        }

        // Step 1: Update password in Appwrite Auth
        console.log('Updating Appwrite Auth password...');
        await account.updatePassword(newPassword, currentPassword);
        console.log('Appwrite Auth password updated successfully');

        // Step 2: Update password hash in our custom users collection
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
        
        // Handle specific Appwrite errors
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

/**
 * Delete user account and all associated data
 */
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

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Get all user data
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

/**
 * Clear all user data (keep account but reset preferences)
 */
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