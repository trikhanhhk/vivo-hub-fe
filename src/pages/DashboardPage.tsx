import { Film, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMergeJobs } from '../hooks/useApi'
import { StatusBadge, PageLoader, ErrorMessage } from '../components/ui'
import { audioMergeApi } from '../api'
import type { AudioMergeJob } from '../types'

export function DashboardPage() {
  const { data: jobs, isLoading, error } = useMergeJobs()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-surface-800 px-6 py-4">
        <h1 className="text-lg font-semibold text-surface-50">Dashboard</h1>
        <p className="text-xs text-surface-400">Overview of your workspace</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/projects"
            className="flex items-center gap-4 rounded-xl border border-surface-800 bg-surface-900 p-5 hover:border-surface-700 hover:bg-surface-800 transition-colors"
          >
            <div className="flex size-11 items-center justify-center rounded-lg bg-brand-600/20 text-brand-400">
              <Film className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-100">Projects</p>
              <p className="text-xs text-surface-400">Manage your video projects</p>
            </div>
          </Link>
          <Link
            to="/merge-jobs"
            className="flex items-center gap-4 rounded-xl border border-surface-800 bg-surface-900 p-5 hover:border-surface-700 hover:bg-surface-800 transition-colors"
          >
            <div className="flex size-11 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Layers className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-100">Merge Jobs</p>
              <p className="text-xs text-surface-400">Track audio merge status</p>
            </div>
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-surface-300">Recent Merge Jobs</h2>
          {isLoading && <PageLoader />}
          {error && <ErrorMessage message={error.message} />}
          {jobs && jobs.length > 0 && (
            <div className="flex flex-col gap-2">
              {jobs.slice(0, 5).map((job: AudioMergeJob) => (
                <div
                  key={job.id}
                  className="flex items-center gap-3 rounded-lg border border-surface-800 bg-surface-900 px-4 py-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-100">{job.file_name}</p>
                    <p className="text-xs text-surface-500">
                      {new Date(job.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                  {job.status === 'Completed' && (
                    <a
                      href={audioMergeApi.downloadUrl(job.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-400 hover:text-brand-300"
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
    </div>
  )
}
