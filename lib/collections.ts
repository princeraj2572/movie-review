import { supabase } from './supabase';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  added_at: string;
}

// Create a new collection
export async function createCollection(
  name: string,
  description?: string,
  is_public: boolean = false
): Promise<Collection | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('watchlist_collections')
    .insert([
      {
        user_id: user.id,
        name,
        description: description || null,
        is_public,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    return null;
  }

  return data;
}

// Get all collections for current user
export async function getUserCollections(): Promise<Collection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('watchlist_collections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching collections:', error);
    return [];
  }

  return data || [];
}

// Get a specific collection
export async function getCollection(collectionId: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('watchlist_collections')
    .select('*')
    .eq('id', collectionId)
    .single();

  if (error) {
    console.error('Error fetching collection:', error);
    return null;
  }

  return data;
}

// Get all items in a collection
export async function getCollectionItems(collectionId: string): Promise<CollectionItem[]> {
  const { data, error } = await supabase
    .from('collection_items')
    .select('*')
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching collection items:', error);
    return [];
  }

  return data || [];
}

// Add a movie to a collection
export async function addToCollection(
  collectionId: string,
  movieId: number,
  movieTitle: string,
  moviePoster?: string
): Promise<CollectionItem | null> {
  const { data, error } = await supabase
    .from('collection_items')
    .insert([
      {
        collection_id: collectionId,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_poster: moviePoster || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding to collection:', error);
    return null;
  }

  return data;
}

// Remove a movie from a collection
export async function removeFromCollection(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error removing from collection:', error);
    return false;
  }

  return true;
}

// Update a collection
export async function updateCollection(
  collectionId: string,
  name: string,
  description?: string,
  is_public?: boolean
): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('watchlist_collections')
    .update({
      name,
      description: description || null,
      is_public: is_public !== undefined ? is_public : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', collectionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    return null;
  }

  return data;
}

// Delete a collection
export async function deleteCollection(collectionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('watchlist_collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    console.error('Error deleting collection:', error);
    return false;
  }

  return true;
}

// Get public collections from a specific user
export async function getUserPublicCollections(userId: string): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('watchlist_collections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user public collections:', error);
    return [];
  }

  return data || [];
}
