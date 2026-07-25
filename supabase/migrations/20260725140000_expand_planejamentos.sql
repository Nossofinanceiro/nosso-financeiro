-- Expansão da tabela planejamentos
ALTER TABLE planejamentos
ADD COLUMN IF NOT EXISTS valor_entrada NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margem_seguranca NUMERIC(5, 2) DEFAULT 0.10,
ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES contas(id) ON DELETE SET NULL;

-- Expansão da tabela planejamento_itens
ALTER TABLE planejamento_itens
ADD COLUMN IF NOT EXISTS data_inicial DATE,
ADD COLUMN IF NOT EXISTS data_final DATE,
ADD COLUMN IF NOT EXISTS recorrencia TEXT CHECK (recorrencia IN ('unica', 'mensal', 'anual')) DEFAULT 'unica',
ADD COLUMN IF NOT EXISTS referencia_id UUID;

-- Atualizar o tipo CHECK para suportar mais opções de variáveis
-- O PostgreSQL exige remover a restrição antiga e adicionar a nova
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Localiza o nome da restrição CHECK existente para a coluna 'tipo'
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'planejamento_itens'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%tipo%';

    -- Se encontrou, remove a restrição
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE planejamento_itens DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Adiciona a nova restrição
ALTER TABLE planejamento_itens
ADD CONSTRAINT planejamento_itens_tipo_check 
CHECK (tipo IN (
    'nova_receita_mensal',
    'receita_unica',
    'reducao_despesa',
    'nova_despesa_mensal',
    'despesa_unica',
    'entrada_inicial',
    'parcelamento',
    'alteracao_receita',
    'alteracao_despesa',
    'entrada', -- para compatibilidade com o modelo anterior
    'saida'    -- para compatibilidade com o modelo anterior
));

-- Atualizar o PostgREST schema cache
NOTIFY pgrst, 'reload schema';
