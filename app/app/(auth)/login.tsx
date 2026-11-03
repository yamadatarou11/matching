import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { router } from 'expo-router'
import { isSupabaseConfigured, supabase, supabaseConfigError } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Profile } from '@/types/db'

export default function Login() {
  const { setSession, setProfile } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setError(null)
    if (!isSupabaseConfigured) return setError(supabaseConfigError)
    if (!email.trim()) return setError('メールアドレスを入力してください')
    if (!password) return setError('パスワードを入力してください')

    setLoading(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signInError) {
      setLoading(false)
      if (
        signInError.message.includes('Invalid login credentials') ||
        signInError.message.includes('invalid_credentials')
      ) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。届いたメールのリンクをタップしてください')
      } else {
        setError(signInError.message)
      }
      return
    }

    setSession(data.session)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle()

    setLoading(false)

    if (profileError) {
      setError(`プロフィール確認に失敗しました: ${profileError.message}`)
      return
    }

    setProfile(profile as Profile | null)
    router.replace(profile ? '/(main)/home' : '/(main)/profile-setup')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>

        <Text style={styles.title}>ログイン</Text>
        <Text style={styles.subtitle}>大学メールアドレスとパスワードでログインしてください</Text>

        <View style={styles.form}>
          <Input
            label="大学メールアドレス"
            placeholder="xxxx@u-toyama.ac.jp"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <Input
            label="パスワード"
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="ログイン"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>アカウントをお持ちでない方は </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
            <Text style={styles.footerLink}>新規登録</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: {
    marginBottom: theme.spacing.xl,
  },
  backText: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  form: {
    gap: theme.spacing.md,
  },
  error: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    textAlign: 'center',
    paddingVertical: theme.spacing.xs,
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
  },
  footerLink: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
})
