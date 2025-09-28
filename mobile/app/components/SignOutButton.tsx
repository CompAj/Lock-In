import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { TouchableOpacity } from 'react-native'
import { useColorScheme } from 'nativewind'
import { resolvePalette } from '@/theme/colors'
import { Feather } from '@expo/vector-icons'

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
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
    >
      <Feather name="log-out" size={20} color={colors.foreground} />
    </TouchableOpacity>
  )
}