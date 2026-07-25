import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = `
    ALTER TABLE public.receitas DROP CONSTRAINT IF EXISTS fk_receitas_categoria;
    ALTER TABLE public.receitas ADD CONSTRAINT fk_receitas_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;

    ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS fk_despesas_categoria;
    ALTER TABLE public.despesas ADD CONSTRAINT fk_despesas_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;

    ALTER TABLE public.recorrencias DROP CONSTRAINT IF EXISTS fk_recorrencias_categoria;
    ALTER TABLE public.recorrencias ADD CONSTRAINT fk_recorrencias_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;

    ALTER TABLE public.orcamentos DROP CONSTRAINT IF EXISTS fk_orcamentos_categoria;
    ALTER TABLE public.orcamentos ADD CONSTRAINT fk_orcamentos_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE CASCADE;
  `;

  // The supabase client doesn't have a direct sql() method on the JS client unless via RPC.
  // Wait, I can use the mcp server for supabase to run SQL!
  console.log("SQL to run:", sql);
}

run();
