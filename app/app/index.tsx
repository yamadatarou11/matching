import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/auth'
import { theme } from '@/constants/theme'

export default function Index() {
  const { session, profile, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/welcome" />
  if (!profile) return <Redirect href="/(main)/profile-setup" />
  return <Redirect href="/(main)/home" />
}
