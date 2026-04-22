import { forwardRef, useImperativeHandle, useRef } from 'react'

export interface VideoPlayerHandle {
  seekTo: (t: number) => void
  get currentTime(): number
  get duration(): number
}

interface VideoPlayerProps {
  src: string
  onTimeUpdate?: (t: number) => void
  onDurationChange?: (d: number) => void
  className?: string
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ src, onTimeUpdate, onDurationChange, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useImperativeHandle(ref, () => ({
      seekTo(t: number) {
        if (videoRef.current) videoRef.current.currentTime = t
      },
      get currentTime() {
        return videoRef.current?.currentTime ?? 0
      },
      get duration() {
        return videoRef.current?.duration ?? 0
      },
    }))

    return (
      <video
        ref={videoRef}
        src={src}
        controls
        className={className}
        onTimeUpdate={() => onTimeUpdate?.(videoRef.current?.currentTime ?? 0)}
        onDurationChange={() => onDurationChange?.(videoRef.current?.duration ?? 0)}
      />
    )
  },
)

VideoPlayer.displayName = 'VideoPlayer'
