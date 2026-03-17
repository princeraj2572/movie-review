"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Tv, ShoppingCart, PlayCircle } from "lucide-react"
import { getWatchProviders } from "@/lib/recommendations"

interface WhereToWatchProps {
  movieId: number
}

export default function WhereToWatch({ movieId }: WhereToWatchProps) {
  const [providers, setProviders] = useState<{
    flatrate: { name: string; logo: string }[]
    rent: { name: string; logo: string }[]
    buy: { name: string; logo: string }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWatchProviders(movieId).then(data => {
      setProviders(data)
      setLoading(false)
    })
  }, [movieId])

  if (loading) {
    return (
      <div className="bg-[#141414] border border-[#1e1e1e] p-5 rounded-sm animate-pulse">
        <div className="h-3 bg-[#1e1e1e] rounded w-32 mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 bg-[#1e1e1e] rounded-sm" />)}
        </div>
      </div>
    )
  }

  const hasAny = providers && (
    providers.flatrate.length > 0 ||
    providers.rent.length > 0 ||
    providers.buy.length > 0
  )

  if (!hasAny) {
    return (
      <div className="bg-[#141414] border border-[#1e1e1e] p-5 rounded-sm">
        <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-2">Where to Watch</p>
        <p className="text-[#4b5563] text-sm">Not available on streaming yet</p>
      </div>
    )
  }

  return (
    <div className="bg-[#141414] border border-[#1e1e1e] p-5 rounded-sm">
      <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-4">Where to Watch</p>

      {providers!.flatrate.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Tv className="w-3.5 h-3.5 text-[#22c55e]" />
            <span className="text-[#22c55e] text-xs font-semibold uppercase tracking-wider">Stream</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {providers!.flatrate.map(p => (
              <ProviderBadge key={p.name} provider={p} />
            ))}
          </div>
        </div>
      )}

      {providers!.rent.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <PlayCircle className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span className="text-[#c9a84c] text-xs font-semibold uppercase tracking-wider">Rent</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {providers!.rent.map(p => (
              <ProviderBadge key={p.name} provider={p} />
            ))}
          </div>
        </div>
      )}

      {providers!.buy.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ShoppingCart className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider">Buy</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {providers!.buy.map(p => (
              <ProviderBadge key={p.name} provider={p} />
            ))}
          </div>
        </div>
      )}

      <p className="text-[#374151] text-[10px] mt-4">Data provided by JustWatch</p>
    </div>
  )
}

function ProviderBadge({ provider }: { provider: { name: string; logo: string } }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div className="relative w-10 h-10 rounded-sm overflow-hidden border border-[#1e1e1e]" title={provider.name}>
      {!imgError ? (
        <Image
          src={provider.logo}
          alt={provider.name}
          fill
          className="object-cover"
          sizes="40px"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center">
          <span className="text-[#6b7280] text-[8px] text-center leading-tight px-0.5">{provider.name.slice(0, 4)}</span>
        </div>
      )}
    </div>
  )
}
