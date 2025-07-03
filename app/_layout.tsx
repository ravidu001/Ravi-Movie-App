import './globals.css';

import { SavedMoviesProvider } from '@/contexts/SavedMoviesContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { Stack } from "expo-router";
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <SessionProvider>
      <SavedMoviesProvider>
        <StatusBar hidden={true} />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="movies/[id]"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </SavedMoviesProvider>
    </SessionProvider>
  );
}