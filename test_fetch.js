const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
});

async function test() {
  const url = `${supabaseUrl}/rest/v1/planejamentos?select=*,itens:planejamento_itens(*)`;
  console.log("Fetching", url);
  const res = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

test();
