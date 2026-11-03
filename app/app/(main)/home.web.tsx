import { createElement, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useAuthStore } from '@/store/auth'

export default function HomeWeb() {
  const { profile, session } = useAuthStore()
  const [ready, setReady] = useState(false)
  const src = useMemo(() => `/machi-ui/index.html?v=${Date.now()}`, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !profile) {
      setReady(false)
      return
    }

    window.localStorage.setItem(
      'townSupabaseConfig',
      JSON.stringify({
        url: process.env.EXPO_PUBLIC_SUPABASE_URL,
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      })
    )

    window.localStorage.setItem(
      'townCurrentUser',
      JSON.stringify({
        name: profile.nickname,
        email: session?.user.email ?? '',
        password: '',
        school: profile.university,
        gender: profile.gender,
        grade: profile.grade ? String(profile.grade) : '',
        year: profile.grade === 5 ? '院1' : profile.grade === 6 ? '院2' : profile.grade ? String(profile.grade) : '',
        age: ageFromBirthdate(profile.birthdate),
        faculty: profile.department ?? '',
        interests: profile.hobbies.join(', '),
        lookingFor: profile.looking_for.join(', '),
        hometown: profile.hometown ?? '',
        type: profile.profile_type ?? '',
        idealDate: profile.ideal_date ?? '',
        photo: '',
        photos: [],
        bio: profile.bio ?? '',
        userId: session?.user.id ?? '',
      })
    )
    setReady(true)
  }, [profile, session?.user.email, session?.user.id])

  return (
    <View style={styles.container}>
      {/*
        Use the existing Campus Match UI directly. Do not recreate the screens in RN.
        The iframe is same-origin, so the legacy UI can read townCurrentUser.
      */}
      {ready ? createIframe(src) : null}
    </View>
  )
}

function ageFromBirthdate(birthdate: string) {
  const date = new Date(birthdate)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const birthdayPassed = today.getMonth() > date.getMonth()
    || (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate())
  if (!birthdayPassed) age -= 1
  return age >= 0 ? String(age) : ''
}

function createIframe(src: string) {
  return createElement('iframe', {
    src,
    title: 'Campus Match',
    allow: 'camera; fullscreen',
    style: {
      width: '100%',
      height: '100%',
      border: 0,
      display: 'block',
      background: '#07090f',
    },
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090f',
  },
})
