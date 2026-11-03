export type Gender = 'male' | 'female' | 'other'
export type LikeAction = 'like' | 'pass'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type ReportReason =
  | 'fake_profile'
  | 'harassment'
  | 'inappropriate'
  | 'solicitation'
  | 'underage'
  | 'other'

export interface Profile {
  user_id: string
  nickname: string
  birthdate: string       // YYYY-MM-DD
  gender: Gender
  looking_for: Gender[]
  university: string
  department: string | null
  grade: number | null
  hometown: string | null
  profile_type: string | null
  ideal_date: string | null
  bio: string | null
  hobbies: string[]
  created_at: string
  updated_at: string
}

export interface PublicProfile {
  user_id: string
  nickname: string
  age: number
  gender: Gender
  university: string
  department: string | null
  grade: number | null
  hometown: string | null
  profile_type: string | null
  ideal_date: string | null
  bio: string | null
  hobbies: string[]
  personality: string[]
}

export interface Photo {
  id: string
  user_id: string
  storage_path: string
  sort_order: number
  is_main: boolean
  created_at: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  matched_at: string
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  body: string
  sent_at: string
}

export interface Verification {
  user_id: string
  storage_path: string
  status: VerificationStatus
  submitted_at: string
  reviewed_at: string | null
  reject_note: string | null
}

export interface AllowedEmailDomain {
  domain: string
  university: string
  note: string | null
}
