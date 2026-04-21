import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

// Query keys
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: number) => ['projects', id] as const,
  ttsAudio: (id: number) => ['tts-audio', id] as const,
  mergeJobs: ['merge-jobs'] as const,
  mergeJob: (id: number) => ['merge-jobs', id] as const,
}
