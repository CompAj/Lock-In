import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { StatusBar, useColorScheme } from 'react-native';
import '@/global.css';
import SafeScreen from '../components/SafeScreen';
import { resolvePalette } from '@/theme/colors';

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = resolvePalette(scheme);
  const mode = scheme === 'dark' ? 'dark' : 'light';

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
