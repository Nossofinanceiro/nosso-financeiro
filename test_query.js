const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing Supabase Query...");
  const { data, error } = await supabase
    .from("planejamentos")
    .select(`
      *,
      itens:planejamento_itens(*)
    `);
  console.log("Error:", JSON.stringify(error, null, 2));
  console.log("Data:", data);
}

test();
