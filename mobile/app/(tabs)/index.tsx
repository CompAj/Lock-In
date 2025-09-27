import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { resolvePalette } from '@/theme/colors';

const MIN_SECONDS = 5;
const MAX_SECONDS = 12 * 60 * 60; // 12 hours
const MAX_HOURS = Math.floor(MAX_SECONDS / 3600);

const formatNumber = (value: number) => value.toString().padStart(2, '0');

const clampSeconds = (seconds: number) => {
  const clamped = Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, seconds));
  return clamped;
};

const toCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = formatNumber(Math.floor(safeSeconds / 3600));
  const minutes = formatNumber(Math.floor((safeSeconds % 3600) / 60));
  const secs = formatNumber(safeSeconds % 60);
  return `${hours}:${minutes}:${secs}`;
};

const splitSeconds = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  return { hours, minutes, secs };
};

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = resolvePalette(scheme);
  const { width: windowWidth } = useWindowDimensions();
  const toggleSize = Math.min(windowWidth * 0.6, 220);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLengthSeconds, setSessionLengthSeconds] = useState(50 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(sessionLengthSeconds);
  const [showPicker, setShowPicker] = useState(false);
  const [{ hours: pickerHours, minutes: pickerMinutes, secs: pickerSeconds }, setPickerValues] =
    useState(splitSeconds(50 * 60));

  const hoursOptions = useMemo(
    () => Array.from({ length: MAX_HOURS + 1 }, (_, index) => index),
    [],
  );
  const minutesOptions = useMemo(
    () => Array.from({ length: 60 }, (_, index) => index),
    [],
  );

  const formattedDuration = useMemo(() => {
    const sourceSeconds = sessionActive ? remainingSeconds : sessionLengthSeconds;
    return toCountdown(sourceSeconds);
  }, [remainingSeconds, sessionActive, sessionLengthSeconds]);

  const toggleSession = useCallback(() => {
    setSessionActive((prev) => {
      if (prev) {
        setRemainingSeconds(sessionLengthSeconds);
        return false;
      }

      if (sessionLengthSeconds <= 0) {
        setSessionLengthSeconds(clampSeconds(60));
        setRemainingSeconds(clampSeconds(60));
      } else {
        setRemainingSeconds(sessionLengthSeconds);
      }
      return true;
    });
  }, [sessionLengthSeconds]);

  const openDurationPicker = useCallback(() => {
    if (sessionActive) {
      return;
    }

    setPickerValues(splitSeconds(sessionLengthSeconds));
    setShowPicker(true);
  }, [sessionActive, sessionLengthSeconds]);

  const confirmDuration = useCallback(() => {
    const nextSeconds = clampSeconds(
      pickerHours * 3600 + pickerMinutes * 60 + pickerSeconds,
    );

    setSessionLengthSeconds(nextSeconds);
    setRemainingSeconds(nextSeconds);
    setShowPicker(false);
  }, [pickerHours, pickerMinutes, pickerSeconds]);

  const cancelPicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  useEffect(() => {
    if (!sessionActive) {
      setRemainingSeconds(sessionLengthSeconds);
    }
  }, [sessionActive, sessionLengthSeconds]);

  useEffect(() => {
    if (!sessionActive) {
      return;
    }

    if (remainingSeconds <= 0) {
      setSessionActive(false);
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, sessionActive]);

  const openBlocklist = useCallback(() => {
    router.push('/blocklist');
  }, [router]);

  const renderPickerColumn = useCallback(
    (
      label: string,
      options: number[],
      value: number,
      onSelect: (next: number) => void,
    ) => (
      <View style={styles.pickerColumn}>
        <Text style={[styles.pickerColumnLabel, { color: colors.tabInactive }]}>{label}</Text>
        <ScrollView
          style={styles.pickerScroll}
          contentContainerStyle={styles.pickerColumnContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={`${label}-${option}`}
                onPress={() => onSelect(option)}
                style={[
                  styles.pickerItem,
                  selected && {
                    borderColor: colors.tabActive,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pickerItemLabel,
                    {
                      color: selected ? colors.foreground : colors.tabInactive,
                    },
                  ]}
                >
                  {formatNumber(option)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    ),
    [colors.surface, colors.tabActive, colors.tabInactive, colors.foreground],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Lock-In Session</Text>
        <Text style={[styles.subtitle, { color: colors.tabInactive }]}>
          Keep distractions out while you study.
        </Text>
      </View>

      <View style={styles.toggleSection}>
        <Pressable
          onPress={toggleSession}
          style={[
            styles.toggleButton,
            {
              width: toggleSize,
              height: toggleSize,
              borderColor: sessionActive ? colors.tabActive : colors.tabBorder,
              backgroundColor: sessionActive ? colors.tabActive : colors.surface,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: sessionActive ? colors.background : colors.foreground,
            }}
          >
            {sessionActive ? 'Session On' : 'Start Session'}
          </Text>
        </Pressable>
        <Text
          style={{
            color: sessionActive ? colors.tabActive : colors.tabInactive,
            textAlign: 'center',
            maxWidth: 260,
          }}
        >
          {sessionActive
            ? 'Blocking distractions for the duration of your session.'
            : 'Tap to begin a focus session and block distracting sites.'}
        </Text>
      </View>

      <View
        style={[
          styles.durationCard,
          {
            borderColor: colors.tabBorder,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Session length</Text>
        <Pressable
          onPress={openDurationPicker}
          disabled={sessionActive}
          style={[styles.durationReadout, sessionActive && styles.disabledPicker]}
        >
          <Text style={[styles.durationLabel, { color: colors.foreground }]}>
            {formattedDuration}
          </Text>
          <Text style={[styles.durationHint, { color: colors.tabInactive }]}>
            {sessionActive
              ? 'Counting down…'
              : 'Tap to set hours, minutes, and seconds'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={openBlocklist}
        style={[
          styles.blocklistButton,
          {
            borderColor: colors.tabBorder,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Text style={[styles.blocklistLabel, { color: colors.foreground }]}>
          Choose what to block
        </Text>
      </Pressable>

      {showPicker && (
        <Modal
          transparent
          visible={showPicker}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={cancelPicker}
        >
          <Pressable style={styles.pickerBackdrop} onPress={cancelPicker}>
            <Pressable
              style={[
                styles.pickerContainer,
                {
                  borderColor: colors.tabBorder,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={(event) => event.stopPropagation()}
            >
              <Text style={[styles.pickerTitle, { color: colors.foreground }]}>
                Set session duration
              </Text>
              <View style={styles.pickerColumns}>
                {renderPickerColumn('Hours', hoursOptions, pickerHours, (next) =>
                  setPickerValues((current) => ({ ...current, hours: next })),
                )}
                {renderPickerColumn('Minutes', minutesOptions, pickerMinutes, (next) =>
                  setPickerValues((current) => ({ ...current, minutes: next })),
                )}
                {renderPickerColumn('Seconds', minutesOptions, pickerSeconds, (next) =>
                  setPickerValues((current) => ({ ...current, secs: next })),
                )}
              </View>
              <View style={styles.pickerActions}>
                <Pressable
                  style={[styles.pickerActionButton, { borderColor: colors.tabBorder }]}
                  onPress={cancelPicker}
                >
                  <Text style={[styles.pickerActionLabel, { color: colors.tabInactive }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pickerActionButton,
                    {
                      borderColor: colors.tabBorder,
                      backgroundColor: colors.tabActive,
                    },
                  ]}
                  onPress={confirmDuration}
                >
                  <Text style={[styles.pickerActionLabel, { color: colors.background }]}>
                    Set
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
    gap: 24,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  toggleSection: {
    alignItems: 'center',
    gap: 20,
  },
  toggleButton: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  durationCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    alignSelf: 'stretch',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
  },
  durationReadout: {
    alignItems: 'center',
    gap: 6,
  },
  disabledPicker: {
    opacity: 0.6,
  },
  durationLabel: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 2,
  },
  durationHint: {
    fontSize: 14,
  },
  blocklistButton: {
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  blocklistLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pickerContainer: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 24,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    maxHeight: 260,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  pickerColumnLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickerColumnContent: {
    gap: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  pickerScroll: {
    maxHeight: 220,
  },
  pickerItem: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  pickerItemLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pickerActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerActionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
