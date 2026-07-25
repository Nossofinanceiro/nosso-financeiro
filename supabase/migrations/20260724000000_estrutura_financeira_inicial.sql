-- Migration V2.1 Refinada & Auditada por Arquitetura PostgreSQL
-- Arquivo: supabase/migrations/20260724000000_estrutura_financeira_inicial.sql
-- Idioma: Português (snake_case, sem acentos)

BEGIN;

-- ============================================================================
-- 1. LIMPEZA SEGURA DE TABELAS ANTIGAS EM INGLÊS (SE VAZIAS)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incomes') THEN
    IF (SELECT count(*) FROM public.incomes) = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.incomes CASCADE;';
    ELSE
      RAISE EXCEPTION 'A tabela antiga incomes contem dados e nao pode ser removida automaticamente.';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
    IF (SELECT count(*) FROM public.expenses) = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.expenses CASCADE;';
    ELSE
      RAISE EXCEPTION 'A tabela antiga expenses contem dados e nao pode ser removida automaticamente.';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'account_balances') THEN
    IF (SELECT count(*) FROM public.account_balances) = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.account_balances CASCADE;';
    ELSE
      RAISE EXCEPTION 'A tabela antiga account_balances contem dados e nao pode ser removida automaticamente.';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'household_members') THEN
    IF (SELECT count(*) FROM public.household_members) = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.household_members CASCADE;';
    ELSE
      RAISE EXCEPTION 'A tabela antiga household_members contem dados e nao pode ser removida automaticamente.';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'households') THEN
    IF (SELECT count(*) FROM public.households) = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.households CASCADE;';
    ELSE
      RAISE EXCEPTION 'A tabela antiga households contem dados e nao pode ser removida automaticamente.';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. FUNÇÕES GENÉRICAS E HELPERS DE SEGURANÇA
-- ============================================================================

-- Trigger genérico para atualizado_em
CREATE OR REPLACE FUNCTION public.atualizar_timestamp_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;


-- ============================================================================
-- 3. ESTRUTURA DE TABELAS V2.1 COM CHAVES COMPOSTAS MULTI-TENANT
-- ============================================================================

-- 3.1 familias
CREATE TABLE IF NOT EXISTS public.familias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL CHECK (char_length(trim(nome)) > 0),
  moeda text NOT NULL DEFAULT 'USD',
  fuso_horario text NOT NULL DEFAULT 'America/Denver',
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- 3.2 membros_familia
CREATE TABLE IF NOT EXISTS public.membros_familia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_exibicao text NOT NULL CHECK (char_length(trim(nome_exibicao)) > 0),
  papel text NOT NULL DEFAULT 'membro' CHECK (papel IN ('proprietario', 'membro')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_familia_usuario UNIQUE (familia_id, usuario_id)
);

-- Função de checagem de pertencimento RLS (evita recursão)
CREATE OR REPLACE FUNCTION public.usuario_pertence_familia(familia_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.membros_familia 
    WHERE familia_id = familia_uuid 
      AND usuario_id = auth.uid()
  );
$$;


-- 3.3 contas (Com UNIQUE para FK Composta Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(trim(nome)) > 0),
  tipo text NOT NULL CHECK (tipo IN ('corrente', 'poupanca', 'dinheiro', 'outra')),
  instituicao text NULL,
  saldo_inicial numeric(14,2) NOT NULL DEFAULT 0,
  ativa boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_contas_id_familia UNIQUE (id, familia_id)
);

-- 3.4 cartoes_credito (Com UNIQUE para FK Composta Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.cartoes_credito (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(trim(nome)) > 0),
  instituicao text NULL,
  limite_credito numeric(14,2) NULL CHECK (limite_credito IS NULL OR limite_credito >= 0),
  dia_fechamento integer NULL CHECK (dia_fechamento IS NULL OR (dia_fechamento BETWEEN 1 AND 31)),
  dia_vencimento integer NULL CHECK (dia_vencimento IS NULL OR (dia_vencimento BETWEEN 1 AND 31)),
  conta_pagamento_id uuid NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_cartoes_credito_id_familia UNIQUE (id, familia_id),
  CONSTRAINT fk_cartoes_credito_conta_pagamento
    FOREIGN KEY (conta_pagamento_id, familia_id)
    REFERENCES public.contas(id, familia_id)
    ON DELETE SET NULL
);

-- 3.5 categorias (Com UNIQUE para FK Composta Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(trim(nome)) > 0),
  tipo text NOT NULL CHECK (tipo IN ('receita', 'despesa', 'ambos')),
  icone text NULL,
  cor text NULL,
  categoria_sistema boolean NOT NULL DEFAULT false,
  ativa boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_categorias_id_familia UNIQUE (id, familia_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_categorias_familia_nome_tipo
  ON public.categorias (COALESCE(familia_id, '00000000-0000-0000-0000-000000000000'::uuid), nome, tipo);

-- 3.6 receitas
CREATE TABLE IF NOT EXISTS public.receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  categoria_id uuid NULL,
  conta_id uuid NULL,
  pessoa text NOT NULL CHECK (char_length(trim(pessoa)) > 0),
  descricao text NOT NULL CHECK (char_length(trim(descricao)) > 0),
  dia_pagamento integer NULL CHECK (dia_pagamento IS NULL OR (dia_pagamento BETWEEN 1 AND 31)),
  valor_previsto numeric(14,2) NULL CHECK (valor_previsto IS NULL OR valor_previsto >= 0),
  valor_recebido numeric(14,2) NULL CHECK (valor_recebido IS NULL OR valor_recebido >= 0),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebida', 'cancelada')),
  data_prevista date NULL,
  data_recebimento date NULL,
  mes_referencia date NOT NULL CHECK (date_trunc('month', mes_referencia) = mes_referencia),
  recorrente boolean NOT NULL DEFAULT true,
  observacoes text NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_receitas_categoria FOREIGN KEY (categoria_id, familia_id) REFERENCES public.categorias(id, familia_id) ON DELETE SET NULL,
  CONSTRAINT fk_receitas_conta FOREIGN KEY (conta_id, familia_id) REFERENCES public.contas(id, familia_id) ON DELETE SET NULL
);

-- 3.7 despesas
CREATE TABLE IF NOT EXISTS public.despesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  categoria_id uuid NULL,
  conta_id uuid NULL,
  cartao_credito_id uuid NULL,
  descricao text NOT NULL CHECK (char_length(trim(descricao)) > 0),
  valor_previsto numeric(14,2) NOT NULL DEFAULT 0 CHECK (valor_previsto >= 0),
  valor_pago numeric(14,2) NULL CHECK (valor_pago IS NULL OR valor_pago >= 0),
  dia_vencimento integer NULL CHECK (dia_vencimento IS NULL OR (dia_vencimento BETWEEN 1 AND 31)),
  data_vencimento date NULL,
  data_pagamento date NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'atrasada', 'cancelada')),
  forma_pagamento text NULL,
  mes_referencia date NOT NULL CHECK (date_trunc('month', mes_referencia) = mes_referencia),
  recorrente boolean NOT NULL DEFAULT false,
  observacoes text NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_despesas_categoria FOREIGN KEY (categoria_id, familia_id) REFERENCES public.categorias(id, familia_id) ON DELETE SET NULL,
  CONSTRAINT fk_despesas_conta FOREIGN KEY (conta_id, familia_id) REFERENCES public.contas(id, familia_id) ON DELETE SET NULL,
  CONSTRAINT fk_despesas_cartao FOREIGN KEY (cartao_credito_id, familia_id) REFERENCES public.cartoes_credito(id, familia_id) ON DELETE SET NULL
);

-- 3.8 recorrencias
CREATE TABLE IF NOT EXISTS public.recorrencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao text NOT NULL CHECK (char_length(trim(descricao)) > 0),
  categoria_id uuid NULL,
  conta_id uuid NULL,
  cartao_credito_id uuid NULL,
  pessoa text NULL,
  valor_padrao numeric(14,2) NULL CHECK (valor_padrao IS NULL OR valor_padrao >= 0),
  dia integer NOT NULL CHECK (dia BETWEEN 1 AND 31),
  data_inicio date NOT NULL,
  data_fim date NULL,
  ativa boolean NOT NULL DEFAULT true,
  observacoes text NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_recorrencias_categoria FOREIGN KEY (categoria_id, familia_id) REFERENCES public.categorias(id, familia_id) ON DELETE SET NULL,
  CONSTRAINT fk_recorrencias_conta FOREIGN KEY (conta_id, familia_id) REFERENCES public.contas(id, familia_id) ON DELETE SET NULL,
  CONSTRAINT fk_recorrencias_cartao FOREIGN KEY (cartao_credito_id, familia_id) REFERENCES public.cartoes_credito(id, familia_id) ON DELETE SET NULL
);

-- 3.9 transferencias
CREATE TABLE IF NOT EXISTS public.transferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  conta_origem_id uuid NOT NULL,
  conta_destino_id uuid NOT NULL,
  valor numeric(14,2) NOT NULL CHECK (valor > 0),
  data_transferencia date NOT NULL,
  descricao text NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_diferente_conta CHECK (conta_origem_id <> conta_destino_id),
  CONSTRAINT fk_transferencias_origem FOREIGN KEY (conta_origem_id, familia_id) REFERENCES public.contas(id, familia_id),
  CONSTRAINT fk_transferencias_destino FOREIGN KEY (conta_destino_id, familia_id) REFERENCES public.contas(id, familia_id)
);

-- 3.10 metas
CREATE TABLE IF NOT EXISTS public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  conta_id uuid NULL,
  nome text NOT NULL CHECK (char_length(trim(nome)) > 0),
  valor_meta numeric(14,2) NOT NULL CHECK (valor_meta > 0),
  valor_atual numeric(14,2) NOT NULL DEFAULT 0 CHECK (valor_atual >= 0),
  data_limite date NULL,
  status text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'cancelada')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_metas_conta FOREIGN KEY (conta_id, familia_id) REFERENCES public.contas(id, familia_id) ON DELETE SET NULL
);

-- 3.11 orcamentos
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  categoria_id uuid NOT NULL,
  mes_referencia date NOT NULL CHECK (date_trunc('month', mes_referencia) = mes_referencia),
  valor_limite numeric(14,2) NOT NULL CHECK (valor_limite >= 0),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_familia_categoria_mes UNIQUE (familia_id, categoria_id, mes_referencia),
  CONSTRAINT fk_orcamentos_categoria FOREIGN KEY (categoria_id, familia_id) REFERENCES public.categorias(id, familia_id) ON DELETE CASCADE
);

-- 3.12 configuracoes_familia
CREATE TABLE IF NOT EXISTS public.configuracoes_familia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL UNIQUE REFERENCES public.familias(id) ON DELETE CASCADE,
  proximo_dia_pagamento integer NULL CHECK (proximo_dia_pagamento IS NULL OR (proximo_dia_pagamento BETWEEN 1 AND 31)),
  notificacoes_ativas boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- 3.13 movimentacoes (Fonte oficial de cálculo de saldo)
CREATE TABLE IF NOT EXISTS public.movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  conta_id uuid NULL,
  origem_tipo text NOT NULL CHECK (origem_tipo IN ('receita', 'despesa', 'transferencia_entrada', 'transferencia_saida')),
  origem_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor numeric(14,2) NOT NULL CHECK (valor > 0),
  data_movimento date NOT NULL DEFAULT current_date,
  descricao text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_movimentacoes_origem UNIQUE (origem_id, origem_tipo),
  CONSTRAINT fk_movimentacoes_conta FOREIGN KEY (conta_id, familia_id) REFERENCES public.contas(id, familia_id) ON DELETE SET NULL
);

-- 3.14 parcelamentos
CREATE TABLE IF NOT EXISTS public.parcelamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  despesa_id uuid NOT NULL REFERENCES public.despesas(id) ON DELETE CASCADE,
  parcela_atual integer NOT NULL CHECK (parcela_atual >= 1),
  quantidade_parcelas integer NOT NULL CHECK (quantidade_parcelas >= 1 AND parcela_atual <= quantidade_parcelas),
  valor_parcela numeric(14,2) NOT NULL CHECK (valor_parcela >= 0),
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- 3.15 anexos
CREATE TABLE IF NOT EXISTS public.anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  tipo_origem text NOT NULL,
  origem_id uuid NOT NULL,
  caminho_storage text NOT NULL,
  nome_arquivo text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- 3.16 tags
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(trim(nome)) > 0),
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_familia_tag UNIQUE (familia_id, nome)
);

-- 3.17 despesa_tags (Relacionamento N:N)
CREATE TABLE IF NOT EXISTS public.despesa_tags (
  despesa_id uuid NOT NULL REFERENCES public.despesas(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (despesa_id, tag_id)
);

-- 3.18 historico_alteracoes (Trilha de Auditoria)
CREATE TABLE IF NOT EXISTS public.historico_alteracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  usuario_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  tabela text NOT NULL,
  registro_id uuid NOT NULL,
  acao text NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
  dados_anteriores jsonb NULL,
  dados_novos jsonb NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. TRIGGERS DE ATUALIZADO_EM E AUDITORIA
-- ============================================================================

DROP TRIGGER IF EXISTS trg_familias_atualizado_em ON public.familias;
CREATE TRIGGER trg_familias_atualizado_em BEFORE UPDATE ON public.familias FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_contas_atualizado_em ON public.contas;
CREATE TRIGGER trg_contas_atualizado_em BEFORE UPDATE ON public.contas FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_cartoes_credito_atualizado_em ON public.cartoes_credito;
CREATE TRIGGER trg_cartoes_credito_atualizado_em BEFORE UPDATE ON public.cartoes_credito FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_receitas_atualizado_em ON public.receitas;
CREATE TRIGGER trg_receitas_atualizado_em BEFORE UPDATE ON public.receitas FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_despesas_atualizado_em ON public.despesas;
CREATE TRIGGER trg_despesas_atualizado_em BEFORE UPDATE ON public.despesas FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_recorrencias_atualizado_em ON public.recorrencias;
CREATE TRIGGER trg_recorrencias_atualizado_em BEFORE UPDATE ON public.recorrencias FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_metas_atualizado_em ON public.metas;
CREATE TRIGGER trg_metas_atualizado_em BEFORE UPDATE ON public.metas FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_orcamentos_atualizado_em ON public.orcamentos;
CREATE TRIGGER trg_orcamentos_atualizado_em BEFORE UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

DROP TRIGGER IF EXISTS trg_configuracoes_familia_atualizado_em ON public.configuracoes_familia;
CREATE TRIGGER trg_configuracoes_familia_atualizado_em BEFORE UPDATE ON public.configuracoes_familia FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp_atualizado_em();

-- Trigger de Auditoria Generico
CREATE OR REPLACE FUNCTION public.registrar_historico_alteracao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_familia_id uuid;
  v_registro_id uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_registro_id := OLD.id;
    BEGIN
      v_familia_id := OLD.familia_id;
    EXCEPTION WHEN OTHERS THEN
      v_familia_id := NULL;
    END;
    INSERT INTO public.historico_alteracoes (familia_id, usuario_id, tabela, registro_id, acao, dados_anteriores, dados_novos)
    VALUES (v_familia_id, auth.uid(), TG_TABLE_NAME, v_registro_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_registro_id := NEW.id;
    BEGIN
      v_familia_id := NEW.familia_id;
    EXCEPTION WHEN OTHERS THEN
      v_familia_id := NULL;
    END;
    INSERT INTO public.historico_alteracoes (familia_id, usuario_id, tabela, registro_id, acao, dados_anteriores, dados_novos)
    VALUES (v_familia_id, auth.uid(), TG_TABLE_NAME, v_registro_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    v_registro_id := NEW.id;
    BEGIN
      v_familia_id := NEW.familia_id;
    EXCEPTION WHEN OTHERS THEN
      v_familia_id := NULL;
    END;
    INSERT INTO public.historico_alteracoes (familia_id, usuario_id, tabela, registro_id, acao, dados_anteriores, dados_novos)
    VALUES (v_familia_id, auth.uid(), TG_TABLE_NAME, v_registro_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- ============================================================================
-- 5. TRIGGERS AUTOMÁTICOS E IDEMPOTENTES PARA MOVIMENTAÇÕES
-- ============================================================================

-- 5.1 Trigger em Receitas
CREATE OR REPLACE FUNCTION public.sincronizar_movimentacao_receita()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (NEW.status = 'recebida' AND COALESCE(NEW.valor_recebido, NEW.valor_previsto, 0) > 0 AND NEW.conta_id IS NOT NULL) THEN
    INSERT INTO public.movimentacoes (familia_id, conta_id, origem_tipo, origem_id, tipo, valor, data_movimento, descricao)
    VALUES (
      NEW.familia_id,
      NEW.conta_id,
      'receita',
      NEW.id,
      'entrada',
      COALESCE(NEW.valor_recebido, NEW.valor_previsto),
      COALESCE(NEW.data_recebimento, NEW.data_prevista, current_date),
      NEW.descricao
    )
    ON CONFLICT (origem_id, origem_tipo) DO UPDATE
    SET conta_id = EXCLUDED.conta_id,
        valor = EXCLUDED.valor,
        data_movimento = EXCLUDED.data_movimento,
        descricao = EXCLUDED.descricao;
  ELSE
    DELETE FROM public.movimentacoes WHERE origem_tipo = 'receita' AND origem_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_movimentacao_receita ON public.receitas;
CREATE TRIGGER trg_sync_movimentacao_receita
  AFTER INSERT OR UPDATE ON public.receitas
  FOR EACH ROW EXECUTE FUNCTION public.sincronizar_movimentacao_receita();

CREATE OR REPLACE FUNCTION public.limpar_movimentacao_receita_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.movimentacoes WHERE origem_tipo = 'receita' AND origem_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_clean_movimentacao_receita_delete ON public.receitas;
CREATE TRIGGER trg_clean_movimentacao_receita_delete
  AFTER DELETE ON public.receitas
  FOR EACH ROW EXECUTE FUNCTION public.limpar_movimentacao_receita_delete();

-- 5.2 Trigger em Despesas
CREATE OR REPLACE FUNCTION public.sincronizar_movimentacao_despesa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (NEW.status = 'paga' AND COALESCE(NEW.valor_pago, NEW.valor_previsto, 0) > 0 AND NEW.conta_id IS NOT NULL) THEN
    INSERT INTO public.movimentacoes (familia_id, conta_id, origem_tipo, origem_id, tipo, valor, data_movimento, descricao)
    VALUES (
      NEW.familia_id,
      NEW.conta_id,
      'despesa',
      NEW.id,
      'saida',
      COALESCE(NEW.valor_pago, NEW.valor_previsto),
      COALESCE(NEW.data_pagamento, NEW.data_vencimento, current_date),
      NEW.descricao
    )
    ON CONFLICT (origem_id, origem_tipo) DO UPDATE
    SET conta_id = EXCLUDED.conta_id,
        valor = EXCLUDED.valor,
        data_movimento = EXCLUDED.data_movimento,
        descricao = EXCLUDED.descricao;
  ELSE
    DELETE FROM public.movimentacoes WHERE origem_tipo = 'despesa' AND origem_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_movimentacao_despesa ON public.despesas;
CREATE TRIGGER trg_sync_movimentacao_despesa
  AFTER INSERT OR UPDATE ON public.despesas
  FOR EACH ROW EXECUTE FUNCTION public.sincronizar_movimentacao_despesa();

CREATE OR REPLACE FUNCTION public.limpar_movimentacao_despesa_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.movimentacoes WHERE origem_tipo = 'despesa' AND origem_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_clean_movimentacao_despesa_delete ON public.despesas;
CREATE TRIGGER trg_clean_movimentacao_despesa_delete
  AFTER DELETE ON public.despesas
  FOR EACH ROW EXECUTE FUNCTION public.limpar_movimentacao_despesa_delete();

-- 5.3 Trigger em Transferências
CREATE OR REPLACE FUNCTION public.sincronizar_movimentacao_transferencia()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    DELETE FROM public.movimentacoes WHERE origem_id = NEW.id AND origem_tipo IN ('transferencia_saida', 'transferencia_entrada');
    
    INSERT INTO public.movimentacoes (familia_id, conta_id, origem_tipo, origem_id, tipo, valor, data_movimento, descricao)
    VALUES 
      (NEW.familia_id, NEW.conta_origem_id, 'transferencia_saida', NEW.id, 'saida', NEW.valor, NEW.data_transferencia, COALESCE(NEW.descricao, 'Transferência enviada')),
      (NEW.familia_id, NEW.conta_destino_id, 'transferencia_entrada', NEW.id, 'entrada', NEW.valor, NEW.data_transferencia, COALESCE(NEW.descricao, 'Transferência recebida'));
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.movimentacoes WHERE origem_id = OLD.id AND origem_tipo IN ('transferencia_saida', 'transferencia_entrada');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_movimentacao_transferencia ON public.transferencias;
CREATE TRIGGER trg_sync_movimentacao_transferencia
  AFTER INSERT OR UPDATE OR DELETE ON public.transferencias
  FOR EACH ROW EXECUTE FUNCTION public.sincronizar_movimentacao_transferencia();

-- ============================================================================
-- 6. ÍNDICES DE PERFORMANCE E PARCIAIS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_membros_familia_familia_id ON public.membros_familia(familia_id);
CREATE INDEX IF NOT EXISTS idx_membros_familia_usuario_id ON public.membros_familia(usuario_id);

CREATE INDEX IF NOT EXISTS idx_contas_familia_id ON public.contas(familia_id);

CREATE INDEX IF NOT EXISTS idx_cartoes_credito_familia_id ON public.cartoes_credito(familia_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_credito_conta_pagamento_id ON public.cartoes_credito(conta_pagamento_id);

CREATE INDEX IF NOT EXISTS idx_categorias_familia_id ON public.categorias(familia_id);

CREATE INDEX IF NOT EXISTS idx_receitas_familia_id ON public.receitas(familia_id);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria_id ON public.receitas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_receitas_conta_id ON public.receitas(conta_id);
CREATE INDEX IF NOT EXISTS idx_receitas_mes_referencia ON public.receitas(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_receitas_status ON public.receitas(status);

-- Índice parcial para receitas pendentes
CREATE INDEX IF NOT EXISTS idx_receitas_pendentes ON public.receitas(familia_id, data_prevista) WHERE status = 'pendente';

CREATE INDEX IF NOT EXISTS idx_despesas_familia_id ON public.despesas(familia_id);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria_id ON public.despesas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_despesas_conta_id ON public.despesas(conta_id);
CREATE INDEX IF NOT EXISTS idx_despesas_cartao_credito_id ON public.despesas(cartao_credito_id);
CREATE INDEX IF NOT EXISTS idx_despesas_mes_referencia ON public.despesas(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_despesas_status ON public.despesas(status);

-- Índice parcial para despesas a vencer
CREATE INDEX IF NOT EXISTS idx_despesas_pendentes_atrasadas ON public.despesas(familia_id, data_vencimento, dia_vencimento) WHERE status IN ('pendente', 'atrasada');

CREATE INDEX IF NOT EXISTS idx_recorrencias_familia_id ON public.recorrencias(familia_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_familia_id ON public.transferencias(familia_id);
CREATE INDEX IF NOT EXISTS idx_metas_familia_id ON public.metas(familia_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_familia_id ON public.orcamentos(familia_id);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_familia_id ON public.movimentacoes(familia_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_conta_id ON public.movimentacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON public.movimentacoes(data_movimento);

CREATE INDEX IF NOT EXISTS idx_parcelamentos_familia_id ON public.parcelamentos(familia_id);
CREATE INDEX IF NOT EXISTS idx_parcelamentos_despesa_id ON public.parcelamentos(despesa_id);

CREATE INDEX IF NOT EXISTS idx_anexos_familia_id ON public.anexos(familia_id);
CREATE INDEX IF NOT EXISTS idx_anexos_origem ON public.anexos(tipo_origem, origem_id);

CREATE INDEX IF NOT EXISTS idx_tags_familia_id ON public.tags(familia_id);
CREATE INDEX IF NOT EXISTS idx_despesa_tags_tag_id ON public.despesa_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_historico_alteracoes_familia_id ON public.historico_alteracoes(familia_id);

-- ============================================================================
-- 7. RLS E POLÍTICAS DE SEGURANÇA GRANULARES
-- ============================================================================

ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesa_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_alteracoes ENABLE ROW LEVEL SECURITY;

-- Politicas para familias
DROP POLICY IF EXISTS "Membros podem ver sua familia" ON public.familias;
CREATE POLICY "Membros podem ver sua familia" ON public.familias FOR SELECT TO authenticated
  USING (public.usuario_pertence_familia(id));

DROP POLICY IF EXISTS "Proprietarios podem atualizar sua familia" ON public.familias;
CREATE POLICY "Proprietarios podem atualizar sua familia" ON public.familias FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.membros_familia WHERE familia_id = familias.id AND usuario_id = auth.uid() AND papel = 'proprietario'));

-- Politicas para membros_familia
DROP POLICY IF EXISTS "Membros podem ver membros da familia" ON public.membros_familia;
CREATE POLICY "Membros podem ver membros da familia" ON public.membros_familia FOR SELECT TO authenticated
  USING (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Proprietarios podem gerenciar membros" ON public.membros_familia;
CREATE POLICY "Proprietarios podem gerenciar membros" ON public.membros_familia FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.membros_familia m WHERE m.familia_id = membros_familia.familia_id AND m.usuario_id = auth.uid() AND m.papel = 'proprietario'));

DROP POLICY IF EXISTS "Proprietarios podem remover membros" ON public.membros_familia;
CREATE POLICY "Proprietarios podem remover membros" ON public.membros_familia FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.membros_familia m WHERE m.familia_id = membros_familia.familia_id AND m.usuario_id = auth.uid() AND m.papel = 'proprietario'));

-- Politicas Padrao Multi-tenant para tabelas da familia
DROP POLICY IF EXISTS "Membros podem acessar contas" ON public.contas;
CREATE POLICY "Membros podem acessar contas" ON public.contas FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar cartoes_credito" ON public.cartoes_credito;
CREATE POLICY "Membros podem acessar cartoes_credito" ON public.cartoes_credito FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar categorias" ON public.categorias;
CREATE POLICY "Membros podem acessar categorias" ON public.categorias FOR SELECT TO authenticated
  USING (categoria_sistema = true OR familia_id IS NULL OR public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem criar e editar categorias da familia" ON public.categorias;
CREATE POLICY "Membros podem criar e editar categorias da familia" ON public.categorias FOR ALL TO authenticated
  USING (categoria_sistema = false AND public.usuario_pertence_familia(familia_id))
  WITH CHECK (categoria_sistema = false AND public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar receitas" ON public.receitas;
CREATE POLICY "Membros podem acessar receitas" ON public.receitas FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar despesas" ON public.despesas;
CREATE POLICY "Membros podem acessar despesas" ON public.despesas FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar recorrencias" ON public.recorrencias;
CREATE POLICY "Membros podem acessar recorrencias" ON public.recorrencias FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar transferencias" ON public.transferencias;
CREATE POLICY "Membros podem acessar transferencias" ON public.transferencias FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar metas" ON public.metas;
CREATE POLICY "Membros podem acessar metas" ON public.metas FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar orcamentos" ON public.orcamentos;
CREATE POLICY "Membros podem acessar orcamentos" ON public.orcamentos FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar configuracoes_familia" ON public.configuracoes_familia;
CREATE POLICY "Membros podem acessar configuracoes_familia" ON public.configuracoes_familia FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem ver movimentacoes" ON public.movimentacoes;
CREATE POLICY "Membros podem ver movimentacoes" ON public.movimentacoes FOR SELECT TO authenticated
  USING (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar parcelamentos" ON public.parcelamentos;
CREATE POLICY "Membros podem acessar parcelamentos" ON public.parcelamentos FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar anexos" ON public.anexos;
CREATE POLICY "Membros podem acessar anexos" ON public.anexos FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar tags" ON public.tags;
CREATE POLICY "Membros podem acessar tags" ON public.tags FOR ALL TO authenticated
  USING (public.usuario_pertence_familia(familia_id)) WITH CHECK (public.usuario_pertence_familia(familia_id));

DROP POLICY IF EXISTS "Membros podem acessar despesa_tags" ON public.despesa_tags;
CREATE POLICY "Membros podem acessar despesa_tags" ON public.despesa_tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.despesas WHERE id = despesa_id AND public.usuario_pertence_familia(familia_id)));

DROP POLICY IF EXISTS "Membros podem ver historico_alteracoes" ON public.historico_alteracoes;
CREATE POLICY "Membros podem ver historico_alteracoes" ON public.historico_alteracoes FOR SELECT TO authenticated
  USING (familia_id IS NULL OR public.usuario_pertence_familia(familia_id));

-- ============================================================================
-- 8. FUNÇÕES RPC COM PERMISSÕES E SECURITY DEFINER CONTROLADOS
-- ============================================================================

-- 8.1 criar_familia
CREATE OR REPLACE FUNCTION public.criar_familia(nome_familia text, nome_usuario text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  nova_familia_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF char_length(trim(nome_familia)) = 0 OR char_length(trim(nome_usuario)) = 0 THEN
    RAISE EXCEPTION 'Nome da família e nome do usuário são obrigatórios.';
  END IF;

  INSERT INTO public.familias (nome)
  VALUES (trim(nome_familia))
  RETURNING id INTO nova_familia_id;

  INSERT INTO public.membros_familia (familia_id, usuario_id, nome_exibicao, papel)
  VALUES (nova_familia_id, current_user_id, trim(nome_usuario), 'proprietario');

  INSERT INTO public.configuracoes_familia (familia_id)
  VALUES (nova_familia_id);

  RETURN nova_familia_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.criar_familia(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.criar_familia(text, text) TO authenticated;

-- 8.2 configurar_familia_inicial
CREATE OR REPLACE FUNCTION public.configurar_familia_inicial(familia_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  cat_salario_id uuid;
  hoje date := current_date;
  inicio_mes date := date_trunc('month', hoje)::date;
BEGIN
  IF NOT public.usuario_pertence_familia(familia_uuid) THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é membro desta família.';
  END IF;

  -- Categorias de Receita
  INSERT INTO public.categorias (familia_id, nome, tipo, categoria_sistema)
  VALUES 
    (familia_uuid, 'Salario', 'receita', true),
    (familia_uuid, 'Renda extra', 'receita', true),
    (familia_uuid, 'Reembolso', 'receita', true),
    (familia_uuid, 'Outros', 'receita', true)
  ON CONFLICT (COALESCE(familia_id, '00000000-0000-0000-0000-000000000000'::uuid), nome, tipo) DO NOTHING;

  -- Categorias de Despesa
  INSERT INTO public.categorias (familia_id, nome, tipo, categoria_sistema)
  VALUES 
    (familia_uuid, 'Moradia', 'despesa', true),
    (familia_uuid, 'Educacao', 'despesa', true),
    (familia_uuid, 'Saude', 'despesa', true),
    (familia_uuid, 'Veiculos', 'despesa', true),
    (familia_uuid, 'Comunicacao', 'despesa', true),
    (familia_uuid, 'Mercado', 'despesa', true),
    (familia_uuid, 'Combustivel', 'despesa', true),
    (familia_uuid, 'Lazer', 'despesa', true),
    (familia_uuid, 'Assinaturas', 'despesa', true),
    (familia_uuid, 'Impostos', 'despesa', true),
    (familia_uuid, 'Dividas', 'despesa', true),
    (familia_uuid, 'Outros', 'despesa', true)
  ON CONFLICT (COALESCE(familia_id, '00000000-0000-0000-0000-000000000000'::uuid), nome, tipo) DO NOTHING;

  SELECT id INTO cat_salario_id 
  FROM public.categorias 
  WHERE (familia_id = familia_uuid OR categoria_sistema = true) 
    AND nome = 'Salario' AND tipo = 'receita'
  LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.recorrencias WHERE familia_id = familia_uuid AND pessoa = 'Clayton' AND dia = 10 AND tipo = 'receita') THEN
    INSERT INTO public.recorrencias (familia_id, tipo, descricao, pessoa, categoria_id, dia, data_inicio, valor_padrao)
    VALUES (familia_uuid, 'receita', 'Pagamento Clayton - Dia 10', 'Clayton', cat_salario_id, 10, inicio_mes, NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recorrencias WHERE familia_id = familia_uuid AND pessoa = 'Janine' AND dia = 10 AND tipo = 'receita') THEN
    INSERT INTO public.recorrencias (familia_id, tipo, descricao, pessoa, categoria_id, dia, data_inicio, valor_padrao)
    VALUES (familia_uuid, 'receita', 'Pagamento Janine - Dia 10', 'Janine', cat_salario_id, 10, inicio_mes, NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recorrencias WHERE familia_id = familia_uuid AND pessoa = 'Clayton' AND dia = 25 AND tipo = 'receita') THEN
    INSERT INTO public.recorrencias (familia_id, tipo, descricao, pessoa, categoria_id, dia, data_inicio, valor_padrao)
    VALUES (familia_uuid, 'receita', 'Pagamento Clayton - Dia 25', 'Clayton', cat_salario_id, 25, inicio_mes, NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recorrencias WHERE familia_id = familia_uuid AND pessoa = 'Janine' AND dia = 25 AND tipo = 'receita') THEN
    INSERT INTO public.recorrencias (familia_id, tipo, descricao, pessoa, categoria_id, dia, data_inicio, valor_padrao)
    VALUES (familia_uuid, 'receita', 'Pagamento Janine - Dia 25', 'Janine', cat_salario_id, 25, inicio_mes, NULL);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.configurar_familia_inicial(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.configurar_familia_inicial(uuid) TO authenticated;

-- 8.3 proximo_pagamento
CREATE OR REPLACE FUNCTION public.proximo_pagamento(familia_uuid uuid)
RETURNS date
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  hoje date := current_date;
  dia_hoje integer := extract(day from hoje);
  proximo date;
BEGIN
  IF NOT public.usuario_pertence_familia(familia_uuid) THEN
    RAISE EXCEPTION 'Acesso negado: usuario nao e membro desta familia.';
  END IF;

  IF dia_hoje < 10 THEN
    proximo := make_date(extract(year from hoje)::int, extract(month from hoje)::int, 10);
  ELSIF dia_hoje < 25 THEN
    proximo := make_date(extract(year from hoje)::int, extract(month from hoje)::int, 25);
  ELSE
    proximo := (date_trunc('month', hoje) + interval '1 month' + interval '9 days')::date;
  END IF;
  RETURN proximo;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.proximo_pagamento(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.proximo_pagamento(uuid) TO authenticated;

-- 8.4 valor_disponivel_ate_proximo_pagamento
CREATE OR REPLACE FUNCTION public.valor_disponivel_ate_proximo_pagamento(familia_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  saldo_total numeric(14,2) := 0;
  despesas_pendentes numeric(14,2) := 0;
  data_prox date;
BEGIN
  IF NOT public.usuario_pertence_familia(familia_uuid) THEN
    RAISE EXCEPTION 'Acesso negado: usuario nao e membro desta familia.';
  END IF;

  data_prox := public.proximo_pagamento(familia_uuid);

  SELECT COALESCE(SUM(c.saldo_inicial), 0) + COALESCE(SUM(
    CASE WHEN m.tipo = 'entrada' THEN m.valor ELSE -m.valor END
  ), 0) INTO saldo_total
  FROM public.contas c
  LEFT JOIN public.movimentacoes m ON m.conta_id = c.id
  WHERE c.familia_id = familia_uuid AND c.ativa = true;

  SELECT COALESCE(SUM(COALESCE(valor_pago, valor_previsto)), 0) INTO despesas_pendentes
  FROM public.despesas
  WHERE familia_id = familia_uuid
    AND status IN ('pendente', 'atrasada')
    AND COALESCE(data_vencimento, mes_referencia + (COALESCE(dia_vencimento, 1) - 1) * INTERVAL '1 day') <= data_prox;

  RETURN (saldo_total - despesas_pendentes);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.valor_disponivel_ate_proximo_pagamento(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.valor_disponivel_ate_proximo_pagamento(uuid) TO authenticated;

-- ============================================================================
-- 9. VIEWS COM FILTRO DE SEGURANÇA MULTI-TENANT INCORPORADO
-- ============================================================================

-- 9.1 resumo_financeiro_mensal
CREATE OR REPLACE VIEW public.resumo_financeiro_mensal AS
WITH rec AS (
  SELECT 
    familia_id,
    mes_referencia,
    COALESCE(SUM(valor_previsto), 0) AS total_receitas_previstas,
    COALESCE(SUM(valor_recebido), 0) AS total_receitas_recebidas
  FROM public.receitas
  WHERE status <> 'cancelada'
  GROUP BY familia_id, mes_referencia
),
desp AS (
  SELECT 
    familia_id,
    mes_referencia,
    COALESCE(SUM(valor_previsto), 0) AS total_despesas_previstas,
    COALESCE(SUM(valor_pago), 0) AS total_despesas_pagas,
    COALESCE(SUM(CASE WHEN status IN ('pendente', 'atrasada') THEN COALESCE(valor_pago, valor_previsto) ELSE 0 END), 0) AS despesas_pendentes
  FROM public.despesas
  WHERE status <> 'cancelada'
  GROUP BY familia_id, mes_referencia
),
meses AS (
  SELECT familia_id, mes_referencia FROM rec
  UNION
  SELECT familia_id, mes_referencia FROM desp
)
SELECT 
  m.familia_id,
  m.mes_referencia,
  COALESCE(r.total_receitas_previstas, 0) AS total_receitas_previstas,
  COALESCE(r.total_receitas_recebidas, 0) AS total_receitas_recebidas,
  COALESCE(d.total_despesas_previstas, 0) AS total_despesas_previstas,
  COALESCE(d.total_despesas_pagas, 0) AS total_despesas_pagas,
  (COALESCE(r.total_receitas_previstas, 0) - COALESCE(d.total_despesas_previstas, 0)) AS saldo_previsto,
  (COALESCE(r.total_receitas_recebidas, 0) - COALESCE(d.total_despesas_pagas, 0)) AS saldo_realizado,
  COALESCE(d.despesas_pendentes, 0) AS despesas_pendentes
FROM meses m
LEFT JOIN rec r ON r.familia_id = m.familia_id AND r.mes_referencia = m.mes_referencia
LEFT JOIN desp d ON d.familia_id = m.familia_id AND d.mes_referencia = m.mes_referencia
WHERE public.usuario_pertence_familia(m.familia_id);

-- 9.2 proximas_despesas
CREATE OR REPLACE VIEW public.proximas_despesas AS
SELECT 
  id,
  familia_id,
  categoria_id,
  conta_id,
  cartao_credito_id,
  descricao,
  valor_previsto,
  valor_pago,
  dia_vencimento,
  data_vencimento,
  data_pagamento,
  status,
  forma_pagamento,
  mes_referencia,
  recorrente,
  observacoes,
  criado_em
FROM public.despesas
WHERE status IN ('pendente', 'atrasada')
  AND public.usuario_pertence_familia(familia_id)
ORDER BY COALESCE(data_vencimento, mes_referencia + (COALESCE(dia_vencimento, 1) - 1) * INTERVAL '1 day') ASC;

-- 9.3 dashboard_resumo
CREATE OR REPLACE VIEW public.dashboard_resumo AS
SELECT 
  f.id AS familia_id,
  COALESCE((
    SELECT SUM(c.saldo_inicial) FROM public.contas c WHERE c.familia_id = f.id AND c.ativa = true
  ), 0) + COALESCE((
    SELECT SUM(CASE WHEN m.tipo = 'entrada' THEN m.valor ELSE -m.valor END)
    FROM public.movimentacoes m WHERE m.familia_id = f.id
  ), 0) AS saldo_atual,
  
  COALESCE((
    SELECT SUM(COALESCE(r.valor_recebido, r.valor_previsto, 0))
    FROM public.receitas r
    WHERE r.familia_id = f.id AND r.mes_referencia = date_trunc('month', current_date)::date AND r.status <> 'cancelada'
  ), 0) AS receitas_mes,
  
  COALESCE((
    SELECT SUM(COALESCE(d.valor_pago, d.valor_previsto, 0))
    FROM public.despesas d
    WHERE d.familia_id = f.id AND d.mes_referencia = date_trunc('month', current_date)::date AND d.status <> 'cancelada'
  ), 0) AS despesas_mes,

  COALESCE((
    SELECT SUM(COALESCE(d.valor_pago, d.valor_previsto, 0))
    FROM public.despesas d
    WHERE d.familia_id = f.id AND d.status = 'pendente'
  ), 0) AS despesas_pendentes,

  COALESCE((
    SELECT SUM(COALESCE(d.valor_pago, d.valor_previsto, 0))
    FROM public.despesas d
    WHERE d.familia_id = f.id AND (d.status = 'atrasada' OR (d.status = 'pendente' AND COALESCE(d.data_vencimento, current_date) < current_date))
  ), 0) AS despesas_atrasadas,

  public.proximo_pagamento(f.id) AS proximo_pagamento,
  public.valor_disponivel_ate_proximo_pagamento(f.id) AS dinheiro_disponivel_ate_proximo_pagamento
FROM public.familias f
WHERE public.usuario_pertence_familia(f.id);

COMMIT;
