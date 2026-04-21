import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, Upload, Trash2, Play, Layers,
  FileVideo, Music, ChevronRight, Pencil, Download,
} from 'lucide-react'
import { Button, Input, Textarea, Modal, PageLoader, ErrorMessage, StatusBadge } from '../../components/ui'
import { Timeline } from './Timeline'
import { useProject, useUpdateProject, useMergeAudio, useMergeJob } from '../../hooks/useApi'

import type { ProjectSegment, CreateProjectSegmentRequest } from '../../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nextIndex(segs: ProjectSegment[]) {
  return segs.length === 0 ? 0 : Math.max(...segs.map((s) => s.segment_index)) + 1
}

function calcDuration(segs: ProjectSegment[]) {
  if (segs.length === 0) return 30
  return Math.max(30, ...segs.map((s) => s.end_time))
}

// ─── VideoSegmentPanel ────────────────────────────────────────────────────────

function VideoSegmentPanel({
  segments,
  onAdd,
  onRemove,
}: {
  segments: ProjectSegment[]
  onAdd: (url: string) => void
  onRemove: (id: number) => void
}) {
  const [urlInput, setUrlInput] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-surface-200">
          <FileVideo className="size-4 text-blue-400" />
          Video Clips
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="size-3.5" />}
          onClick={() => setAddOpen(true)}
        >
          Add
        </Button>
      </div>

      {segments.length === 0 ? (
        <p className="text-xs text-surface-500 italic">No video clips added yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {segments.map((seg, i) => (
            <div
              key={seg.id}
              className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-800 px-3 py-2"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-surface-200 truncate">
                  {seg.url ? seg.url.split('/').pop() : `Clip ${i + 1}`}
                </p>
                <p className="text-[10px] text-surface-500">
                  {seg.start_time.toFixed(1)}s – {seg.end_time.toFixed(1)}s
                </p>
              </div>
              <button
                onClick={() => onRemove(seg.id)}
                className="shrink-0 text-surface-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Video Clip"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (urlInput.trim()) {
                  onAdd(urlInput.trim())
                  setUrlInput('')
                  setAddOpen(false)
                }
              }}
            >
              Add Clip
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Video URL"
            placeholder="https://example.com/video.mp4"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-surface-600 p-4 text-center">
            <Upload className="size-5 text-surface-500 mx-auto" />
            <span className="text-xs text-surface-400">Upload coming soon</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── AudioSegmentPanel ────────────────────────────────────────────────────────

function AudioSegmentPanel({
  segment,
  onUpdate,
  onRemove,
}: {
  segment: ProjectSegment | null
  onUpdate: (id: number, text: string) => void
  onRemove: (id: number) => void
}) {
  const [text, setText] = useState(segment?.text ?? '')
  const [saved, setSaved] = useState(false)

  if (!segment)
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Music className="size-8 text-surface-600" />
        <p className="text-xs text-surface-500">
          Drag on the audio track to add a segment
        </p>
      </div>
    )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-surface-200">
        <Music className="size-4 text-brand-400" />
        Audio Segment
      </div>
      <div className="rounded-lg border border-surface-700 bg-surface-800 p-3 text-xs text-surface-400 grid grid-cols-2 gap-2">
        <div>
          <span className="text-surface-500">Start</span>
          <p className="text-surface-200 font-mono">{segment.start_time.toFixed(2)}s</p>
        </div>
        <div>
          <span className="text-surface-500">End</span>
          <p className="text-surface-200 font-mono">{segment.end_time.toFixed(2)}s</p>
        </div>
      </div>
      <Textarea
        label="TTS Text"
        placeholder="Enter text to be spoken..."
        rows={4}
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false) }}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={<Pencil className="size-3.5" />}
          onClick={() => { onUpdate(segment.id, text); setSaved(true) }}
          className="flex-1"
        >
          {saved ? 'Saved!' : 'Save Text'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="size-3.5" />}
          onClick={() => onRemove(segment.id)}
        />
      </div>
    </div>
  )
}

// ─── MergeJobStatus ───────────────────────────────────────────────────────────

function MergeJobStatus({ jobId }: { jobId: number }) {
  const { data: job } = useMergeJob(jobId)
  if (!job) return null
  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-700 bg-surface-800 p-3">
      <div className="flex-1">
        <p className="text-xs text-surface-400">Merge Job #{job.id}</p>
        <p className="text-sm font-medium text-surface-100">{job.file_name}</p>
      </div>
      <StatusBadge status={job.status} />
      {job.status === 'Completed' && job.audio_url && (
        <a
          href={job.audio_url}
          target="_blank"
          rel="noreferrer"
          className="flex size-7 items-center justify-center rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30"
        >
          <Download className="size-3.5" />
        </a>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ProjectEditorPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const { data: project, isLoading, error } = useProject(projectId)
  const updateMutation = useUpdateProject(projectId)
  const mergeAudioMutation = useMergeAudio()

  // Local segment state (mirrors project, allows live edits before saving)
  const [videoSegs, setVideoSegs] = useState<ProjectSegment[]>([])
  const [audioSegs, setAudioSegs] = useState<ProjectSegment[]>([])
  const [selectedAudioId, setSelectedAudioId] = useState<number | null>(null)
  const [mergeJobId, setMergeJobId] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync from server once
  if (project && !initialized) {
    setVideoSegs(project.video_segments)
    setAudioSegs(project.audio_segments)
    setInitialized(true)
  }

  const selectedAudio = audioSegs.find((s) => s.id === selectedAudioId) ?? null

  const duration = calcDuration(videoSegs)

  // ─── Video handlers ──────────────────────────────────────────────────────

  const handleAddVideo = useCallback((url: string) => {
    const last = videoSegs[videoSegs.length - 1]
    const startTime = last ? last.end_time : 0
    const endTime = startTime + 10
    const tempId = Date.now()
    setVideoSegs((prev) => [
      ...prev,
      {
        id: tempId,
        project_id: projectId,
        segment_type: 'Video',
        segment_index: nextIndex(prev),
        start_time: startTime,
        end_time: endTime,
        text: null,
        url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }, [videoSegs, projectId])

  const handleRemoveVideo = useCallback((id: number) => {
    setVideoSegs((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // ─── Audio handlers ──────────────────────────────────────────────────────

  const handleAddAudioSegment = useCallback((start: number, end: number) => {
    const tempId = Date.now()
    const newSeg: ProjectSegment = {
      id: tempId,
      project_id: projectId,
      segment_type: 'Audio',
      segment_index: nextIndex(audioSegs),
      start_time: start,
      end_time: end,
      text: null,
      url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setAudioSegs((prev) => [...prev, newSeg])
    setSelectedAudioId(tempId)
  }, [audioSegs, projectId])

  const handleAudioSegmentChange = useCallback((seg: ProjectSegment) => {
    setAudioSegs((prev) => prev.map((s) => (s.id === seg.id ? seg : s)))
  }, [])

  const handleUpdateAudioText = useCallback((id: number, text: string) => {
    setAudioSegs((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)))
  }, [])

  const handleRemoveAudio = useCallback((id: number) => {
    setAudioSegs((prev) => prev.filter((s) => s.id !== id))
    setSelectedAudioId(null)
  }, [])

  // ─── Save project ─────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    try {
      const toReq = (segs: ProjectSegment[]): CreateProjectSegmentRequest[] =>
        segs.map((s, i) => ({
          segment_index: i,
          start_time: s.start_time,
          end_time: s.end_time,
          text: s.text ?? undefined,
          url: s.url ?? undefined,
        }))

      await updateMutation.mutateAsync({
        name: project!.name,
        description: project!.description ?? undefined,
        video_segments: toReq(videoSegs),
        audio_segments: toReq(audioSegs),
      })
    } finally {
      setSaving(false)
    }
  }

  // ─── Merge audio ──────────────────────────────────────────────────────────

  async function handleMerge() {
    const segsWithText = audioSegs.filter((s) => s.text && s.text.trim())
    if (segsWithText.length === 0) {
      alert('Add text to at least one audio segment first.')
      return
    }
    const res = await mergeAudioMutation.mutateAsync({
      metadata: { file_name: `${project!.name.replace(/\s+/g, '_')}_audio.mp3` },
      segments: segsWithText.map((s) => ({
        text: s.text!,
        start_time: s.start_time,
        end_time: s.end_time,
      })),
    })
    setMergeJobId(res.data.id)
  }

  if (isLoading) return <PageLoader />
  if (error) return <div className="p-6"><ErrorMessage message={error.message} /></div>
  if (!project) return null

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-950">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 border-b border-surface-800 bg-surface-900 px-4 py-3">
        <Link
          to="/projects"
          className="flex items-center gap-1 text-sm text-surface-400 hover:text-surface-100 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Projects
        </Link>
        <ChevronRight className="size-4 text-surface-600" />
        <h1 className="text-sm font-semibold text-surface-100">{project.name}</h1>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Play className="size-3.5" />}
            onClick={() => project.final_url && window.open(project.final_url, '_blank')}
            disabled={!project.final_url}
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Layers className="size-3.5" />}
            loading={mergeAudioMutation.isPending}
            onClick={handleMerge}
          >
            Merge Audio
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel – properties */}
        <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-surface-800 bg-surface-900 p-4">
          <VideoSegmentPanel
            segments={videoSegs}
            onAdd={handleAddVideo}
            onRemove={handleRemoveVideo}
          />

          <div className="h-px bg-surface-800" />

          <AudioSegmentPanel
            segment={selectedAudio}
            onUpdate={handleUpdateAudioText}
            onRemove={handleRemoveAudio}
          />

          {mergeJobId && (
            <>
              <div className="h-px bg-surface-800" />
              <MergeJobStatus jobId={mergeJobId} />
            </>
          )}
        </aside>

        {/* Center – preview + timeline */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Preview area */}
          <div className="flex flex-1 items-center justify-center bg-black overflow-hidden">
            {project.final_url ? (
              <video
                key={project.final_url}
                controls
                className="max-h-full max-w-full"
                src={project.final_url}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-surface-600">
                <FileVideo className="size-16" />
                <p className="text-sm">No preview available</p>
                <p className="text-xs text-surface-700">Add video clips and save your project</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="border-t border-surface-800 bg-surface-900">
            <div className="flex items-center justify-between px-4 py-2 border-b border-surface-800">
              <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                Timeline
              </span>
              <span className="text-xs text-surface-500">
                {videoSegs.length} clips · {audioSegs.length} audio segments
              </span>
            </div>
            <Timeline
              duration={duration}
              videoSegments={videoSegs}
              audioSegments={audioSegs}
              onAudioSegmentChange={handleAudioSegmentChange}
              onAddAudioSegment={handleAddAudioSegment}
              selectedAudioId={selectedAudioId}
              onSelectAudio={setSelectedAudioId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
