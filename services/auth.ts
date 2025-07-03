import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables
const DATABASE_ID = process.env.EXPO_PUBLIC_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.EXPO_PUBLIC_USERS_COLLECTION_ID!;
const SESSIONS_COLLECTION_ID = process.env.EXPO_PUBLIC_SESSIONS_COLLECTION_ID!; // Add this to your .env

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

export interface UserSession {
    $id?: string;
    userId: string;
    sessionToken: string;
    expiresAt: string;
    createdAt: string;
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
    return btoa(password + 'your-secret-salt');
};

// Verify password
const verifyPassword = (password: string, hashedPassword: string): boolean => {
    return hashPassword(password) === hashedPassword;
};

// Generate session token
const generateSessionToken = (): string => {
    return btoa(Date.now() + Math.random().toString(36));
};

// Storage keys
const STORAGE_KEYS = {
    USER: 'user_data',
    SESSION_TOKEN: 'session_token',
    SESSION_EXPIRES: 'session_expires',
    IS_AUTHENTICATED: 'is_authenticated'
};

/**
 * Create a new session in the database
 */
const createSession = async (userId: string): Promise<{ sessionToken: string; expiresAt: string }> => {
    try {
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
        
        await database.createDocument(
            DATABASE_ID,
            SESSIONS_COLLECTION_ID,
            ID.unique(),
            {
                userId,
                sessionToken,
                expiresAt,
                createdAt: new Date().toISOString()
            }
        );

        console.log('✅ Session created successfully');
        return { sessionToken, expiresAt };
    } catch (error) {
        console.error('❌ Error creating session:', error);
        throw error;
    }
};

/**
 * Validate session token
 */
export const validateSession = async (sessionToken: string): Promise<{ valid: boolean; userId?: string }> => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            SESSIONS_COLLECTION_ID,
            [
                Query.equal('sessionToken', sessionToken),
                Query.greaterThan('expiresAt', new Date().toISOString())
            ]
        );

        if (result.documents.length > 0) {
            const session = result.documents[0] as unknown as UserSession;
            console.log('✅ Session valid for user:', session.userId);
            return { valid: true, userId: session.userId };
        }

        console.log('❌ Session invalid or expired');
        return { valid: false };
    } catch (error) {
        console.error('❌ Error validating session:', error);
        return { valid: false };
    }
};

/**
 * Clean up expired sessions
 */
const cleanupExpiredSessions = async (userId?: string): Promise<void> => {
    try {
        const queries = [Query.lessThan('expiresAt', new Date().toISOString())];
        if (userId) {
            queries.push(Query.equal('userId', userId));
        }

        const expiredSessions = await database.listDocuments(
            DATABASE_ID,
            SESSIONS_COLLECTION_ID,
            queries
        );

        for (const session of expiredSessions.documents) {
            await database.deleteDocument(
                DATABASE_ID,
                SESSIONS_COLLECTION_ID,
                session.$id
            );
        }

        console.log('✅ Cleaned up expired sessions:', expiredSessions.documents.length);
    } catch (error) {
        console.error('❌ Error cleaning up sessions:', error);
    }
};

/**
 * Sign up a new user with session creation
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
                password: hashPassword(password),
                fullName: fullName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                appwriteUserId: appwriteUser.$id
            }
        );

        console.log('✅ User created successfully');

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
        console.error('❌ Signup error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred during signup'
        };
    }
};

/**
 * Log in a user with session creation
 */
export const signIn = async (loginData: LoginData): Promise<AuthResponse> => {
    try {
        const { email, password } = loginData;

        // Clean up any existing sessions first
        try {
            await account.deleteSession('current');
        } catch (e) {
            // Ignore if no session exists
        }

        // Create session with Appwrite Auth
        const session = await account.createEmailPasswordSession(email, password);
        
        // Get user info from Appwrite
        const currentUser = await account.get();

        const user: User = {
            $id: currentUser.$id,
            email: currentUser.email,
            fullName: currentUser.name || email.split('@')[0],
            createdAt: currentUser.$createdAt,
            updatedAt: currentUser.$updatedAt
        };

        // Create custom session record in our sessions collection
        const { sessionToken, expiresAt } = await createSession(user.$id);

        // Store authentication data locally
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_EXPIRES, expiresAt);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');

        // Clean up old expired sessions for this user
        await cleanupExpiredSessions(user.$id);

        console.log('✅ Login successful with Appwrite session and custom session record');

        return {
            success: true,
            user,
            session: { appwriteSession: session, sessionToken, expiresAt }
        };

    } catch (error) {
        console.error('❌ Login error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Invalid email or password'
        };
    }
};

/**
 * Log out a user and clean up sessions
 */
export const signOut = async (): Promise<void> => {
    try {
        // Get current session token
        const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        
        if (sessionToken) {
            // Delete session from database
            const sessions = await database.listDocuments(
                DATABASE_ID,
                SESSIONS_COLLECTION_ID,
                [Query.equal('sessionToken', sessionToken)]
            );

            for (const session of sessions.documents) {
                await database.deleteDocument(
                    DATABASE_ID,
                    SESSIONS_COLLECTION_ID,
                    session.$id
                );
            }
        }

        // Delete current session from Appwrite
        await account.deleteSession('current');
        
        // Clear local storage
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRES);
        await AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);

        console.log('✅ Logout successful');
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Clear local storage even if server logout fails
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRES);
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
        console.error('❌ Get current user error:', error);
        return null;
    }
};

/**
 * Check if user is authenticated with session validation
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const authStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
        const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        
        if (authStatus !== 'true' || !sessionToken) {
            console.log('⚠️ No auth status or session token found');
            return false;
        }

        // Check if session expires is available (for backward compatibility)
        const sessionExpires = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_EXPIRES);
        if (sessionExpires) {
            // Check if session is expired locally first
            if (new Date() > new Date(sessionExpires)) {
                console.log('⚠️ Session expired locally');
                await signOut();
                return false;
            }
        }

        // Validate session with server
        const validation = await validateSession(sessionToken);
        if (!validation.valid) {
            console.log('⚠️ Session invalid on server');
            await signOut();
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ Authentication check error:', error);
        return false;
    }
};

/**
 * Refresh session and user data
 */
export const refreshAuth = async (): Promise<AuthResponse> => {
    try {
        const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        
        if (!sessionToken) {
            return { success: false, error: 'No session token found' };
        }

        // Validate current session
        const validation = await validateSession(sessionToken);
        if (!validation.valid) {
            await signOut();
            return { success: false, error: 'Session expired' };
        }

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

        console.log('✅ Auth refreshed successfully');

        return {
            success: true,
            user,
            session
        };

    } catch (error) {
        console.error('❌ Refresh auth error:', error);
        // Clear authentication if refresh fails
        await signOut();
        return {
            success: false,
            error: 'Session expired'
        };
    }
};

/**
 * Get all active sessions for current user
 */
export const getUserSessions = async (): Promise<UserSession[]> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            console.log('⚠️ No current user found for getting sessions');
            return [];
        }

        console.log('🔍 Getting sessions for user:', user.$id);
        
        const result = await database.listDocuments(
            DATABASE_ID,
            SESSIONS_COLLECTION_ID,
            [
                Query.equal('userId', user.$id),
                Query.greaterThan('expiresAt', new Date().toISOString()),
                Query.orderDesc('createdAt')
            ]
        );

        console.log('✅ Found sessions:', result.documents.length);
        return result.documents as unknown as UserSession[];
    } catch (error) {
        console.error('❌ Error getting user sessions:', error);
        return [];
    }
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId: string): Promise<boolean> => {
    try {
        await database.deleteDocument(
            DATABASE_ID,
            SESSIONS_COLLECTION_ID,
            sessionId
        );

        console.log('✅ Session revoked:', sessionId);
        return true;
    } catch (error) {
        console.error('❌ Error revoking session:', error);
        return false;
    }
};