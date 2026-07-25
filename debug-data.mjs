import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

function test() {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
  const key = envContent.match(/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

  if (!url || !key) {
    console.error("Missing env");
    return;
  }

  const supabase = createClient(url, key);

  async function run() {
    const { data: familias } = await supabase.from("familias").select("*");
    if (!familias || familias.length === 0) return;
    const familiaId = familias[0].id;

    const { data: contas } = await supabase.from("contas").select("*").eq("familia_id", familiaId);
    console.log("CONTAS:", JSON.stringify(contas, null, 2));

    const { data: receitas } = await supabase.from("receitas").select("*").eq("familia_id", familiaId);
    console.log("RECEITAS:", JSON.stringify(receitas, null, 2));

    const { data: despesas } = await supabase.from("despesas").select("*").eq("familia_id", familiaId);
    console.log("DESPESAS:", JSON.stringify(despesas, null, 2));
    
    const { data: movs } = await supabase.from("movimentacoes").select("*").eq("familia_id", familiaId);
    console.log("MOVIMENTACOES:", JSON.stringify(movs, null, 2));
  }
  run();
}
test();
