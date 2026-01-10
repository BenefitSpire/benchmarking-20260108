'use server'

import { createClient } from '@/utils/supabase/server';

export async function searchSponsors(query: string) {
  // Defensive check for minimum characters
  if (!query || query.trim().length < 3) return [];

  const supabase = await createClient();
  const cleanQuery = query.trim();

  const { data, error } = await supabase
    .from('f_5500_data')
    .select('sponsor_dfe_name, spons_dfe_ein')
    // ilike is PostgreSQL's case-insensitive pattern matching
    .ilike('sponsor_dfe_name', `%${cleanQuery}%`) 
    .limit(10);

  if (error) {
    console.error('Database Search Error:', error);
    return [];
  }

  // Log to terminal to confirm data is actually being found
  console.log(`Search for "${cleanQuery}" returned ${data?.length || 0} results.`);

  return data;
}