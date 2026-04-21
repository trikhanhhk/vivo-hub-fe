import type {
  ApiResponse,
  AudioMergeJob,
  CreateProjectRequest,
  CreateTtsAudioRequest,
  MergeAudioRequest,
  Project,
  TtsAudio,
} from '../types'

const BASE_URL = '/api'

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err?.message ?? res.statusText)
  }

  return res.json()
}

// ─── Projects ────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: () => request<{ projects: Project[] }>('/projects'),
  getById: (id: number) => request<Project>(`/projects/${id}`),
  create: (body: CreateProjectRequest) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: CreateProjectRequest) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: number) =>
    request<null>(`/projects/${id}`, { method: 'DELETE' }),
}

// ─── TTS Audio ────────────────────────────────────────────────────────────────

export const ttsAudioApi = {
  getById: (id: number) => request<TtsAudio>(`/tts-audio/${id}`),
  create: (body: CreateTtsAudioRequest) =>
    request<TtsAudio>('/tts-audio', { method: 'POST', body: JSON.stringify(body) }),
  stream: (id: number) => `${BASE_URL}/tts-audio/${id}/stream`,
}

// ─── Audio Merge ─────────────────────────────────────────────────────────────

export const audioMergeApi = {
  merge: (body: MergeAudioRequest) =>
    request<AudioMergeJob>('/audio-merge', { method: 'POST', body: JSON.stringify(body) }),
  listJobs: () => request<AudioMergeJob[]>('/audio-merge/jobs'),
  getJob: (id: number) => request<AudioMergeJob>(`/audio-merge/jobs/${id}`),
  downloadUrl: (id: number) => `${BASE_URL}/audio-merge/jobs/${id}/download`,
}
