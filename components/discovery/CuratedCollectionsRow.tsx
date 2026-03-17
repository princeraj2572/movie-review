'use client';

import { useEffect, useState } from 'react';
import { getCuratedCollections } from '@/lib/curated';
import Link from 'next/link';

interface CuratedCollectionsRowProps {
  featured?: boolean;
  limit?: number;
}

export default function CuratedCollectionsRow({
  featured = true,
  limit = 6,
}: CuratedCollectionsRowProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    let curatedCollections = await getCuratedCollections();

    if (featured) {
      curatedCollections = curatedCollections.filter((c) => c.is_featured).slice(0, limit);
    } else {
      curatedCollections = curatedCollections.slice(0, limit);
    }

    setCollections(curatedCollections);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="h-8 bg-zinc-800 rounded w-40 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-amber-400 mb-4">Curated Collections</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-amber-600 to-amber-900 hover:from-amber-500 hover:to-amber-800 transition transform hover:scale-105"
          >
            {collection.banner_url ? (
              <img
                src={collection.banner_url}
                alt={collection.title}
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
            )}

            <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div className="text-3xl mb-2">{collection.icon_emoji}</div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2">
                {collection.title}
              </h3>
              <p className="text-xs text-zinc-300 mt-1">{collection.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
