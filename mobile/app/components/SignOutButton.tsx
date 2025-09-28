import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity } from 'react-native'
import { useColorScheme } from 'nativewind'
import { resolvePalette } from '@/theme/colors'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const { colorScheme } = useColorScheme()
  const scheme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = resolvePalette(scheme)
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/'))
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }
  return (
    <TouchableOpacity
      onPress={handleSignOut}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
    >
      <Text style={{ color: colors.foreground, fontWeight: '600' }}>Sign out</Text>
    </TouchableOpacity>
  )
}