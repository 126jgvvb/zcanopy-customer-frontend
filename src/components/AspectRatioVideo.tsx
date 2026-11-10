"use client";

import { useState } from "react";

interface AspectRatioVideoProps {
  src: string;
  className?: string;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  /** Optional still frame shown before the video paints. */
  poster?: string;
  /** CSS aspect-ratio value. The box is reserved at this ratio before load. */
  aspectRatio?: string;
  /** object-fit used inside the reserved frame. */
  fit?: "cover" | "contain";
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

/**
 * A video frame whose height is reserved from first paint.
 *
 * The previous implementation waited for `loadedmetadata` and then switched
 * between `h-auto` and `h-full`, which animated the height of the page on every
 * slow phone video. Here the wrapper owns an explicit aspect ratio and the
 * video is absolutely positioned inside it, so metadata never changes layout.
 */
export default function AspectRatioVideo({
  src,
  className = "",
  controls = true,
  preload = "metadata",
  poster,
  aspectRatio = "16 / 9",
  fit = "cover",
  width = 1920,
  height = 1080,
  autoPlay = false,
  loop = false,
  muted = false,
}: AspectRatioVideoProps) {
  const [painted, setPainted] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-black/5 ${className}`}
      style={{ aspectRatio }}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
          className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${
            fit === "contain" ? "object-contain" : "object-cover"
          } ${painted ? "opacity-0" : "opacity-100"}`}
        />
      ) : null}
      <video
        src={src}
        poster={poster}
        width={width}
        height={height}
        className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        controls={controls}
        preload={preload}
        playsInline
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        onLoadedData={() => setPainted(true)}
      />
    </div>
  );
}
