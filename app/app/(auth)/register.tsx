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
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function getEmailRedirectTo() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.origin
    }
    return 'campusmatch://auth/callback'
  }

  async function handleRegister() {
    setError(null)

    if (!isSupabaseConfigured) return setError(supabaseConfigError)
    if (!email.trim()) return setError('メールアドレスを入力してください')
    if (!email.includes('@')) return setError('メールアドレスの形式が正しくありません')
    if (password.length < 8) return setError('パスワードは8文字以上で入力してください')
    if (password !== confirm) return setError('パスワードが一致しません')

    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    })
    setLoading(false)

    if (signUpError) {
      const message = signUpError.message
      if (message.includes('already registered')) {
        setError('このメールアドレスは既に登録されています')
      } else if (message.includes('富山県内')) {
        setError('富山県内の大学メールアドレスのみ登録できます')
      } else if (message.includes('Database error') || message.includes('database error')) {
        setError(
          'このメールアドレスでは登録できません。富山県内の大学メールアドレス（例: @u-toyama.ac.jp）をご利用ください'
        )
      } else {
        setError(message)
      }
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.sentCard}>
          <Text style={styles.sentIcon}>📧</Text>
          <Text style={styles.sentTitle}>確認メールを送信しました</Text>
          <Text style={styles.sentBody}>
            {email} に確認メールを送りました。{'\n'}
            メール内のリンクをタップしてアカウントを有効化してください。
          </Text>
          <Text style={styles.sentNote}>
            メールが届かない場合は迷惑メールフォルダをご確認ください
          </Text>
          <Button
            title="ログイン画面へ"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.sentBtn}
          />
        </View>
      </View>
    )
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

        <Text style={styles.title}>アカウントを作成</Text>
        <Text style={styles.subtitle}>
          富山県内の大学メールアドレスで登録してください
        </Text>

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
            label="パスワード（8文字以上）"
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="パスワード（確認）"
            placeholder="パスワードを再入力"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="登録する"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>既にアカウントをお持ちの方は </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>ログイン</Text>
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
  // 確認メール送信後
  sentCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  sentIcon: {
    fontSize: 56,
    marginBottom: theme.spacing.sm,
  },
  sentTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  sentBody: {
    fontSize: theme.fontSize.md,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  sentNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.muted,
    textAlign: 'center',
    opacity: 0.7,
  },
  sentBtn: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
})
