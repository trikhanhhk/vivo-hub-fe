import { useState, useRef, useCallback } from 'react'
import { clsx } from 'clsx'
import type { ProjectSegment } from '../../types'

interface TimelineProps {
  duration: number // total duration in seconds
  videoSegments: ProjectSegment[]
  audioSegments: ProjectSegment[]
  onAudioSegmentChange: (seg: ProjectSegment) => void
  onAddAudioSegment: (start: number, end: number) => void
  selectedAudioId: number | null
  onSelectAudio: (id: number | null) => void
}

const PIXELS_PER_SECOND = 50
const MIN_SEG_DURATION = 0.5

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(1)
  return `${m}:${sec.padStart(4, '0')}`
}

export function Timeline({
  duration,
  videoSegments,
  audioSegments,
  onAudioSegmentChange,
  onAddAudioSegment,
  selectedAudioId,
  onSelectAudio,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<{
    id: number
    edge: 'left' | 'right' | 'move'
    startX: number
    origStart: number
    origEnd: number
  } | null>(null)

  // Ruler ticks
  const ticks = Array.from({ length: Math.floor(duration) + 1 }, (_, i) => i)

  const totalWidth = duration * PIXELS_PER_SECOND

  function xToTime(x: number): number {
    return Math.max(0, Math.min(duration, x / PIXELS_PER_SECOND))
  }

  // ─── Drag handlers ──────────────────────────────────────────────────────────

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return
      const dx = e.clientX - dragging.startX
      const dt = dx / PIXELS_PER_SECOND
      const seg = audioSegments.find((s) => s.id === dragging.id)
      if (!seg) return

      let newStart = dragging.origStart
      let newEnd = dragging.origEnd

      if (dragging.edge === 'move') {
        const segLen = dragging.origEnd - dragging.origStart
        newStart = Math.max(0, Math.min(duration - segLen, dragging.origStart + dt))
        newEnd = newStart + segLen
      } else if (dragging.edge === 'left') {
        newStart = Math.max(0, Math.min(dragging.origEnd - MIN_SEG_DURATION, dragging.origStart + dt))
      } else {
        newEnd = Math.min(duration, Math.max(dragging.origStart + MIN_SEG_DURATION, dragging.origEnd + dt))
      }

      onAudioSegmentChange({ ...seg, start_time: +newStart.toFixed(2), end_time: +newEnd.toFixed(2) })
    },
    [dragging, audioSegments, duration, onAudioSegmentChange],
  )

  const onMouseUp = useCallback(() => setDragging(null), [])

  // ─── New segment by click-drag on audio track ────────────────────────────

  const [newDrag, setNewDrag] = useState<{ startX: number; currentX: number } | null>(null)

  function handleTrackMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    // only create if clicked directly on track (not on a segment)
    if ((e.target as HTMLElement).dataset.seg) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    setNewDrag({ startX: x, currentX: x })
    onSelectAudio(null)
  }

  function handleTrackMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!newDrag) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    setNewDrag((d) => d && { ...d, currentX: x })
  }

  function handleTrackMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if (!newDrag) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const startX = Math.min(newDrag.startX, x)
    const endX = Math.max(newDrag.startX, x)
    const start = xToTime(startX)
    const end = xToTime(endX)
    if (end - start >= MIN_SEG_DURATION) {
      onAddAudioSegment(+start.toFixed(2), +end.toFixed(2))
    }
    setNewDrag(null)
  }

  const newDragLeft = newDrag ? Math.min(newDrag.startX, newDrag.currentX) : 0
  const newDragWidth = newDrag ? Math.abs(newDrag.currentX - newDrag.startX) : 0

  return (
    <div
      className="relative select-none overflow-x-auto"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      ref={timelineRef}
    >
      <div style={{ width: Math.max(totalWidth + 64, 400) }} className="min-h-0">
        {/* ── Ruler ── */}
        <div className="relative h-7 border-b border-surface-700 bg-surface-900">
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: t * PIXELS_PER_SECOND }}
            >
              <div className="h-3 w-px bg-surface-600" />
              <span className="text-[10px] text-surface-500 mt-0.5 leading-none">{formatTime(t)}</span>
            </div>
          ))}
        </div>

        {/* ── Video track ── */}
        <div className="relative h-10 border-b border-surface-800 bg-surface-950/50">
          <span className="absolute left-0 top-0 flex h-full w-10 items-center justify-center border-r border-surface-800 text-[10px] font-medium text-surface-500 uppercase tracking-wider">
            Vid
          </span>
          <div className="absolute left-10 top-0 h-full">
            {videoSegments.map((seg) => (
              <div
                key={seg.id}
                className="absolute top-1 h-8 rounded border border-blue-500/50 bg-blue-500/20"
                style={{
                  left: seg.start_time * PIXELS_PER_SECOND,
                  width: (seg.end_time - seg.start_time) * PIXELS_PER_SECOND,
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-blue-300 truncate px-1">
                  {seg.url ? seg.url.split('/').pop() : `Clip ${seg.segment_index + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Audio track ── */}
        <div
          className="relative h-12 cursor-crosshair select-none"
          onMouseDown={handleTrackMouseDown}
          onMouseMove={handleTrackMouseMove}
          onMouseUp={handleTrackMouseUp}
        >
          <span className="pointer-events-none absolute left-0 top-0 flex h-full w-10 items-center justify-center border-r border-surface-800 text-[10px] font-medium text-surface-500 uppercase tracking-wider bg-surface-950/50 z-10">
            Aud
          </span>
          <div className="absolute left-10 top-0 h-full w-full">
            {/* New drag ghost */}
            {newDrag && (
              <div
                className="pointer-events-none absolute top-1 h-10 rounded border border-brand-400/60 bg-brand-500/10"
                style={{ left: newDragLeft, width: newDragWidth }}
              />
            )}

            {audioSegments.map((seg) => {
              const isSelected = seg.id === selectedAudioId
              return (
                <div
                  key={seg.id}
                  data-seg="1"
                  className={clsx(
                    'absolute top-1 h-10 rounded border transition-colors duration-100 cursor-grab active:cursor-grabbing overflow-hidden',
                    isSelected
                      ? 'border-brand-400 bg-brand-500/30 ring-1 ring-brand-400/60'
                      : 'border-brand-600/50 bg-brand-500/15 hover:border-brand-400/60',
                  )}
                  style={{
                    left: seg.start_time * PIXELS_PER_SECOND,
                    width: Math.max((seg.end_time - seg.start_time) * PIXELS_PER_SECOND, 4),
                  }}
                  onClick={(e) => { e.stopPropagation(); onSelectAudio(seg.id) }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const rect = e.currentTarget.getBoundingClientRect()
                    const relX = e.clientX - rect.left
                    const width = rect.width
                    const edge =
                      relX < 8 ? 'left' : relX > width - 8 ? 'right' : 'move'
                    setDragging({
                      id: seg.id,
                      edge,
                      startX: e.clientX,
                      origStart: seg.start_time,
                      origEnd: seg.end_time,
                    })
                    onSelectAudio(seg.id)
                  }}
                >
                  {/* Resize handles */}
                  <div className="absolute left-0 top-0 w-2 h-full cursor-w-resize" data-seg="1" />
                  <div className="absolute right-0 top-0 w-2 h-full cursor-e-resize" data-seg="1" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-[10px] text-brand-200 truncate">
                    {seg.text ?? `${formatTime(seg.start_time)} – ${formatTime(seg.end_time)}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
