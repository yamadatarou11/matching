import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'

const { width } = Dimensions.get('window')

export default function Welcome() {
  return (
    <View style={styles.container}>
      {/* 背景装飾 */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* ロゴエリア */}
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Text style={styles.logoSymbol}>♥</Text>
        </View>
        <Text style={styles.appName}>Campus Match</Text>
        <Text style={styles.tagline}>富山の学生のための出会い</Text>
      </View>

      {/* 説明 */}
      <View style={styles.features}>
        <FeatureRow icon="🎓" text="富山県内の大学生限定" />
        <FeatureRow icon="✅" text="学生証で本人確認" />
        <FeatureRow icon="💬" text="マッチ後にチャット開始" />
      </View>

      {/* ボタン */}
      <View style={styles.buttons}>
        <Button
          title="アカウントを作成"
          onPress={() => router.push('/(auth)/register')}
          style={styles.registerBtn}
        />
        <Button
          title="ログイン"
          onPress={() => router.push('/(auth)/login')}
          variant="outline"
          style={styles.loginBtn}
        />
      </View>

      <Text style={styles.legalNote}>
        登録することで
        <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
          {' '}利用規約{' '}
        </Text>
        および
        <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
          {' '}プライバシーポリシー{' '}
        </Text>
        に同意したものとみなします
      </Text>
    </View>
  )
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 80,
    paddingBottom: 40,
  },
  blob1: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.primary,
    opacity: 0.12,
  },
  blob2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#8b5cf6',
    opacity: 0.10,
  },
  hero: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: theme.spacing.xl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoSymbol: {
    fontSize: 32,
    color: '#fff',
  },
  appName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: theme.colors.muted,
    letterSpacing: 0.5,
  },
  features: {
    gap: 14,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.muted,
  },
  buttons: {
    gap: theme.spacing.md,
    marginTop: 'auto',
    marginBottom: theme.spacing.lg,
  },
  registerBtn: {
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtn: {
    width: '100%',
  },
  legalNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: theme.colors.blue,
  },
})
