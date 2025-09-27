import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { resolvePalette } from '@/theme/colors';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'expo-router';

type ToggleKey = 'youtubeShorts' | 'instagramReels' | 'socialMediaGeneral';

export default function WhatToBlockScreen() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = resolvePalette(scheme);
  const router = useRouter();

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    youtubeShorts: false,
    instagramReels: false,
    socialMediaGeneral: false,
  });

  const items: { key: ToggleKey; label: string; description?: string }[] = useMemo(
    () => [
      { key: 'youtubeShorts', label: 'YouTube Shorts' },
      { key: 'instagramReels', label: 'Instagram Reels' },
      { key: 'socialMediaGeneral', label: 'Social media (general)' },
    ],
    []
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>What to block</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.tabBorder }]}>        
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <View
                key={item.key}
                style={[
                  styles.row,
                  { borderBottomColor: colors.tabBorder },
                  isLast ? styles.rowLast : undefined,
                ]}
              >
                <View style={styles.rowTextContainer}>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>
                    {item.label}
                  </Text>
                  {item.description ? (
                    <Text style={[styles.rowDescription, { color: colors.tabInactive }]}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <Switch
                  value={toggles[item.key]}
                  onValueChange={(v) =>
                    setToggles((prev) => ({ ...prev, [item.key]: v }))
                  }
                  accessibilityLabel={`Toggle ${item.label}`}
                />
              </View>
            );
          })}
        </View>
        <Text style={[styles.helper, { color: colors.tabInactive }]}>
          These are only UI toggles for now. We’ll wire them to policies next.
        </Text>
      </ScrollView>
      <Pressable
        onPress={() => router.back()}
        style={[styles.fabBack, { borderColor: colors.tabBorder, backgroundColor: colors.surface }]}
        accessibilityLabel="Back to Home"
      >
        <Text style={[styles.fabIcon, { color: colors.foreground }]}>←</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowTextContainer: {
    maxWidth: '75%',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowDescription: {
    marginTop: 4,
    fontSize: 12,
  },
  helper: {
    marginTop: 12,
    fontSize: 12,
  },
  fabBack: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fabIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
});


