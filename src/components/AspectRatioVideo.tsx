"use client";

import { useEffect, useRef, useState } from "react";

interface AspectRatioVideoProps {
  src: string;
  className?: string;
  controls?: boolean;
  preload?: string;
}

export default function AspectRatioVideo({ src, className = "", controls = true, preload = "metadata" }: AspectRatioVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const handleMetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width && height) {
        const ratio = width / height;
        setAspectRatio(ratio);
        setIsPortrait(ratio < 1);
      }
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    return () => video.removeEventListener("loadedmetadata", handleMetadata);
  }, [src]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-black/5 ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className={`w-full ${isPortrait ? "h-auto max-h-[60vh] mx-auto" : "h-full object-cover"}`}
        controls={controls}
        preload={preload}
        playsInline
      />
    </div>
  );
}
