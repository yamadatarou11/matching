import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/constants/theme'

export default function Privacy() {
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

      <Text style={styles.title}>プライバシーポリシー</Text>
      <Text style={styles.updated}>仮版</Text>

      <View style={styles.section}>
        <Text style={styles.body}>
          Campus Matchは、アカウント、プロフィール、写真、マッチングに関する情報を、アプリ機能の提供と動作確認のために利用します。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>取り扱う情報</Text>
        <Text style={styles.body}>・メールアドレスなどの認証情報</Text>
        <Text style={styles.body}>・ニックネーム、生年月日、性別、大学情報、自己紹介、趣味</Text>
        <Text style={styles.body}>・プロフィール写真</Text>
        <Text style={styles.body}>・マッチングや操作履歴に関する情報</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>注意事項</Text>
        <Text style={styles.body}>
          本番公開前には、保存先、利用目的、第三者提供、削除方法、問い合わせ先を正式に定めます。身分証、住所、決済情報などは、正式な案内があるまで入力しないでください。
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
