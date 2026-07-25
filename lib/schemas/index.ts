import { z } from "zod";

// ==========================================
// 1. Primitive Schemas (Robust & Coercible)
// ==========================================

export const uuidSchema = z.string().uuid({ message: "UUID inválido" });

export const monetarySchema = z.coerce.number().catch(0);

export const isoDateSchema = z.string().nullable().optional();

export const monthReferenceSchema = z.string();

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const filterSchema = z.object({
  search: z.string().optional(),
  categoriaId: uuidSchema.optional(),
  contaId: uuidSchema.optional(),
  status: z.string().optional(),
  dataInicio: isoDateSchema.optional(),
  dataFim: isoDateSchema.optional(),
  mesReferencia: monthReferenceSchema.optional(),
});

// ==========================================
// 2. Official Database Entity Schemas (Matching 20260724000000_estrutura_financeira_inicial.sql)
// ==========================================

export const familiaSchema = z.object({
  id: uuidSchema,
  nome: z.string().min(1, "Nome da família é obrigatório"),
  moeda: z.string().default("USD"),
  fuso_horario: z.string().default("America/Denver"),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const membroFamiliaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  usuario_id: uuidSchema,
  nome_exibicao: z.string().min(1),
  papel: z.enum(["proprietario", "membro"]).default("membro"),
  criado_em: z.string().optional(),
});

export const contaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  nome: z.string().min(1, "Nome da conta é obrigatório"),
  tipo: z.string(),
  saldo_inicial: monetarySchema,
  saldo_atual: monetarySchema.optional(),
  cor: z.string().nullable().optional(),
  icone: z.string().nullable().optional(),
  ativa: z.boolean().default(true),
  observacoes: z.string().nullable().optional(),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const cartaoCreditoSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  conta_pagamento_id: uuidSchema.nullable().optional(),
  nome: z.string().min(1, "Nome do cartão é obrigatório"),
  bandeira: z.string().nullable().optional(),
  limite_credito: monetarySchema,
  dia_fechamento: z.number().nullable().optional(),
  dia_vencimento: z.number().nullable().optional(),
  cor: z.string().nullable().optional(),
  ativo: z.boolean().default(true),
  observacoes: z.string().nullable().optional(),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const categoriaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema.nullable().optional(),
  nome: z.string().min(1, "Nome da categoria é obrigatório"),
  tipo: z.string(),
  cor: z.string().nullable().optional(),
  icone: z.string().nullable().optional(),
  categoria_sistema: z.boolean().default(false),
  ativa: z.boolean().default(true),
  criado_em: z.string().optional(),
});

export const receitaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  categoria_id: uuidSchema.nullable().optional(),
  conta_id: uuidSchema.nullable().optional(),
  pessoa: z.string().min(1).default("Geral"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dia_pagamento: z.number().nullable().optional(),
  valor_previsto: monetarySchema,
  valor_recebido: monetarySchema.nullable().optional(),
  status: z.enum(["pendente", "recebida", "cancelada"]).default("pendente"),
  data_prevista: isoDateSchema,
  data_recebimento: isoDateSchema,
  mes_referencia: isoDateSchema,
  recorrente: z.boolean().default(true),
  observacoes: z.string().nullable().optional(),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const despesaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  categoria_id: uuidSchema.nullable().optional(),
  conta_id: uuidSchema.nullable().optional(),
  cartao_credito_id: uuidSchema.nullable().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor_previsto: monetarySchema,
  valor_pago: monetarySchema.nullable().optional(),
  dia_vencimento: z.number().nullable().optional(),
  data_vencimento: isoDateSchema,
  data_pagamento: isoDateSchema,
  status: z.enum(["pendente", "paga", "atrasada", "cancelada"]).default("pendente"),
  forma_pagamento: z.string().nullable().optional(),
  mes_referencia: isoDateSchema,
  recorrente: z.boolean().default(false),
  observacoes: z.string().nullable().optional(),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const transferenciaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  conta_origem_id: uuidSchema,
  conta_destino_id: uuidSchema,
  valor: monetarySchema,
  data_transferencia: isoDateSchema,
  descricao: z.string().nullable().optional(),
  criado_em: z.string().optional(),
});

export const movimentacaoSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  conta_id: uuidSchema.nullable().optional(),
  tipo: z.string(),
  origem_tipo: z.string(),
  origem_id: uuidSchema.nullable().optional(),
  valor: monetarySchema,
  data_movimento: isoDateSchema,
  descricao: z.string(),
  criado_em: z.string().optional(),
});

export const metaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  conta_id: uuidSchema.nullable().optional(),
  nome: z.string(),
  valor_meta: monetarySchema,
  valor_atual: monetarySchema,
  data_limite: isoDateSchema,
  status: z.string().default("ativa"),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const orcamentoSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  categoria_id: uuidSchema,
  mes_referencia: monthReferenceSchema,
  valor_limite: monetarySchema,
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const recorrenciaSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  tipo: z.string(),
  descricao: z.string(),
  pessoa: z.string().nullable().optional(),
  categoria_id: uuidSchema.nullable().optional(),
  conta_id: uuidSchema.nullable().optional(),
  cartao_credito_id: uuidSchema.nullable().optional(),
  dia: z.number(),
  data_inicio: isoDateSchema,
  data_fim: isoDateSchema,
  valor_padrao: monetarySchema,
  ativa: z.boolean().default(true),
  criado_em: z.string().optional(),
});

export const resumoFinanceiroMensalSchema = z.object({
  familia_id: uuidSchema,
  mes_referencia: z.string(),
  total_receitas_previstas: monetarySchema,
  total_receitas_recebidas: monetarySchema,
  total_despesas_previstas: monetarySchema,
  total_despesas_pagas: monetarySchema,
  saldo_previsto: monetarySchema,
  saldo_realizado: monetarySchema,
  despesas_pendentes: monetarySchema,
});

export const dashboardDataSchema = z.object({
  usuario: z.object({
    id: uuidSchema,
    email: z.string(),
    nome: z.string(),
  }),
  familia: familiaSchema,
  mes_referencia: monthReferenceSchema,
  saldo_atual: monetarySchema,
  receitas_previstas: monetarySchema,
  receitas_recebidas: monetarySchema,
  receitas_pendentes: monetarySchema,
  despesas_previstas: monetarySchema,
  despesas_pagas: monetarySchema,
  despesas_pendentes: monetarySchema,
  saldo_previsto: monetarySchema,
  disponivel_ate_proximo_pagamento: monetarySchema,
  proximo_pagamento: z
    .object({
      descricao: z.string(),
      valor: monetarySchema,
      data: z.string(),
    })
    .nullable(),
  proximas_despesas: z.array(despesaSchema),
  proximas_receitas: z.array(receitaSchema),
  contas: z.array(contaSchema),
  despesas_por_categoria: z.array(
    z.object({
      categoria_id: uuidSchema,
      nome: z.string(),
      cor: z.string().optional(),
      total: monetarySchema,
    })
  ),
});

export const periodForecastRequestSchema = z.object({
  modo: z.enum(["proximo_pagamento", "fim_mes", "personalizado"]),
  dataInicial: z.string().optional(),
  dataFinal: z.string().optional(),
});

export const periodForecastResponseSchema = z.object({
  modo: z.enum(["proximo_pagamento", "fim_mes", "personalizado"]),
  data_inicial: z.string(),
  data_final: z.string(),
  saldo_atual_familiar: monetarySchema,
  despesas_pendentes_no_periodo: monetarySchema,
  receitas_previstas_no_periodo: monetarySchema,
  disponivel_com_dinheiro_atual: monetarySchema,
  saldo_previsto_na_data_final: monetarySchema,
  proximo_pagamento: z.object({
    data: isoDateSchema.optional(),
    valor: monetarySchema,
    descricao: z.string(),
    pessoas: z.array(z.string()).optional(),
    itens: z.array(z.object({
      pessoa: z.string().optional(),
      valor: monetarySchema,
      descricao: z.string(),
    })).optional(),
  }).nullable(),
  lancamentos_despesas: z.array(despesaSchema),
  lancamentos_receitas: z.array(receitaSchema),
});

export const planejamentoItemSchema = z.object({
  id: uuidSchema,
  planejamento_id: uuidSchema,
  tipo: z.enum([
    "nova_receita_mensal",
    "receita_unica",
    "reducao_despesa",
    "nova_despesa_mensal",
    "despesa_unica",
    "entrada_inicial",
    "parcelamento",
    "alteracao_receita",
    "alteracao_despesa",
    "entrada",
    "saida"
  ]),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: monetarySchema,
  mensal: z.boolean().default(false),
  data_inicial: isoDateSchema.nullable().optional(),
  data_final: isoDateSchema.nullable().optional(),
  recorrencia: z.enum(["unica", "mensal", "anual"]).default("unica"),
  referencia_id: uuidSchema.nullable().optional(),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export const planejamentoSchema = z.object({
  id: uuidSchema,
  familia_id: uuidSchema,
  categoria_id: uuidSchema.nullable().optional(),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().nullable().optional(),
  data_prevista: isoDateSchema.nullable().optional(),
  valor_estimado: monetarySchema.default(0),
  valor_entrada: monetarySchema.default(0),
  margem_seguranca: monetarySchema.default(0.10),
  conta_id: uuidSchema.nullable().optional(),
  prioridade: z.enum(["baixa", "media", "alta"]).default("media"),
  status: z.enum(["ativo", "concluido", "cancelado"]).default("ativo"),
  observacoes: z.string().nullable().optional(),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
  itens: z.array(planejamentoItemSchema).optional(),
});

// ==========================================
// 3. Exported Inferred Types
// ==========================================

export type Familia = z.infer<typeof familiaSchema>;
export type MembroFamilia = z.infer<typeof membroFamiliaSchema>;
export type Conta = z.infer<typeof contaSchema>;
export type CartaoCredito = z.infer<typeof cartaoCreditoSchema>;
export type Categoria = z.infer<typeof categoriaSchema>;
export type Receita = z.infer<typeof receitaSchema>;
export type Despesa = z.infer<typeof despesaSchema>;
export type Transferencia = z.infer<typeof transferenciaSchema>;
export type Movimentacao = z.infer<typeof movimentacaoSchema>;
export type Meta = z.infer<typeof metaSchema>;
export type Orcamento = z.infer<typeof orcamentoSchema>;
export type Recorrencia = z.infer<typeof recorrenciaSchema>;
export type ResumoFinanceiroMensal = z.infer<typeof resumoFinanceiroMensalSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
export type FilterParams = z.infer<typeof filterSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type PeriodForecastRequest = z.infer<typeof periodForecastRequestSchema>;
export type PeriodForecastResponse = z.infer<typeof periodForecastResponseSchema>;
export type Planejamento = z.infer<typeof planejamentoSchema>;
export type PlanejamentoItem = z.infer<typeof planejamentoItemSchema>;
