import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useCallback } from 'react';
import { resolvePalette } from '@/theme/colors';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

export default function Index() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const router = useRouter();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = resolvePalette(scheme);

  const toggleTheme = useCallback(() => {
    setColorScheme(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setColorScheme]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '600' }}>Lock In</Text>
      <Pressable onPress={() => router.push('/(tabs)/what-to-block')} style={[styles.linkButton, { borderColor: colors.tabBorder, backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.foreground }}>What to block</Text>
      </Pressable>
      <Pressable onPress={toggleTheme} style={[styles.button, { borderColor: colors.tabBorder, backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.foreground }}>
          {scheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  linkButton: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
