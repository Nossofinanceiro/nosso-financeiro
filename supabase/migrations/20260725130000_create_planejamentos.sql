-- Tabela de Planejamentos (Cenários Financeiros)
CREATE TABLE planejamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    familia_id UUID NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_prevista DATE,
    valor_estimado NUMERIC(15, 2) NOT NULL DEFAULT 0,
    prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
    status TEXT CHECK (status IN ('ativo', 'concluido', 'cancelado')) DEFAULT 'ativo',
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens do Planejamento (Entradas e Saídas do Cenário)
CREATE TABLE planejamento_itens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    planejamento_id UUID NOT NULL REFERENCES planejamentos(id) ON DELETE CASCADE,
    tipo TEXT CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(15, 2) NOT NULL,
    mensal BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Segurança (RLS) para planejamentos
ALTER TABLE planejamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver planejamentos da sua família"
    ON planejamentos FOR SELECT
    USING (
        familia_id IN (
            SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir planejamentos na sua família"
    ON planejamentos FOR INSERT
    WITH CHECK (
        familia_id IN (
            SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar planejamentos da sua família"
    ON planejamentos FOR UPDATE
    USING (
        familia_id IN (
            SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
        )
    )
    WITH CHECK (
        familia_id IN (
            SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar planejamentos da sua família"
    ON planejamentos FOR DELETE
    USING (
        familia_id IN (
            SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
        )
    );

-- Políticas de Segurança (RLS) para planejamento_itens
ALTER TABLE planejamento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens de planejamentos da sua família"
    ON planejamento_itens FOR SELECT
    USING (
        planejamento_id IN (
            SELECT id FROM planejamentos WHERE familia_id IN (
                SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
            )
        )
    );

CREATE POLICY "Usuários podem inserir itens em planejamentos da sua família"
    ON planejamento_itens FOR INSERT
    WITH CHECK (
        planejamento_id IN (
            SELECT id FROM planejamentos WHERE familia_id IN (
                SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
            )
        )
    );

CREATE POLICY "Usuários podem atualizar itens de planejamentos da sua família"
    ON planejamento_itens FOR UPDATE
    USING (
        planejamento_id IN (
            SELECT id FROM planejamentos WHERE familia_id IN (
                SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        planejamento_id IN (
            SELECT id FROM planejamentos WHERE familia_id IN (
                SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
            )
        )
    );

CREATE POLICY "Usuários podem deletar itens de planejamentos da sua família"
    ON planejamento_itens FOR DELETE
    USING (
        planejamento_id IN (
            SELECT id FROM planejamentos WHERE familia_id IN (
                SELECT familia_id FROM membros_familia WHERE usuario_id = auth.uid()
            )
        )
    );

-- Triggers para atualização da data de modificado
CREATE TRIGGER update_planejamentos_modtime
    BEFORE UPDATE ON planejamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_planejamento_itens_modtime
    BEFORE UPDATE ON planejamento_itens
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
