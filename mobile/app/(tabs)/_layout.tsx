import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import '@/global.css';
import { resolvePalette } from '@/theme/colors';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const scheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = resolvePalette(scheme);
    return (
        <Tabs

            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    display: 'none',
                },
                headerTitleStyle: {
                    color: colors.foreground,
                    fontWeight: 600,
                },
                headerShadowVisible: false,
                sceneStyle: {
                    backgroundColor: colors.background,
                },

            }}

        >
            <Tabs.Screen name='index' options={{
                title: "Home",
                //tabBarIcon: ({ color, size }) => <Ionicons name='home-outline' size={size} color={color} />

            }} />
            <Tabs.Screen
                name='what-to-block'
                options={{
                    title: 'What to block',
                }}
            />
        </Tabs>
    )
}
