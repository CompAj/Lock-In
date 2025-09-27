import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import { resolvePalette } from '@/theme/colors';

export default function index() {
  const scheme = useColorScheme();
  const colors = resolvePalette(scheme);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={{ color: colors.foreground }}>hello</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
