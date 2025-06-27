import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables
const DATABASE_ID = process.env.EXPO_PUBLIC_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.EXPO_PUBLIC_USERS_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') 
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const account = new Account(client);

// Types
export interface User {
    $id: string;
    email: string;
    fullName: string;
    createdAt: string;
    updatedAt: string;
}

export interface SignupData {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    session?: any;
    error?: string;
}

// Hash password (simple implementation - in production use bcrypt or similar)
const hashPassword = (password: string): string => {
    // This is a simple hash - in production, use proper password hashing
    return btoa(password + 'your-secret-salt');
};

// Verify password
const verifyPassword = (password: string, hashedPassword: string): boolean => {
    return hashPassword(password) === hashedPassword;
};

// Storage keys
const STORAGE_KEYS = {
    USER: 'user_data',
    SESSION: 'session_data',
    IS_AUTHENTICATED: 'is_authenticated'
};

/**
 * Sign up a new user
 */
export const signUp = async (signupData: SignupData): Promise<AuthResponse> => {
    try {
        const { fullName, email, password } = signupData;

        // Check if user already exists
        const existingUsers = await database.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('email', email)]
        );

        if (existingUsers.documents.length > 0) {
            return {
                success: false,
                error: 'User with this email already exists'
            };
        }

        // Create user account with Appwrite Auth
        const appwriteUser = await account.create(
            ID.unique(),
            email,
            password,
            fullName
        );

        // Create user document in our custom collection
        const userDocument = await database.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            ID.unique(),
            {
                email: email,
                password: hashPassword(password), // Store hashed password
                fullName: fullName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                appwriteUserId: appwriteUser.$id
            }
        );

        return {
            success: true,
            user: {
                $id: userDocument.$id,
                email: userDocument.email,
                fullName: userDocument.fullName,
                createdAt: userDocument.createdAt,
                updatedAt: userDocument.updatedAt
            }
        };

    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred during signup'
        };
    }
};

/**
 * Log in a user
 */
export const signIn = async (loginData: LoginData): Promise<AuthResponse> => {
    try {
        const { email, password } = loginData;

        try {
            await account.deleteSession('current');
        } catch (e) {

        }

        // Create session with Appwrite Auth
        const session = await account.createEmailPasswordSession(email, password);

        // Get user document from our custom collection
        const userDocuments = await database.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('email', email)]
        );

        if (userDocuments.documents.length === 0) {
            return {
                success: false,
                error: 'User not found'
            };
        }

        const userDocument = userDocuments.documents[0];

        // Verify password (additional check)
        if (!verifyPassword(password, userDocument.password)) {
            return {
                success: false,
                error: 'Invalid password'
            };
        }

        const user: User = {
            $id: userDocument.$id,
            email: userDocument.email,
            fullName: userDocument.fullName,
            createdAt: userDocument.createdAt,
            updatedAt: userDocument.updatedAt
        };

        // Store authentication data locally
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');

        return {
            success: true,
            user,
            session
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Invalid email or password'
        };
    }
};

/**
 * Log out a user
 */
export const signOut = async (): Promise<void> => {
    try {
        // Delete current session from Appwrite
        await account.deleteSession('current');
        
        // Clear local storage
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
        await AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local storage even if Appwrite logout fails
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
        await AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    }
};

/**
 * Get current user from storage
 */
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const authStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
        const session = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
        
        return authStatus === 'true' && session !== null;
    } catch (error) {
        console.error('Authentication check error:', error);
        return false;
    }
};

/**
 * Refresh session and user data
 */
export const refreshAuth = async (): Promise<AuthResponse> => {
    try {
        // Get current session from Appwrite
        const session = await account.getSession('current');
        const appwriteUser = await account.get();
        
        // Get user document from our custom collection
        const userDocuments = await database.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('email', appwriteUser.email)]
        );

        if (userDocuments.documents.length === 0) {
            return {
                success: false,
                error: 'User document not found'
            };
        }

        const userDocument = userDocuments.documents[0];
        const user: User = {
            $id: userDocument.$id,
            email: userDocument.email,
            fullName: userDocument.fullName,
            createdAt: userDocument.createdAt,
            updatedAt: userDocument.updatedAt
        };

        // Update local storage
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');

        return {
            success: true,
            user,
            session
        };

    } catch (error) {
        console.error('Refresh auth error:', error);
        // Clear authentication if refresh fails
        await signOut();
        return {
            success: false,
            error: 'Session expired'
        };
    }
};