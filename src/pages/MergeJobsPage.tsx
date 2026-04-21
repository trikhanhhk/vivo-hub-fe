import { useMergeJobs } from '../hooks/useApi'
import { StatusBadge, PageLoader, ErrorMessage, EmptyState } from '../components/ui'
import { Layers } from 'lucide-react'
import { audioMergeApi } from '../api'

export function MergeJobsPage() {
  const { data: jobs, isLoading, error } = useMergeJobs()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-surface-800 px-6 py-4">
        <h1 className="text-lg font-semibold text-surface-50">Merge Jobs</h1>
        <p className="text-xs text-surface-400">{jobs?.length ?? 0} jobs</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading && <PageLoader />}
        {error && <ErrorMessage message={error.message} />}
        {!isLoading && jobs?.length === 0 && (
          <EmptyState
            icon={<Layers className="size-12" />}
            title="No merge jobs"
            description="Merge jobs will appear here once you start merging audio from the editor."
          />
        )}
        {jobs && jobs.length > 0 && (
          <div className="flex flex-col gap-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-4 rounded-xl border border-surface-800 bg-surface-900 px-5 py-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-100 truncate">{job.file_name}</p>
                  <p className="text-xs text-surface-500">
                    Model: {job.model ?? 'default'} · {new Date(job.created_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={job.status} />
                {job.status === 'Completed' && (
                  <a
                    href={audioMergeApi.downloadUrl(job.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-brand-400 hover:text-brand-300 underline underline-offset-2"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
