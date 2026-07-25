# Arquitetura de Dados - Controle Financeiro Familiar

Esta documentação descreve o padrão arquitetural de acesso, transformação e gerenciamento de estado de dados do aplicativo.

---

## 1. Fluxo Unificado de Dados

```
[ UI Component (Client / Server) ]
             │
             ▼
[ Custom React Query Hook (e.g. useDashboardSummary) ]
             │
             ▼
[ Service Layer (e.g. DashboardService) ]
             │
             ▼
[ Repository Layer (e.g. DashboardRepository + Zod Parse) ]
             │
             ▼
[ Supabase JS Client (RLS Autenticado) ]
             │
             ▼
[ Banco de Dados PostgreSQL ]
```

---

## 2. Responsabilidades por Camada

### **Repositories (`lib/repositories/`)**
- Acesso exclusivo ao Supabase.
- Respeito integral ao RLS (Row Level Security).
- Seleção explícita de colunas (evitando `select("*")`).
- Validação estrita de retornos via schemas Zod.
- Conversão de exceções do Supabase para `AppError`.
- **Proibido**: Formatação de texto para UI, concatenações visuais ou regras de exibição.

### **Services (`lib/services/`)**
- Regras de negócio e composição de múltiplas fontes.
- Cálculo de métricas brutas (números finitos e datas ISO).
- Isolamento de detalhes do banco em estruturas consolidadas (ex: `DashboardData`).

### **Query Keys & Cache (`lib/query/query-keys.ts`)**
- Factory tipada e centralizada para gerenciamento de chaves do TanStack Query.
- Evita o uso de strings soltas na aplicação.
- Funções auxiliares de invalidação de cache (ex: `invalidateExpenses`, `invalidateAccounts`).

### **Custom Hooks (`hooks/` & `features/*/`)**
- Encapsulam `useQuery` / `useMutation`.
- Gerenciam o estado de carregamento (`isLoading`), dados e erros (`error`).
- Garantem reuso limpo nos componentes de interface.

### **AppError (`lib/errors/app-error.ts`)**
- Padronização de erros da aplicação com mensagens amigáveis em português.
- Códigos suportados: `AUTH_REQUIRED`, `FAMILY_NOT_FOUND`, `PERMISSION_DENIED`, `VALIDATION_ERROR`, `DATABASE_ERROR`, `NETWORK_ERROR`, `UNKNOWN_ERROR`.

---

## 3. Diretrizes de Renderização (Server vs. Client)

- **Server Side (RSC)**: Carregamento inicial de páginas protegidas e hidratação preliminar de dados.
- **Client Side**: Interações dinâmicas, troca de meses de referência, busca com filtros em tempo real e mutations futuras.

---

## 4. Como Criar uma Nova Feature

1. **Defina os Schemas Zod** em `lib/schemas/index.ts`.
2. **Crie o Repository** em `lib/repositories/<feature>.repository.ts`.
3. **Crie o Service** em `lib/services/<feature>.service.ts`.
4. **Adicione a Query Key** em `lib/query/query-keys.ts`.
5. **Crie o Hook** em `hooks/use-<feature>.ts`.
6. **Organize a Feature** dentro da pasta correspondente em `features/<feature>/`.
