import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useCallback } from 'react';
import { resolvePalette } from '@/theme/colors';
import { useColorScheme } from 'nativewind';

export default function index() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = resolvePalette(scheme);

  const toggleTheme = useCallback(() => {
    setColorScheme(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setColorScheme]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={{ color: colors.foreground }}>hello</Text>
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
});
