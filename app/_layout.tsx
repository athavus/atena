import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor('#1a1a1a');
      RNStatusBar.setBarStyle('light-content');
    }
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
