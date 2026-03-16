import Image from "next/image"
import { User } from "lucide-react"
import { posterUrl } from "@/lib/tmdb"

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface CastGridProps {
  cast: CastMember[]
}

export default function CastGrid({ cast }: CastGridProps) {
  const displayCast = cast.slice(0, 12)

  return (
    <div>
      <h3 className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-4">Top Cast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayCast.map(member => (
          <div key={member.id} className="group text-center">
            <div className="relative w-full aspect-[2/3] bg-[#1e1e1e] overflow-hidden mb-2 rounded-sm">
              {member.profile_path ? (
                <Image
                  src={posterUrl(member.profile_path, 'w185')}
                  alt={member.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  sizes="150px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-[#374151]" />
                </div>
              )}
            </div>
            <p className="text-[#e8e8e8] text-xs font-semibold leading-tight line-clamp-1">{member.name}</p>
            <p className="text-[#6b7280] text-[10px] leading-tight line-clamp-1 mt-0.5">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
