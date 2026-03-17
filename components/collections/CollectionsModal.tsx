'use client';

import { useEffect, useState } from 'react';
import { getUserCollections, createCollection, deleteCollection, addToCollection, removeFromCollection, getCollectionItems } from '@/lib/collections';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

interface CollectionsModalProps {
  movieId?: number;
  movieTitle?: string;
  moviePoster?: string;
  onClose?: () => void;
}

export default function CollectionsModal({
  movieId,
  movieTitle,
  moviePoster,
  onClose,
}: CollectionsModalProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    const userCollections = await getUserCollections();
    setCollections(userCollections);

    // Check which collections contain this movie
    if (movieId) {
      const selected = new Set<string>();
      for (const collection of userCollections) {
        const items = await getCollectionItems(collection.id);
        if (items.some((item) => item.movie_id === movieId)) {
          selected.add(collection.id);
        }
      }
      setSelectedCollections(selected);
    }
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    await createCollection(newCollectionName);
    setNewCollectionName('');
    await loadCollections();
  };

  const handleDeleteCollection = async (collectionId: string) => {
    await deleteCollection(collectionId);
    await loadCollections();
  };

  const handleToggleCollection = async (collectionId: string) => {
    if (!movieId || !movieTitle) return;

    const newSelected = new Set(selectedCollections);

    if (newSelected.has(collectionId)) {
      // Remove from collection
      const collection = collections.find((c) => c.id === collectionId);
      if (collection) {
        const items = await getCollectionItems(collectionId);
        const item = items.find((i) => i.movie_id === movieId);
        if (item) {
          await removeFromCollection(item.id);
        }
      }
      newSelected.delete(collectionId);
    } else {
      // Add to collection
      await addToCollection(collectionId, movieId, movieTitle, moviePoster);
      newSelected.add(collectionId);
    }

    setSelectedCollections(newSelected);
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-black p-6 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
      <h2 className="text-xl font-bold text-amber-400 mb-4">My Collections</h2>

      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : (
        <>
          {/* Create New Collection */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New collection name..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCollection()}
              />
              <Button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-black"
              >
                + Add
              </Button>
            </div>
          </div>

          {/* Collections List */}
          <div className="space-y-2">
            {collections.length === 0 ? (
              <p className="text-zinc-500 text-sm">Create your first collection!</p>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded border border-zinc-700 hover:border-amber-600 transition"
                >
                  <label className="flex items-center flex-1 cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCollections.has(collection.id)}
                      onChange={() => handleToggleCollection(collection.id)}
                      disabled={!movieId}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-white truncate">{collection.name}</span>
                    {collection.is_public && (
                      <Badge className="bg-amber-600 text-black text-xs">Public</Badge>
                    )}
                  </label>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="text-red-400 hover:text-red-500 text-xs font-semibold ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-medium transition"
        >
          Done
        </button>
      )}
    </div>
  );
}
