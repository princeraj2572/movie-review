import { Film } from "lucide-react"

export default function Footer() {
  const links = {
    Discover: ["New Releases", "Top Rated", "Award Winners", "Coming Soon"],
    Genres: ["Drama", "Thriller", "Sci-Fi", "Comedy", "Horror"],
    Company: ["About", "Press", "Careers", "Contact"],
    Legal: ["Privacy Policy", "Terms of Use", "Cookie Settings"],
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1e1e1e] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center">
                <Film className="w-4 h-4 text-black" />
              </div>
              <span className="font-accent text-xl text-[#e8e8e8] tracking-widest">CINESCOPE</span>
            </div>
            <p className="text-[#6b7280] text-xs leading-relaxed">
              The definitive guide to cinema. Powered by IMDB data for authentic film reviews and ratings.
            </p>
            <div className="flex gap-3 mt-4">
              {["𝕏", "IG", "FB", "YT"].map(s => (
                <button key={s} className="w-8 h-8 border border-[#1e1e1e] text-[#6b7280] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-all text-xs font-semibold">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}>
                    <button className="text-[#6b7280] hover:text-[#e8e8e8] text-sm transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1e1e1e] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#4b5563] text-xs">
            © 2025 CineScope. Movie data sourced from IMDB & TMDB.
          </p>
          <p className="text-[#4b5563] text-xs">
            Built with Next.js · shadcn/ui · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
