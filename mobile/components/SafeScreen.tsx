import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { ReactNode } from 'react';
import { resolvePalette } from '@/theme/colors';
import { useColorScheme } from 'nativewind';

type SafeScreenProps = {
    children: ReactNode;
};

export default function SafeScreen({ children }: SafeScreenProps) {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const scheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = resolvePalette(scheme);

    return (
        <View
            style={[
                styles.container,
                {
                    // Avoid adding global safe-area padding so router headers/layouts
                    // are not shifted. Individual screens should handle their own
                    // safe-area needs via SafeAreaView.
                    paddingBottom: insets.bottom,
                    backgroundColor: colors.background,
                },
            ]}
        >
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
