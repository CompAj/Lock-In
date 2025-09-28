"use client"

import React from "react"
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'
import { resolvePalette } from '@/theme/colors'
import { useRouter } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import * as Linking from "expo-linking"
import { useOAuth } from "@clerk/clerk-expo"

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" })
  const { colorScheme } = useColorScheme()
  const scheme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = resolvePalette(scheme)

  const onGoogleSignInPress = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const redirectUrl = Linking.createURL("/")
      const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow({ redirectUrl })
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId })
        router.replace("/")
      } else {
        // Additional steps are required to finish sign-in
        console.log("OAuth flow requires additional steps", { signIn, signUp })
      }
    } catch (err) {
      console.error("OAuth error", err)
      Alert.alert("Google Sign In", "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [startOAuthFlow, router])

  return (
    <SafeAreaView edges={['left','right']} style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 48, paddingBottom: 0, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="flex-1 justify-center items-center">
          {/* Logo */}
          <View className="w-24 h-24 bg-white/10 rounded-full items-center justify-center mb-8 border border-white/20">
            <Text className="text-white text-3xl">🔒</Text>
          </View>

          {/* Title */}
          <Text className="text-white text-3xl font-bold mb-2">
            Login
          </Text>

          <Text className="text-slate-400 text-base text-center mb-12">
            Sign in to your account to continue
          </Text>

          {/* Google Sign In Button */}
          <TouchableOpacity
            className="bg-white rounded-xl h-14 w-full max-w-xs flex-row items-center justify-center shadow-lg"
            onPress={onGoogleSignInPress}
            disabled={isLoading}
          >
            <View className="w-6 h-6 bg-red-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xs font-bold">G</Text>
            </View>
            <Text className="text-slate-950 text-base font-semibold">
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-8">
            <Text className="text-slate-400 text-sm text-center">
              By continuing, you agree to our Terms and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}