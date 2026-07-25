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
    // get families
    const { data: familias } = await supabase.from("familias").select("*");
    console.log("Familias:", familias);

    if (!familias || familias.length === 0) return;
    const familiaId = familias[0].id;

    // Attempt to create and delete a dummy account
    const { data: newConta, error: insertError } = await supabase.from("contas").insert({
      familia_id: familiaId,
      nome: "Dummy Test Delete",
      tipo: "corrente",
      saldo_inicial: 0
    }).select().single();

    if (insertError) {
      console.error("Error creating dummy account:", insertError);
      return;
    }

    console.log("Created dummy account:", newConta.id);

    const { error: deleteError } = await supabase.from("contas").delete().eq("id", newConta.id);
    
    if (deleteError) {
      console.error("Error deleting dummy account:", deleteError);
    } else {
      console.log("Successfully deleted dummy account!");
    }
  }

  run();
}
test();
