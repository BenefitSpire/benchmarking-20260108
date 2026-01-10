import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import csv from 'csvtojson';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 1. Ensure we find the .env file exactly where the tester found it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function importData() {
  console.log('--- Starting Final Data Import ---');
  try {
    // 2. Download from Google
    console.log('Step 1: Downloading from Google Sheets...');
    const response = await axios.get(process.env.GOOGLE_SHEET_URL.trim(), {
      headers: { 'User-Agent': 'Mozilla/5.0' } // Mimics browser to avoid 404/403
    });
    
    const jsonArray = await csv().fromString(response.data);
    console.log(`✅ Successfully downloaded and parsed ${jsonArray.length} rows.`);

    // --- NEW CLEANING LOGIC ---
    // This looks at every cell. If it's a blank string, it makes it NULL
    const cleanedData = jsonArray.map(row => {
      const newRow = { ...row };
      for (const key in newRow) {
        if (newRow[key] === "") {
          newRow[key] = null;
        }
      }
      return newRow;
    });    

    console.log(`✅ Successfully cleaned and parsed ${cleanedData.length} rows.`);

    // 3. Upload in Batches (Prevents Timeouts)
    const chunkSize = 100; 
    console.log(`Step 2: Uploading to Supabase in batches of ${chunkSize}...`);

    for (let i = 0; i < cleanedData.length; i += chunkSize) {
      const chunk = cleanedData.slice(i, i + chunkSize);
      const { error } = await supabase.from('f_5500_data').insert(chunk);

      if (error) {
        console.error(`❌ Error in batch ${i / chunkSize + 1}:`, error.message);
        return; 
      }
      console.log(`   Progress: ${i + chunk.length} / ${jsonArray.length} rows uploaded...`);
    }

    console.log('\n✨ MISSION SUCCESS! Your benchmarking data is now live in Supabase.');
  } catch (err) {
    console.error('❌ Script Error:', err.message);
  }
}

importData();