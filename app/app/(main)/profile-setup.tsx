import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Gender, Profile } from '@/types/db'

// ================================================================
// 定数
// ================================================================

const TOTAL_STEPS = 7
const MIN_PROFILE_PHOTOS = 2
const MAX_PROFILE_PHOTOS = 4

const UNIVERSITIES = [
  '富山大学',
  '富山県立大学',
  '富山国際大学',
  '高岡法科大学',
  '富山短期大学',
  '富山高等専門学校',
]

const HOBBY_OPTIONS = [
  '映画', '音楽', 'スポーツ', '読書', '料理', '旅行',
  'ゲーム', 'カフェ巡り', '写真', 'アウトドア', 'ファッション',
  '筋トレ', 'アニメ', 'ドライブ', 'お酒', 'ライブ・フェス',
  'DIY', 'ペット', '節約', '副業',
]

const GENDER_LABELS: Record<Gender, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
}

const STEP_TITLES = [
  'ニックネーム',
  '生年月日',
  '性別',
  '探している相手',
  '大学情報',
  '自己紹介',
  'プロフィール写真',
]

function getSaveErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as {
      message?: string
      details?: string | null
      hint?: string | null
    }
    return [supabaseError.message, supabaseError.details, supabaseError.hint]
      .filter(Boolean)
      .join('\n')
  }
  return '保存中にエラーが発生しました'
}

// ================================================================
// フォームデータの型
// ================================================================

interface FormData {
  nickname: string
  year: string
  month: string
  day: string
  gender: Gender | null
  lookingFor: Gender[]
  university: string
  department: string
  grade: string   // '' or '1'〜'6'
  bio: string
  hobbies: string[]
}

// ================================================================
// メインコンポーネント
// ================================================================

export default function ProfileSetup() {
  const { session, setProfile } = useAuthStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    nickname: '',
    year: '',
    month: '',
    day: '',
    gender: null,
    lookingFor: [],
    university: '',
    department: '',
    grade: '',
    bio: '',
    hobbies: [],
  })
  const [photos, setPhotos] = useState<string[]>([])  // local URIs
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- 入力ヘルパー ----
  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  function toggleGender(g: Gender, field: 'gender' | 'lookingFor') {
    if (field === 'gender') {
      set('gender', g)
    } else {
      setForm((prev) => {
        const arr = prev.lookingFor.includes(g)
          ? prev.lookingFor.filter((x) => x !== g)
          : [...prev.lookingFor, g]
        return { ...prev, lookingFor: arr }
      })
    }
  }

  function toggleHobby(h: string) {
    setForm((prev) => {
      const arr = prev.hobbies.includes(h)
        ? prev.hobbies.filter((x) => x !== h)
        : [...prev.hobbies, h]
      return { ...prev, hobbies: arr }
    })
  }

  // ---- バリデーション ----
  function validate(): string | null {
    switch (step) {
      case 0:
        if (!form.nickname.trim()) return 'ニックネームを入力してください'
        if (form.nickname.trim().length > 20) return '20文字以内で入力してください'
        break
      case 1: {
        const y = parseInt(form.year)
        const m = parseInt(form.month)
        const d = parseInt(form.day)
        if (!form.year || !form.month || !form.day) return '生年月日をすべて入力してください'
        if (isNaN(y) || y < 1900 || y > new Date().getFullYear())
          return '正しい年を入力してください'
        if (isNaN(m) || m < 1 || m > 12) return '月は1〜12で入力してください'
        if (isNaN(d) || d < 1 || d > 31) return '日は1〜31で入力してください'
        const birthdate = new Date(y, m - 1, d)
        const limit = new Date()
        limit.setFullYear(limit.getFullYear() - 18)
        if (birthdate > limit) return '18歳未満の方はご利用いただけません'
        break
      }
      case 2:
        if (!form.gender) return '性別を選択してください'
        break
      case 3:
        if (form.lookingFor.length === 0)
          return '探している相手の性別を1つ以上選択してください'
        break
      case 4:
        if (!form.university) return '大学名を選択してください'
        break
      case 6:
        if (photos.length < MIN_PROFILE_PHOTOS) {
          return `プロフィール写真を${MIN_PROFILE_PHOTOS}枚以上追加してください`
        }
        break
    }
    return null
  }

  function handleNext() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setStep((s) => s + 1)
  }

  function handleBack() {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  // ---- 写真操作 ----
  async function addPhoto() {
    if (photos.length >= MAX_PROFILE_PHOTOS) {
      setError(`プロフィール写真は最大${MAX_PROFILE_PHOTOS}枚までです`)
      return
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('権限が必要です', '写真へのアクセスを許可してください')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setError(null)
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, MAX_PROFILE_PHOTOS))
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // ---- Storage アップロード ----
  async function uploadPhoto(userId: string, uri: string, index: number): Promise<string> {
    const ext = uri.toLowerCase().includes('.png') ? 'png' : 'jpg'
    const path = `${userId}/${Date.now()}_${index}.${ext}`

    const fileBody =
      Platform.OS === 'web'
        ? await fetch(uri).then((response) => response.arrayBuffer())
        : decode(
            await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            })
          )

    const { data, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, fileBody, {
        contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
        upsert: false,
      })
    if (uploadError) throw new Error(`写真のアップロードに失敗しました: ${uploadError.message}`)
    return data.path
  }

  // ---- 最終保存 ----
  async function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setSaving(true)

    try {
      const userId = session!.user.id

      // 1. 写真をアップロード
      const storagePaths: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const path = await uploadPhoto(userId, photos[i], i)
        storagePaths.push(path)
      }

      // 2. 生年月日フォーマット
      const birthdate = `${form.year}-${form.month.padStart(2, '0')}-${form.day.padStart(2, '0')}`

      // 3. profiles に INSERT
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: userId,
        nickname: form.nickname.trim(),
        birthdate,
        gender: form.gender,
        looking_for: form.lookingFor,
        university: form.university,
        department: form.department.trim() || null,
        grade: form.grade ? parseInt(form.grade) : null,
        bio: form.bio.trim() || null,
        hobbies: form.hobbies,
      })
      if (profileError) throw profileError

      // 4. photos に INSERT
      const photoRows = storagePaths.map((storage_path, i) => ({
        user_id: userId,
        storage_path,
        sort_order: i,
        is_main: i === 0,
      }))
      const { error: photosError } = await supabase.from('photos').insert(photoRows)
      if (photosError) throw photosError

      // 5. ストアを更新してホームへ
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      setProfile(profile as Profile)
      router.replace('/(main)/home')
    } catch (e) {
      setError(getSaveErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
    >
      {/* 進捗バー */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / TOTAL_STEPS) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {step + 1} / {TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>

        {/* ---- Step 0: ニックネーム ---- */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.hint}>アプリ内で表示される名前です（本名不要）</Text>
            <Input
              placeholder="例: たろう"
              value={form.nickname}
              onChangeText={(v) => set('nickname', v)}
              maxLength={20}
              autoFocus
            />
            <Text style={styles.counter}>{form.nickname.length} / 20</Text>
          </View>
        )}

        {/* ---- Step 1: 生年月日 ---- */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.hint}>18歳以上の方のみご利用いただけます</Text>
            <View style={styles.dateRow}>
              <Input
                label="年"
                placeholder="2000"
                value={form.year}
                onChangeText={(v) => set('year', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.yearInput}
              />
              <Input
                label="月"
                placeholder="1"
                value={form.month}
                onChangeText={(v) => set('month', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={2}
                style={styles.mmddInput}
              />
              <Input
                label="日"
                placeholder="1"
                value={form.day}
                onChangeText={(v) => set('day', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={2}
                style={styles.mmddInput}
              />
            </View>
          </View>
        )}

        {/* ---- Step 2: 性別 ---- */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.hint}>自分の性別を選んでください</Text>
            <View style={styles.genderRow}>
              {(['male', 'female', 'other'] as Gender[]).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderCard,
                    form.gender === g && styles.genderCardActive,
                  ]}
                  onPress={() => toggleGender(g, 'gender')}
                >
                  <Text style={styles.genderEmoji}>
                    {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'}
                  </Text>
                  <Text
                    style={[
                      styles.genderLabel,
                      form.gender === g && styles.genderLabelActive,
                    ]}
                  >
                    {GENDER_LABELS[g]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ---- Step 3: 探している相手の性別（複数選択可） ---- */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.hint}>複数選択できます</Text>
            <View style={styles.genderRow}>
              {(['male', 'female', 'other'] as Gender[]).map((g) => {
                const selected = form.lookingFor.includes(g)
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderCard, selected && styles.genderCardActive]}
                    onPress={() => toggleGender(g, 'lookingFor')}
                  >
                    <Text style={styles.genderEmoji}>
                      {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'}
                    </Text>
                    <Text
                      style={[
                        styles.genderLabel,
                        selected && styles.genderLabelActive,
                      ]}
                    >
                      {GENDER_LABELS[g]}
                    </Text>
                    {selected && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* ---- Step 4: 大学情報 ---- */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionLabel}>大学名</Text>
            <View style={styles.univList}>
              {UNIVERSITIES.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.univItem,
                    form.university === u && styles.univItemActive,
                  ]}
                  onPress={() => set('university', u)}
                >
                  <Text
                    style={[
                      styles.univText,
                      form.university === u && styles.univTextActive,
                    ]}
                  >
                    {u}
                  </Text>
                  {form.university === u && (
                    <Text style={styles.univCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="学部・専攻（任意）"
              placeholder="例: 工学部 情報工学科"
              value={form.department}
              onChangeText={(v) => set('department', v)}
              style={styles.deptInput}
            />

            <Text style={[styles.sectionLabel, { marginTop: theme.spacing.md }]}>
              学年（任意）
            </Text>
            <View style={styles.gradeRow}>
              {['', '1', '2', '3', '4', '5', '6'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.gradeChip,
                    form.grade === g && styles.gradeChipActive,
                  ]}
                  onPress={() => set('grade', g)}
                >
                  <Text
                    style={[
                      styles.gradeText,
                      form.grade === g && styles.gradeTextActive,
                    ]}
                  >
                    {g === '' ? '--' : `${g}年`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ---- Step 5: 自己紹介・趣味 ---- */}
        {step === 5 && (
          <View style={styles.stepContent}>
            <Input
              label="自己紹介（任意・500文字以内）"
              placeholder="趣味や好きなことを教えてください"
              value={form.bio}
              onChangeText={(v) => set('bio', v)}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={styles.bioInput}
            />
            <Text style={styles.counter}>{form.bio.length} / 500</Text>

            <Text style={[styles.sectionLabel, { marginTop: theme.spacing.lg }]}>
              趣味・好きなこと（任意）
            </Text>
            <View style={styles.hobbyGrid}>
              {HOBBY_OPTIONS.map((h) => {
                const selected = form.hobbies.includes(h)
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.hobbyChip, selected && styles.hobbyChipActive]}
                    onPress={() => toggleHobby(h)}
                  >
                    <Text
                      style={[
                        styles.hobbyText,
                        selected && styles.hobbyTextActive,
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* ---- Step 6: 写真 ---- */}
        {step === 6 && (
          <View style={styles.stepContent}>
            <Text style={styles.hint}>
              最低{MIN_PROFILE_PHOTOS}枚・最大{MAX_PROFILE_PHOTOS}枚。最初の写真がメイン写真になります。
            </Text>
            <View style={styles.photoGrid}>
              {Array.from({ length: MAX_PROFILE_PHOTOS }, (_, i) => {
                const uri = photos[i]
                const isNextSlot = i === photos.length && photos.length < MAX_PROFILE_PHOTOS
                const isEmpty = !uri && !isNextSlot

                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.photoSlot, isEmpty && styles.photoSlotDisabled]}
                    onPress={uri ? () => removePhoto(i) : isNextSlot ? addPhoto : undefined}
                    disabled={isEmpty}
                    activeOpacity={0.7}
                  >
                    {uri ? (
                      <>
                        <Image source={{ uri }} style={styles.photoImage} />
                        <View style={styles.removeOverlay}>
                          <Text style={styles.removeIcon}>×</Text>
                        </View>
                        {i === 0 && (
                          <View style={styles.mainBadge}>
                            <Text style={styles.mainBadgeText}>メイン</Text>
                          </View>
                        )}
                      </>
                    ) : isNextSlot ? (
                      <Text style={styles.addIcon}>＋</Text>
                    ) : (
                      <View style={styles.lockedSlot} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
            <Text style={styles.photoHint}>
              タップした写真は削除されます
            </Text>
          </View>
        )}

        {/* エラー表示 */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* ナビゲーションボタン */}
        <View style={styles.navButtons}>
          {step > 0 && (
            <Button
              title="戻る"
              onPress={handleBack}
              variant="ghost"
              style={styles.backBtn}
            />
          )}
          {step < TOTAL_STEPS - 1 ? (
            <Button
              title="次へ"
              onPress={handleNext}
              style={styles.nextBtn}
            />
          ) : (
            <Button
              title="プロフィールを作成"
              onPress={handleSubmit}
              loading={saving}
              style={styles.nextBtn}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ================================================================
// スタイル
// ================================================================

const styles = StyleSheet.create({
  progressContainer: {
    paddingTop: 56,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.bg,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.muted,
    textAlign: 'right',
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 48,
  },
  stepTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  stepContent: {
    gap: theme.spacing.sm,
  },
  counter: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.muted,
    textAlign: 'right',
  },

  // 生年月日
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  yearInput: {
    flex: 2,
  },
  mmddInput: {
    flex: 1,
  },

  // 性別選択
  genderRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  genderCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  genderCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255,45,85,0.12)',
  },
  genderEmoji: {
    fontSize: 28,
  },
  genderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.muted,
    fontWeight: '500',
  },
  genderLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 10,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: theme.fontSize.sm,
  },

  // 大学
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.muted,
    marginBottom: 6,
  },
  univList: {
    gap: theme.spacing.xs,
  },
  univItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  univItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255,45,85,0.1)',
  },
  univText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.muted,
  },
  univTextActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  univCheck: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  deptInput: {
    marginTop: theme.spacing.md,
  },
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  gradeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  gradeChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255,45,85,0.12)',
  },
  gradeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.muted,
  },
  gradeTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // 自己紹介
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  hobbyChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  hobbyChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255,45,85,0.12)',
  },
  hobbyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.muted,
  },
  hobbyTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // 写真
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: theme.spacing.sm,
  },
  photoSlot: {
    width: '48%',
    aspectRatio: 3 / 4,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoSlotDisabled: {
    opacity: 0.3,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  mainBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  addIcon: {
    fontSize: 28,
    color: theme.colors.muted,
  },
  lockedSlot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  photoHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },

  // エラー・ボタン
  error: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    textAlign: 'center',
    lineHeight: 20,
  },
  navButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
})
