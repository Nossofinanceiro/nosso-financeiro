const { execSync } = require('child_process');

const url = "https://pwqhlpitljrxehhoxyxi.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cWhscGl0bGpyeGVoaG94eXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTMwODAsImV4cCI6MjEwMDQyOTA4MH0.rG1M0u4M_YIFFswgTPvNLVadyXy0XpCDTdkoPzVCPhk";

try {
  console.log("Adding URL...");
  execSync(`npx vercel env add NEXT_PUBLIC_SUPABASE_URL production`, {
    input: url,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  
  console.log("Adding KEY...");
  execSync(`npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production`, {
    input: key,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log("Done!");
} catch (e) {
  console.error("Error:", e.message);
}
