import React, { useEffect } from 'react';
import { Stack } from "expo-router";
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
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name='(tabs)' />
          </Stack>
        </SafeScreen>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
