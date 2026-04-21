import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Plus, Trash2, Search, Clock, ChevronRight } from 'lucide-react'
import { Button, Modal, Input, Textarea, PageLoader, ErrorMessage, EmptyState } from '../../components/ui'
import { useProjects, useCreateProject, useDeleteProject } from '../../hooks/useApi'

export function ProjectsPage() {
  const navigate = useNavigate()
  const { data: projects, isLoading, error } = useProjects()
  const createMutation = useCreateProject()
  const deleteMutation = useDeleteProject()

  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [formError, setFormError] = useState('')

  const filtered = (projects ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleCreate() {
    if (form.name.trim().length < 3) {
      setFormError('Name must be at least 3 characters')
      return
    }
    try {
      const res = await createMutation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      })
      setCreateOpen(false)
      setForm({ name: '', description: '' })
      setFormError('')
      navigate(`/projects/${res.data.id}`)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to create project')
    }
  }

  function openCreate() {
    setForm({ name: '', description: '' })
    setFormError('')
    setCreateOpen(true)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-surface-50">Projects</h1>
          <p className="text-xs text-surface-400">{projects?.length ?? 0} projects</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="size-4" />} onClick={openCreate}>
          New Project
        </Button>
      </div>

      {/* Search */}
      <div className="border-b border-surface-800 px-6 py-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-surface-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="h-9 w-full rounded-md border border-surface-700 bg-surface-800 pl-9 pr-3 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-3">
          <ErrorMessage message={error.message} />
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Film className="size-12" />}
            title="No projects found"
            description="Create your first project to get started"
            action={
              <Button variant="primary" icon={<Plus className="size-4" />} onClick={openCreate}>
                New Project
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col rounded-xl border border-surface-800 bg-surface-900 overflow-hidden hover:border-surface-700 hover:bg-surface-800/80 transition-all duration-150 cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-surface-800 flex items-center justify-center overflow-hidden">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Film className="size-10 text-surface-600" />
                  )}
                  {project.final_url && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                      Ready
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-surface-100 line-clamp-1 group-hover:text-white">
                      {project.name}
                    </h3>
                    <ChevronRight className="size-4 shrink-0 text-surface-500 mt-0.5" />
                  </div>
                  {project.description && (
                    <p className="text-xs text-surface-400 line-clamp-2">{project.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                      <Clock className="size-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                      <span>{project.video_segments.length} clips</span>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${project.name}"?`)) {
                      deleteMutation.mutate(project.id)
                    }
                  }}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md bg-black/40 text-surface-400 opacity-0 group-hover:opacity-100 hover:bg-red-600/60 hover:text-white transition-all duration-150"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createMutation.isPending}
              onClick={handleCreate}
            >
              Create Project
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Project Name"
            placeholder="My Awesome Video"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formError}
          />
          <Textarea
            label="Description (optional)"
            placeholder="What is this project about?"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  )
}
