"use client";

import { useState, useRef, useEffect } from "react";
import Video from "next-video";
import vid2 from "../../../videos/tt2.mp4";
import vid3 from "../../../videos/tt2.mp4";
import ArrowButtons from "./ArrowButtons";
import ActionButtons from "./ActionButtons";


interface ArrowButtonsProps {

  onUp: () => void;

  onDown: () => void;

}



export default function VideoPlayer() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // List of videos with additional metadata
  const videos = [
    {
      src: vid3,
      key: "video-1"
    },
    {
      src: vid2,
      key: "video-2"
    }
  ];

  // Handle video loading and errors
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleError = (error: Event) => {
      console.error('Video playback error:', error);
      // Attempt to reload the video on error
      videoElement.load();
      videoElement.play().catch((e: Error) => console.error('Replay failed:', e));
    };

    const handleStalled = () => {
      // Attempt to recover from stall
      videoElement.load();
      videoElement.play().catch(e => console.error('Stall recovery failed:', e));
    };

    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('stalled', handleStalled);

    return () => {
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('stalled', handleStalled);
    };
  }, [currentVideoIndex]);

  const handleUp = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };

  const handleDown = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex === videos.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-x-0 top-0 flex justify-center">
        <div className="w-full max-w-md aspect-video">
          <Video
            ref={videoRef}
            key={videos[currentVideoIndex].key} // Add key to force remount
            src={videos[currentVideoIndex].src}
            autoPlay
            loop
            muted
            playsInline // Add playsInline for better mobile support
            controls={false}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video error:', e);
              // You could also show a user-friendly error message here
            }}
          />
        </div>
      </div>

      <ActionButtons />
      <ArrowButtons onUp={handleUp} onDown={handleDown} />
    </div>
  );
}