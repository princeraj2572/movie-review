'use client';

import { useState, useEffect } from 'react';
import { fetchMovieById } from '@/lib/tmdb';
import Badge from '@/components/ui/button';

interface MovieComparisonProps {
  movieId1?: number;
  movieId2?: number;
  onClose?: () => void;
}

export default function MovieComparison({
  movieId1,
  movieId2,
  onClose,
}: MovieComparisonProps) {
  const [movie1, setMovie1] = useState<any>(null);
  const [movie2, setMovie2] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, [movieId1, movieId2]);

  const loadMovies = async () => {
    if (!movieId1 || !movieId2) return;

    setLoading(true);
    const [m1, m2] = await Promise.all([
      fetchMovieById(movieId1),
      fetchMovieById(movieId2),
    ]);

    setMovie1(m1);
    setMovie2(m2);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-white">Loading movies...</div>;
  }

  if (!movie1 || !movie2) {
    return <div className="text-center py-8 text-white">Movies not found</div>;
  }

  const ComparisonRow = ({ label, value1, value2 }: any) => (
    <div className="flex border-b border-zinc-700 last:border-b-0">
      <div className="flex-1 px-4 py-3 text-sm font-semibold text-zinc-400 bg-zinc-900/50">
        {label}
      </div>
      <div className="flex-1 px-4 py-3 text-sm text-white text-center border-r border-zinc-700">
        {value1}
      </div>
      <div className="flex-1 px-4 py-3 text-sm text-white text-center">{value2}</div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl bg-gradient-to-b from-zinc-900 to-black rounded-lg border border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-700">
        <h2 className="text-xl font-bold text-amber-400">Movie Comparison</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Movie Posters/Titles */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-zinc-700 bg-zinc-900/50">
        <div className="text-center">
          {movie1.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w200${movie1.poster_path}`}
              alt={movie1.title}
              className="w-32 h-auto mx-auto rounded mb-2"
            />
          )}
          <h3 className="font-bold text-white text-sm">{movie1.title}</h3>
          <p className="text-xs text-zinc-400">{new Date(movie1.release_date).getFullYear()}</p>
        </div>
        <div className="text-center">
          {movie2.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w200${movie2.poster_path}`}
              alt={movie2.title}
              className="w-32 h-auto mx-auto rounded mb-2"
            />
          )}
          <h3 className="font-bold text-white text-sm">{movie2.title}</h3>
          <p className="text-xs text-zinc-400">{new Date(movie2.release_date).getFullYear()}</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex border-b border-zinc-700 font-semibold bg-zinc-900/50">
            <div className="flex-1 px-4 py-3 text-sm text-zinc-400">Aspect</div>
            <div className="flex-1 px-4 py-3 text-sm text-amber-400 text-center border-r border-zinc-700">
              Movie 1
            </div>
            <div className="flex-1 px-4 py-3 text-sm text-amber-400 text-center">Movie 2</div>
          </div>

          <ComparisonRow
            label="Rating"
            value1={`⭐ ${movie1.vote_average?.toFixed(1)}`}
            value2={`⭐ ${movie2.vote_average?.toFixed(1)}`}
          />
          <ComparisonRow
            label="Vote Count"
            value1={`${movie1.vote_count?.toLocaleString()}`}
            value2={`${movie2.vote_count?.toLocaleString()}`}
          />
          <ComparisonRow
            label="Runtime"
            value1={`${movie1.runtime} min`}
            value2={`${movie2.runtime} min`}
          />
          <ComparisonRow
            label="Budget"
            value1={
              movie1.budget > 0
                ? `$${(movie1.budget / 1000000).toFixed(1)}M`
                : 'N/A'
            }
            value2={
              movie2.budget > 0
                ? `$${(movie2.budget / 1000000).toFixed(1)}M`
                : 'N/A'
            }
          />
          <ComparisonRow
            label="Revenue"
            value1={
              movie1.revenue > 0
                ? `$${(movie1.revenue / 1000000).toFixed(1)}M`
                : 'N/A'
            }
            value2={
              movie2.revenue > 0
                ? `$${(movie2.revenue / 1000000).toFixed(1)}M`
                : 'N/A'
            }
          />
          <ComparisonRow
            label="Popularity"
            value1={`${movie1.popularity?.toFixed(1)}`}
            value2={`${movie2.popularity?.toFixed(1)}`}
          />

          {/* Genres */}
          <div className="flex border-b border-zinc-700">
            <div className="flex-1 px-4 py-3 text-sm font-semibold text-zinc-400 bg-zinc-900/50">
              Genres
            </div>
            <div className="flex-1 px-4 py-3 text-sm text-white text-center border-r border-zinc-700">
              <div className="flex flex-wrap gap-1 justify-center">
                {movie1.genres?.map((g: any) => (
                  <span key={g.id} className="px-2 py-1 bg-zinc-800 rounded text-xs">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 px-4 py-3 text-sm text-white text-center">
              <div className="flex flex-wrap gap-1 justify-center">
                {movie2.genres?.map((g: any) => (
                  <span key={g.id} className="px-2 py-1 bg-zinc-800 rounded text-xs">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="p-4 border-t border-zinc-700">
        <h4 className="text-sm font-bold text-amber-400 mb-3">Overview</h4>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-xs text-zinc-300 line-clamp-3">{movie1.overview}</p>
          <p className="text-xs text-zinc-300 line-clamp-3">{movie2.overview}</p>
        </div>
      </div>
    </div>
  );
}
