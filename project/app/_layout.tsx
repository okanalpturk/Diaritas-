import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { useAdMob } from '@/hooks/useAdMob';

export default function RootLayout() {
  useFrameworkReady();
  useAdMob(); // Initialize AdMob

  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </ProfileProvider>
  );
}