import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'getAllCollections':
        return await handleGetAllCollections();
      case 'getFeaturedCollections':
        return await handleGetFeaturedCollections();
      case 'getBySlug':
        return await handleGetBySlug(data);
      case 'getItems':
        return await handleGetItems(data);
      case 'getByCategory':
        return await handleGetByCategory(data);
      case 'seed':
        return await handleSeed();
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Curated collections API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGetAllCollections() {
  const { data, error } = await supabase
    .from('curated_collections')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}

async function handleGetFeaturedCollections() {
  const { data, error } = await supabase
    .from('curated_collections')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(6);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}

async function handleGetBySlug(data: any) {
  const { slug } = data;

  const { data: collection, error } = await supabase
    .from('curated_collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(collection);
}

async function handleGetItems(data: any) {
  const { collection_id } = data;

  const { data: items, error } = await supabase
    .from('curated_collection_items')
    .select('*')
    .eq('collection_id', collection_id)
    .order('rank_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(items || []);
}

async function handleGetByCategory(data: any) {
  const { category } = data;

  const { data: collections, error } = await supabase
    .from('curated_collections')
    .select('*')
    .eq('category', category)
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(collections || []);
}

async function handleSeed() {
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
      title: 'Christopher Nolan Collections',
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, count: collections.length });
}
