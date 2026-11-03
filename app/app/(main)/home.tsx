import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Gender, LikeAction, Photo, PublicProfile } from '@/types/db'
import { theme } from '@/constants/theme'

interface Candidate extends PublicProfile {
  mainPhotoUrl: string | null
}

const GENDER_LABELS: Record<Gender, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message)
  }
  return 'エラーが発生しました'
}

export default function Home() {
  const { profile, setSession, setProfile } = useAuthStore()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingAction, setSavingAction] = useState<LikeAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const current = candidates[0]

  const subtitle = useMemo(() => {
    if (!profile) return 'プロフィールを確認中'
    return `${profile.nickname} さんに合いそうな相手`
  }, [profile])

  const loadCandidates = useCallback(async () => {
    if (!profile) return

    setError(null)
    const { data, error: rpcError } = await supabase.rpc('get_candidates', {
      limit_count: 20,
    })
    if (rpcError) throw rpcError

    const profiles = (data ?? []) as PublicProfile[]
    const withPhotos = await Promise.all(
      profiles.map(async (candidate) => {
        const { data: photo } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', candidate.user_id)
          .eq('is_main', true)
          .maybeSingle()

        let mainPhotoUrl: string | null = null
        if (photo) {
          const { data: signed } = await supabase.storage
            .from('profile-photos')
            .createSignedUrl((photo as Photo).storage_path, 60 * 60)
          mainPhotoUrl = signed?.signedUrl ?? null
        }

        return { ...candidate, mainPhotoUrl }
      })
    )

    setCandidates(withPhotos)
  }, [profile])

  useEffect(() => {
    let mounted = true

    async function run() {
      setLoading(true)
      try {
        await loadCandidates()
      } catch (e) {
        if (mounted) setError(getErrorMessage(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [loadCandidates])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await loadCandidates()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setRefreshing(false)
    }
  }

  async function handleLikeAction(action: LikeAction) {
    if (!profile || !current || savingAction) return

    setSavingAction(action)
    setError(null)
    const { error: likeError } = await supabase.from('likes').insert({
      from_user_id: profile.user_id,
      to_user_id: current.user_id,
      action,
    })
    setSavingAction(null)

    if (likeError) {
      setError(getErrorMessage(likeError))
      return
    }

    setCandidates((prev) => prev.slice(1))
  }

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      return
    }
    setSession(null)
    setProfile(null)
    router.replace('/(auth)/welcome')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Campus Match</Text>
          <Text style={styles.title}>探す</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.centerText}>候補を読み込んでいます</Text>
          </View>
        ) : current ? (
          <View style={styles.profilePanel}>
            <View style={styles.photoFrame}>
              {current.mainPhotoUrl ? (
                <Image source={{ uri: current.mainPhotoUrl }} style={styles.photo} />
              ) : (
                <View style={styles.photoFallback}>
                  <Text style={styles.photoFallbackText}>写真なし</Text>
                </View>
              )}
              <View style={styles.photoOverlay}>
                <Text style={styles.name}>
                  {current.nickname}, {current.age}
                </Text>
                <Text style={styles.meta}>
                  {GENDER_LABELS[current.gender]} / {current.university}
                </Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              {current.department || current.grade ? (
                <Text style={styles.infoLine}>
                  {[current.department, current.grade ? `${current.grade}年` : null]
                    .filter(Boolean)
                    .join(' / ')}
                </Text>
              ) : null}
              {current.bio ? <Text style={styles.bio}>{current.bio}</Text> : null}
              {current.hobbies.length > 0 ? (
                <View style={styles.hobbies}>
                  {current.hobbies.slice(0, 8).map((hobby) => (
                    <View style={styles.hobbyChip} key={hobby}>
                      <Text style={styles.hobbyText}>{hobby}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.passBtn]}
                onPress={() => handleLikeAction('pass')}
                disabled={Boolean(savingAction)}
              >
                <Text style={styles.passText}>
                  {savingAction === 'pass' ? '送信中' : 'スキップ'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.likeBtn]}
                onPress={() => handleLikeAction('like')}
                disabled={Boolean(savingAction)}
              >
                <Text style={styles.likeText}>
                  {savingAction === 'like' ? '送信中' : 'いいね'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.centerState}>
            <Text style={styles.emptyTitle}>表示できる候補がいません</Text>
            <Text style={styles.emptyBody}>
              まだ他のプロフィールが少ないか、条件に合う相手をすべて確認済みです。
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.reloadBtn} onPress={handleRefresh}>
              <Text style={styles.reloadText}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  signOutBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  signOutText: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  centerState: {
    flex: 1,
    minHeight: 520,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  centerText: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
  },
  profilePanel: {
    gap: theme.spacing.md,
  },
  photoFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceHigh,
  },
  photoFallbackText: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.md,
  },
  photoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
  },
  meta: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  infoSection: {
    gap: theme.spacing.sm,
  },
  infoLine: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
  },
  bio: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
  hobbies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  hobbyChip: {
    paddingVertical: 7,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hobbyText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passBtn: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  likeBtn: {
    backgroundColor: theme.colors.primary,
  },
  passText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '800',
  },
  likeText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '800',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
  },
  reloadBtn: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceHigh,
  },
  reloadText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
})
