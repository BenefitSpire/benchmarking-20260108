import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Get the absolute path to this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Define the exact path to the .env file (one level up)
const envPath = path.join(__dirname, '..', '.env');

console.log('--- Debugging Path ---');
console.log('Script is located in:', __dirname);
console.log('Looking for .env at:', envPath);

// 3. Check if the file physically exists before trying to read it
if (fs.existsSync(envPath)) {
  console.log('✅ Success: The .env file was physically found at that location.');
  dotenv.config({ path: envPath });
} else {
  console.log('❌ Error: The file does not exist at that path.');
  console.log('Contents of the parent directory are:', fs.readdirSync(path.join(__dirname, '..')));
}

console.log('\n--- Environment Variables ---');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing');
console.log('GOOGLE_SHEET_URL:', process.env.GOOGLE_SHEET_URL ? '✅ Found' : '❌ Missing');