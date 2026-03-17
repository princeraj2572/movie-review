import { supabase } from './supabase';

export interface CuratedCollection {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  icon_emoji: string;
  banner_url: string | null;
  category: 'awards' | 'genre' | 'mood' | 'director' | 'actor' | 'trending' | 'trending_reviews';
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CuratedCollectionItem {
  id: string;
  collection_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  movie_rating: number | null;
  rank_order: number | null;
}

// Get all curated collections
export async function getCuratedCollections(): Promise<CuratedCollection[]> {
  const { data, error } = await supabase
    .from('curated_collections')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching curated collections:', error);
    return [];
  }

  return data || [];
}

// Get featured curated collections
export async function getFeaturedCollections(): Promise<CuratedCollection[]> {
  const { data, error } = await supabase
    .from('curated_collections')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(6);

  if (error) {
    console.error('Error fetching featured collections:', error);
    return [];
  }

  return data || [];
}

// Get curated collection by slug
export async function getCuratedCollectionBySlug(slug: string): Promise<CuratedCollection | null> {
  const { data, error } = await supabase
    .from('curated_collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching curated collection:', error);
    return null;
  }

  return data;
}

// Get items in a curated collection
export async function getCuratedCollectionItems(
  collectionId: string
): Promise<CuratedCollectionItem[]> {
  const { data, error } = await supabase
    .from('curated_collection_items')
    .select('*')
    .eq('collection_id', collectionId)
    .order('rank_order', { ascending: true });

  if (error) {
    console.error('Error fetching collection items:', error);
    return [];
  }

  return data || [];
}

// Get curated collections by category
export async function getCuratedCollectionsByCategory(
  category: string
): Promise<CuratedCollection[]> {
  const { data, error } = await supabase
    .from('curated_collections')
    .select('*')
    .eq('category', category)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching collections by category:', error);
    return [];
  }

  return data || [];
}

// Seed curated collections (for initial setup)
export async function seedCuratedCollections() {
  const collections = [
    {
      title: 'Oscars 2024 Best Picture Nominees',
      slug: 'oscars-2024-best-picture',
      category: 'awards',
      icon_emoji: '🏆',
      is_featured: true,
      display_order: 1,
    },
    {
      title: 'Underrated Masterpieces',
      slug: 'underrated-gems',
      category: 'trending',
      icon_emoji: '💎',
      is_featured: true,
      display_order: 2,
    },
    {
      title: 'Christopher Nolan Directors Cut',
      slug: 'nolan-collection',
      category: 'director',
      icon_emoji: '🎥',
      is_featured: true,
      display_order: 3,
    },
    {
      title: 'Mind-Bending Thrillers',
      slug: 'mind-bending-thrillers',
      category: 'mood',
      icon_emoji: '🧠',
      is_featured: true,
      display_order: 4,
    },
    {
      title: 'Feel-Good Comedies',
      slug: 'feel-good-comedies',
      category: 'mood',
      icon_emoji: '😄',
      is_featured: true,
      display_order: 5,
    },
    {
      title: 'Trending This Week',
      slug: 'trending-this-week',
      category: 'trending',
      icon_emoji: '📈',
      is_featured: true,
      display_order: 6,
    },
  ];

  const { error } = await supabase
    .from('curated_collections')
    .insert(collections)
    .on('*', () => {});

  if (error && error.code !== '23505') {
    // 23505 is unique constraint violation, which is fine
    console.error('Error seeding curated collections:', error);
  }
}
