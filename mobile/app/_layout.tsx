import React, { useEffect } from 'react';
import { Stack } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { StatusBar } from 'react-native';
import { useColorScheme } from 'nativewind';
import '@/global.css';
import SafeScreen from '../components/SafeScreen';
import { resolvePalette } from '@/theme/colors';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('dark');
  }, [setColorScheme]);

  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = resolvePalette(scheme);
  const mode = scheme;

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <GluestackUIProvider mode={mode}>
        <SafeScreen>
		<ClerkProvider tokenCache={tokenCache}>

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name='(tabs)' />
          </Stack>
		  </ClerkProvider>
        </SafeScreen>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
