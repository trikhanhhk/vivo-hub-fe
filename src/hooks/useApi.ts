import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, ttsAudioApi, audioMergeApi } from '../api'
import { queryKeys } from '../lib/queryClient'
import type { CreateProjectRequest, CreateTtsAudioRequest, MergeAudioRequest } from '../types'

// ─── Projects ─────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      const res = await projectsApi.list()
      return res.data.projects
    },
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: async () => {
      const res = await projectsApi.getById(id)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectRequest) => projectsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  })
}

export function useUpdateProject(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectRequest) => projectsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects })
      qc.invalidateQueries({ queryKey: queryKeys.project(id) })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  })
}

// ─── TTS Audio ────────────────────────────────────────────────────────────────

export function useTtsAudio(id: number) {
  return useQuery({
    queryKey: queryKeys.ttsAudio(id),
    queryFn: async () => {
      const res = await ttsAudioApi.getById(id)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateTtsAudio() {
  return useMutation({
    mutationFn: (body: CreateTtsAudioRequest) => ttsAudioApi.create(body),
  })
}

// ─── Audio Merge ─────────────────────────────────────────────────────────────

export function useMergeJobs() {
  return useQuery({
    queryKey: queryKeys.mergeJobs,
    queryFn: async () => {
      const res = await audioMergeApi.listJobs()
      return res.data
    },
  })
}

export function useMergeJob(id: number) {
  return useQuery({
    queryKey: queryKeys.mergeJob(id),
    queryFn: async () => {
      const res = await audioMergeApi.getJob(id)
      return res.data
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'Pending' || status === 'Processing' ? 2000 : false
    },
  })
}

export function useMergeAudio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: MergeAudioRequest) => audioMergeApi.merge(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mergeJobs }),
  })
}
