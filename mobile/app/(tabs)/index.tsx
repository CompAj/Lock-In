import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useColorScheme } from 'nativewind';
import { resolvePalette } from '@/theme/colors';

const MIN_SECONDS = 5;
const MAX_SECONDS = 12 * 60 * 60; // 12 hours
const MAX_HOURS = Math.floor(MAX_SECONDS / 3600);

const clampSeconds = (seconds: number) => {
  return Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, seconds));
};

const toCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((safeSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (safeSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};

const formatShortTime = (date: Date | null) => {
  if (!date) {
    return 'Choose a time';
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const sanitizeNumber = (value: string, max: number) => {
  const numeric = value.replace(/[^0-9]/g, '');
  if (numeric.length === 0) {
    return '0';
  }
  const parsed = Math.min(max, parseInt(numeric, 10));
  return Number.isNaN(parsed) ? '0' : parsed.toString();
};

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = resolvePalette(scheme);
  const { width: windowWidth } = useWindowDimensions();
  const toggleSize = Math.min(windowWidth * 0.4, 160);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLengthSeconds, setSessionLengthSeconds] = useState(50 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(sessionLengthSeconds);
  const [showPicker, setShowPicker] = useState(false);

  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('50');
  const [selectedUntil, setSelectedUntil] = useState<Date | null>(null);

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

      setRemainingSeconds(sessionLengthSeconds);
      return true;
    });
  }, [sessionLengthSeconds]);

  const applyManualDuration = useCallback(() => {
    const hours = Math.min(MAX_HOURS, parseInt(manualHours, 10) || 0);
    const minutes = Math.min(59, parseInt(manualMinutes, 10) || 0);
    const totalSeconds = clampSeconds(hours * 3600 + minutes * 60);

    setSessionLengthSeconds(totalSeconds);
    setRemainingSeconds(totalSeconds);
    setSelectedUntil(null);
    Keyboard.dismiss();
  }, [manualHours, manualMinutes]);

  const handleUntilSelection = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }

      if (event.type === 'dismissed' || !date) {
        return;
      }

      const now = new Date();
      const candidate = new Date(now);
      candidate.setHours(date.getHours(), date.getMinutes(), 0, 0);

      if (candidate <= now) {
        candidate.setDate(candidate.getDate() + 1);
      }

      const diffSeconds = Math.round((candidate.getTime() - now.getTime()) / 1000);
      const duration = clampSeconds(diffSeconds);

      setSelectedUntil(candidate);
      setSessionLengthSeconds(duration);
      setRemainingSeconds(duration);
    },
    [],
  );

  const openUntilPicker = useCallback(() => {
    if (sessionActive) {
      return;
    }

    const defaultDate = selectedUntil ?? new Date(Date.now() + sessionLengthSeconds * 1000);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: defaultDate,
        mode: 'time',
        is24Hour: false,
        onChange: handleUntilSelection,
      });
      return;
    }

    setShowPicker(true);
  }, [handleUntilSelection, selectedUntil, sessionActive, sessionLengthSeconds]);

  useEffect(() => {
    const hours = Math.floor(sessionLengthSeconds / 3600);
    const minutes = Math.floor((sessionLengthSeconds % 3600) / 60);
    setManualHours(hours.toString());
    setManualMinutes(minutes.toString());
  }, [sessionLengthSeconds]);

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
    router.push('/what-to-block');
  }, [router]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.container, { backgroundColor: colors.surface }]}>
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
                  {formattedDuration}
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

              <View style={styles.manualRow}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.tabInactive }]}>Hours</Text>
                  <TextInput
                    editable={!sessionActive}
                    value={manualHours}
                    onChangeText={(value) => setManualHours(sanitizeNumber(value, MAX_HOURS))}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={applyManualDuration}
                    blurOnSubmit
                    style={[styles.input, { color: colors.foreground, borderColor: colors.tabBorder }]}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.tabInactive }]}>Minutes</Text>
                  <TextInput
                    editable={!sessionActive}
                    value={manualMinutes}
                    onChangeText={(value) => setManualMinutes(sanitizeNumber(value, 59))}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={applyManualDuration}
                    blurOnSubmit
                    style={[styles.input, { color: colors.foreground, borderColor: colors.tabBorder }]}
                  />
                </View>
              </View>

              <View style={styles.actionsColumn}>
                <Pressable
                  disabled={sessionActive}
                  onPress={applyManualDuration}
                  style={[
                    styles.applyButton,
                    {
                      backgroundColor: sessionActive ? colors.surface : colors.tabActive,
                      borderColor: colors.tabBorder,
                      opacity: sessionActive ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: sessionActive ? colors.tabInactive : colors.background,
                      fontWeight: '600',
                    }}
                  >
                    Set duration
                  </Text>
                </Pressable>

                <Text style={[styles.inputLabel, { color: colors.tabInactive }]}>Or focus until</Text>
                <Pressable
                  disabled={sessionActive}
                  onPress={openUntilPicker}
                  style={[
                    styles.untilButton,
                    {
                      borderColor: colors.tabBorder,
                      backgroundColor: colors.surface,
                      opacity: sessionActive ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
                    {formatShortTime(selectedUntil)}
                  </Text>
                  <Text style={{ color: colors.tabInactive, fontSize: 12 }}>
                    Until {toCountdown(sessionLengthSeconds)}
                  </Text>
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
              <Text style={[styles.blocklistLabel, { color: colors.foreground }]}>Choose what to block</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent animationType="fade" statusBarTranslucent>
          <Pressable style={styles.pickerBackdrop} onPress={() => setShowPicker(false)}>
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
              <DateTimePicker
                mode="time"
                display="spinner"
                value={selectedUntil ?? new Date(Date.now() + sessionLengthSeconds * 1000)}
                onChange={handleUntilSelection}
              />
              <Pressable
                style={[styles.pickerActionButton, { borderColor: colors.tabBorder }]}
                onPress={() => setShowPicker(false)}
              >
                <Text style={[styles.pickerActionLabel, { color: colors.foreground }]}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
    gap: 20,
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
    gap: 12,
  },
  toggleButton: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  durationCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    alignSelf: 'stretch',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
  },
  manualRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  actionsColumn: {
    alignSelf: 'stretch',
    gap: 12,
  },
  applyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  untilButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
    alignSelf: 'stretch',
  },
  blocklistButton: {
    paddingVertical: 14,
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
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 16,
  },
  pickerActionButton: {
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
