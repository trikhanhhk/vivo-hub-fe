// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectSegmentType = 'Audio' | 'Video'

export interface ProjectSegment {
  id: number
  project_id: number
  segment_type: ProjectSegmentType
  segment_index: number
  start_time: number
  end_time: number
  text: string | null
  url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  name: string
  description: string | null
  thumbnail_url: string | null
  audio_url: string | null
  video_url: string | null
  final_url: string | null
  created_at: string
  updated_at: string
  audio_segments: ProjectSegment[]
  video_segments: ProjectSegment[]
}

export interface CreateProjectRequest {
  name: string
  description?: string
  audio_segments?: CreateProjectSegmentRequest[]
  video_segments?: CreateProjectSegmentRequest[]
}

export interface UploadVideoResponse {
  video_url: string
}

export interface CreateProjectSegmentRequest {
  segment_index: number
  start_time: number
  end_time: number
  text?: string
  url?: string
}

// ─── TTS Audio ────────────────────────────────────────────────────────────────

export type TtsAudioStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed'

export interface TtsAudio {
  id: number
  tts_name: string
  tts_model: string
  text: string
  audio_url: string | null
  status: TtsAudioStatus
  created_at: string
  updated_at: string
}

export interface CreateTtsAudioRequest {
  tts_name: string
  text: string
  tts_model: string
}

// ─── Audio Merge ──────────────────────────────────────────────────────────────

export type AudioMergeStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed'

export interface AudioMergeJob {
  id: number
  file_name: string
  model: string | null
  audio_url: string | null
  status: AudioMergeStatus
  created_at: string
  updated_at: string
}

export interface AudioSegmentRequest {
  text: string
  start_time: number
  end_time: number
}

export interface MergeAudioRequest {
  metadata: {
    file_name: string
    model?: string
  }
  segments: AudioSegmentRequest[]
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}
