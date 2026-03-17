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
      case 'create':
        return await handleCreateCollection(data);
      case 'delete':
        return await handleDeleteCollection(data);
      case 'update':
        return await handleUpdateCollection(data);
      case 'addItem':
        return await handleAddItem(data);
      case 'removeItem':
        return await handleRemoveItem(data);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Collection API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCreateCollection(data: any) {
  const { user_id, name, description, is_public } = data;
  const { data: collection, error } = await supabase
    .from('watchlist_collections')
    .insert([{ user_id, name, description, is_public }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(collection);
}

async function handleDeleteCollection(data: any) {
  const { collection_id } = data;
  const { error } = await supabase.from('watchlist_collections').delete().eq('id', collection_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

async function handleUpdateCollection(data: any) {
  const { collection_id, name, description, is_public } = data;
  const { data: collection, error } = await supabase
    .from('watchlist_collections')
    .update({ name, description, is_public, updated_at: new Date().toISOString() })
    .eq('id', collection_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(collection);
}

async function handleAddItem(data: any) {
  const { collection_id, movie_id, movie_title, movie_poster } = data;
  const { data: item, error } = await supabase
    .from('collection_items')
    .insert([{ collection_id, movie_id, movie_title, movie_poster }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(item);
}

async function handleRemoveItem(data: any) {
  const { item_id } = data;
  const { error } = await supabase.from('collection_items').delete().eq('id', item_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
