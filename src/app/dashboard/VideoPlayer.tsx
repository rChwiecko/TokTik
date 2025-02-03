"use client"

import { useState, useRef, useEffect } from "react"
import Video from "next-video"
import vid2 from "../../../videos/tt2.mp4"
import vid3 from "../../../videos/tt2.mp4"
import ArrowButtons from "./ArrowButtons"
import ActionButtons from "./ActionButtons"
import UploadVideo from "./UploadVideo"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface ArrowButtonsProps {
  onUp: () => void
  onDown: () => void
}

export default function VideoPlayer() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // List of videos with additional metadata
  const [videos, setVideos] = useState([
    {
      src: vid3,
      key: "video-1",
    },
    {
      src: vid2,
      key: "video-2",
    },
  ])

  // Handle video loading and errors
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleError = (error: Event) => {
      console.error("Video playback error:", error)
      // Attempt to reload the video on error
      videoElement.load()
      videoElement.play().catch((e: Error) => console.error("Replay failed:", e))
    }

    const handleStalled = () => {
      // Attempt to recover from stall
      videoElement.load()
      videoElement.play().catch((e) => console.error("Stall recovery failed:", e))
    }

    videoElement.addEventListener("error", handleError)
    videoElement.addEventListener("stalled", handleStalled)

    return () => {
      videoElement.removeEventListener("error", handleError)
      videoElement.removeEventListener("stalled", handleStalled)
    }
  }, [videoRef]) // Only depend on videoRef

  const handleUp = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex === 0 ? videos.length - 1 : prevIndex - 1))
  }

  const handleDown = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex === videos.length - 1 ? 0 : prevIndex + 1))
  }

  const handleUpload = (file: File) => {
    const newVideoUrl = URL.createObjectURL(file)
    setVideos([...videos, { src: newVideoUrl, key: `video-${videos.length + 1}` }])
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-x-0 top-0 flex justify-center">
        <div className="w-full max-w-md aspect-video">
          <Video
            ref={videoRef}
            key={videos[currentVideoIndex].key}
            src={videos[currentVideoIndex].src}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Video error:", e)
            }}
          />
        </div>
      </div>

      <ActionButtons />
      <ArrowButtons onUp={handleUp} onDown={handleDown} />

      <Button onClick={() => setShowUpload(true)} className="fixed top-4 right-4 z-10" size="icon">
        <Upload className="h-4 w-4" />
      </Button>

      {showUpload && <UploadVideo onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
    </div>
  )
}

