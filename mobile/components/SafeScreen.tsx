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
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
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
