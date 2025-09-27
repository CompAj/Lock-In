import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useColorScheme } from 'nativewind';
import { resolvePalette } from '@/theme/colors';

const MINUTES_STEP = 5;
const MIN_MINUTES = 5;
const MAX_MINUTES = 12 * 60;

const toDisplayMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`;
  }

  return `${remainingMinutes} min`;
};

const toCountdown = (seconds: number) => {
  const clampedSeconds = Math.max(0, seconds);
  const hours = Math.floor(clampedSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((clampedSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (clampedSeconds % 60).toString().padStart(2, '0');

  return `${hours}:${minutes}:${secs}`;
};

const minutesToDate = (minutes: number) => {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60));
  date.setMinutes(minutes % 60);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const clampToStep = (minutes: number) => {
  const clamped = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, minutes));
  return Math.round(clamped / MINUTES_STEP) * MINUTES_STEP;
};

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = resolvePalette(scheme);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLengthMinutes, setSessionLengthMinutes] = useState(50);
  const [remainingSeconds, setRemainingSeconds] = useState(
    sessionLengthMinutes * 60,
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formattedDuration = useMemo(() => {
    if (sessionActive) {
      return toCountdown(remainingSeconds);
    }

    return toDisplayMinutes(sessionLengthMinutes);
  }, [remainingSeconds, sessionActive, sessionLengthMinutes]);

  const toggleSession = useCallback(() => {
    setSessionActive((prev) => {
      if (prev) {
        setRemainingSeconds(sessionLengthMinutes * 60);
        return false;
      }

      setRemainingSeconds(sessionLengthMinutes * 60);
      return true;
    });
  }, [sessionLengthMinutes]);

  const updateSessionLength = useCallback((minutes: number) => {
    setSessionLengthMinutes(clampToStep(minutes));
  }, []);

  const decreaseDuration = useCallback(() => {
    updateSessionLength(sessionLengthMinutes - MINUTES_STEP);
  }, [sessionLengthMinutes, updateSessionLength]);

  const increaseDuration = useCallback(() => {
    updateSessionLength(sessionLengthMinutes + MINUTES_STEP);
  }, [sessionLengthMinutes, updateSessionLength]);

  const handleDurationPicker = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (!date) {
        return;
      }

      if (Platform.OS === 'android' && event.type === 'dismissed') {
        return;
      }

      updateSessionLength(date.getHours() * 60 + date.getMinutes());
    },
    [updateSessionLength],
  );

  const openDurationPicker = useCallback(() => {
    if (sessionActive) {
      return;
    }

    const pickerValue = minutesToDate(sessionLengthMinutes);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerValue,
        mode: 'time',
        is24Hour: false,
        onChange: handleDurationPicker,
      });
      return;
    }

    setShowTimePicker(true);
  }, [handleDurationPicker, sessionActive, sessionLengthMinutes]);

  useEffect(() => {
    if (!sessionActive) {
      setRemainingSeconds(sessionLengthMinutes * 60);
    }
  }, [sessionActive, sessionLengthMinutes]);

  useEffect(() => {
    if (!sessionActive) {
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
  }, [sessionActive]);

  const openBlocklist = useCallback(() => {
    router.push('/blocklist');
  }, [router]);

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
        <View style={styles.durationControls}>
          <Pressable
            onPress={decreaseDuration}
            disabled={sessionActive}
            style={[
              styles.adjustButton,
              {
                borderColor: colors.tabBorder,
                opacity: sessionActive ? 0.4 : 1,
              },
            ]}
          >
            <Text style={[styles.adjustLabel, { color: colors.foreground }]}>-</Text>
          </Pressable>

          <Pressable
            onPress={openDurationPicker}
            disabled={sessionActive}
            style={[styles.durationLabelWrapper, sessionActive && styles.disabledPicker]}
          >
            <Text style={[styles.durationLabel, { color: colors.foreground }]}>
              {formattedDuration}
            </Text>
            <Text style={[styles.durationHint, { color: colors.tabInactive }]}>
              {sessionActive ? 'Counting down…' : 'Tap to set hours and minutes'}
            </Text>
          </Pressable>

          <Pressable
            onPress={increaseDuration}
            disabled={sessionActive}
            style={[
              styles.adjustButton,
              {
                borderColor: colors.tabBorder,
                opacity: sessionActive ? 0.4 : 1,
              },
            ]}
          >
            <Text style={[styles.adjustLabel, { color: colors.foreground }]}>+</Text>
          </Pressable>
        </View>
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

      {Platform.OS === 'ios' && showTimePicker && (
        <Modal transparent animationType="fade">
          <View style={styles.pickerBackdrop}>
            <View
              style={[
                styles.pickerContainer,
                {
                  borderColor: colors.tabBorder,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <DateTimePicker
                mode="time"
                display="spinner"
                value={minutesToDate(sessionLengthMinutes)}
                onChange={handleDurationPicker}
                minuteInterval={MINUTES_STEP}
              />
              <Pressable
                style={[
                  styles.pickerCloseButton,
                  {
                    borderColor: colors.tabBorder,
                  },
                ]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={[styles.pickerCloseLabel, { color: colors.foreground }]}>
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
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
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  durationCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustLabel: {
    fontSize: 24,
    fontWeight: '600',
  },
  durationLabelWrapper: {
    alignItems: 'center',
  },
  disabledPicker: {
    opacity: 0.6,
  },
  durationLabel: {
    fontSize: 32,
    fontWeight: '700',
  },
  durationHint: {
    marginTop: 4,
    fontSize: 14,
  },
  blocklistButton: {
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
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
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerCloseButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerCloseLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
