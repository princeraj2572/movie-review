"use client"

import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Suspense } from "react"
import SearchResults from "@/components/SearchResults"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-[#6b7280] hover:text-[#c9a84c] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-[#e8e8e8]">Search Results</h1>
          </div>
        </div>

        <Suspense fallback={<div className="text-center py-12"><p className="text-[#c9a84c]">Loading...</p></div>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  )
}
