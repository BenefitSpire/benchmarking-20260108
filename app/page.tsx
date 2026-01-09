import { createClient } from '@supabase/supabase-js';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ein?: string }>;
}) {
  // 1. Initialize variables from the Vercel Environment
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // 2. Create the Client directly in the component
  const supabase = createClient(url, key);
  
  // 3. Resolve the URL parameters
  const { ein } = await searchParams;
  const queryEin = ein?.trim();

  let result = null;
  let status = "Waiting for input...";

  if (queryEin) {
    // 4. Perform the query - we removed .maybeSingle() and added .limit(1)
    const { data, error } = await supabase
      .from('filings')
      .select('*')
      .eq('spons_dfe_ein', queryEin)
      .order('filing_date', { ascending: false }) // Get the most recent one first
      .limit(1) // Just give me the top result
      .single(); // Now this will work because we limited it to 1

    if (error) {
      status = `Error: ${error.message}`;
      console.log("DB Error Details:", error);
    } else if (data) {
      result = data;
      status = "Success: Record Found.";
    } else {
      status = "Connected, but EIN not found in database.";
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#000', backgroundColor: '#fff', minHeight: '100vh' }}>
      <h1>Benchmarking Tool 2026 01 08 (Clean Room)</h1>
      
      <form method="GET" style={{ marginBottom: '20px' }}>
        <input 
          name="ein" 
          placeholder="Enter EIN..." 
          defaultValue={queryEin}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f5f5f5', border: '1px solid #eaeaea' }}>
        <p><strong>System Status:</strong> {status}</p>
        {result && (
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
