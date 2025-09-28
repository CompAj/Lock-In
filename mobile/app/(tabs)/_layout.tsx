import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import '@/global.css';
import { resolvePalette } from '@/theme/colors';
import { SignOutButton } from '@/app/components/SignOutButton';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const scheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = resolvePalette(scheme);
    return (
        <Tabs

            screenOptions={{
                headerShown: true,
                tabBarStyle: {
                    display: 'none',
                },
                headerLeft: () => <SignOutButton />,
                headerLeftContainerStyle: { paddingLeft: 8 },
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.foreground,
                headerTitleStyle: {
                    color: colors.foreground,
                    fontWeight: '600',
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
