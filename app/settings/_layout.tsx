import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function SettingsLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0D23" />
      <Stack>
        <Stack.Screen
          name="account"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}