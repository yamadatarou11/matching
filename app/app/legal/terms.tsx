import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/constants/theme'

export default function Terms() {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(main)/home')
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity style={styles.back} onPress={goBack}>
        <Text style={styles.backText}>← 戻る</Text>
      </TouchableOpacity>

      <Text style={styles.title}>利用規約</Text>
      <Text style={styles.updated}>仮版</Text>

      <View style={styles.section}>
        <Text style={styles.body}>
          Campus Matchは、富山の学生向けマッチングアプリのMVPです。現在の画面、プロフィール、マッチング、チャット等の機能は動作確認を目的とした仮実装を含みます。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>禁止事項</Text>
        <Text style={styles.body}>・他人の個人情報を入力すること</Text>
        <Text style={styles.body}>・誹謗中傷、なりすまし、迷惑行為</Text>
        <Text style={styles.body}>・住所、電話番号など公開に注意が必要な情報を投稿すること</Text>
        <Text style={styles.body}>・法令または公序良俗に反する行為</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>注意事項</Text>
        <Text style={styles.body}>
          本番公開前には、正式な利用規約、通報・ブロック、本人確認、問い合わせ窓口などの運用内容を定めます。
        </Text>
      </View>
    </ScrollView>
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
    paddingBottom: 48,
  },
  back: {
    marginBottom: theme.spacing.xl,
  },
  backText: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  updated: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
})
