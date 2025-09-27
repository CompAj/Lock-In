import { View, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { ReactNode } from 'react';
import { resolvePalette } from '@/theme/colors';

type SafeScreenProps = {
    children: ReactNode;
};

export default function SafeScreen({ children }: SafeScreenProps) {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
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
