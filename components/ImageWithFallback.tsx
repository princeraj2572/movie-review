"use client"

import { useState } from "react"
import Image from "next/image"
import { Film } from "lucide-react"

interface ImageWithFallbackProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  objectFit?: "cover" | "contain" | "fill" | "scale-down"
  objectPosition?: string
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  priority = false,
  objectFit = "cover",
  objectPosition = "center",
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    setImageError(true)
  }

  if (imageError) {
    return (
      <div
        className={`bg-gradient-to-br from-[#1e1e1e] to-[#0f0f0f] flex items-center justify-center ${
          fill ? "absolute inset-0" : "w-full h-full"
        } ${className}`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Film className="w-8 h-8 text-[#6b7280]" />
          <span className="text-[#4b5563] text-xs text-center">Image unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      style={
        fill
          ? undefined
          : {
              objectFit,
              objectPosition,
            }
      }
      onError={handleError}
    />
  )
}
