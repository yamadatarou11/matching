import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Profile } from '@/types/db'

export default function RootLayout() {
  const { setSession, setProfile, setInitialized } = useAuthStore()

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      setProfile(null)
      setInitialized(true)
      return
    }

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle()
        setProfile(data as Profile | null)
      }

      setInitialized(true)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (!session) {
        setProfile(null)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()
      setProfile(data as Profile | null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
