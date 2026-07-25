"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Tabs } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { Tooltip } from "@/components/ui/tooltip";
import { Popover } from "@/components/ui/popover";
import { CommandMenu } from "@/components/ui/command-menu";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { DatePicker } from "@/components/ui/date-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { TableActions } from "@/components/ui/table-actions";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { formatCurrency } from "@/lib/utils";
import { useDeviceType } from "@/hooks/use-media-query";
import { usePwa } from "@/hooks/use-pwa";
import {
  Mail,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Command,
  HelpCircle,
  CheckCircle2,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  Download,
  ShieldCheck,
} from "lucide-react";

interface MockTransaction {
  id: string;
  descricao: string;
  categoria: string;
  data: string;
  valor: number;
  status: "success" | "pending" | "delayed" | "cancelled";
}

const mockData: MockTransaction[] = [
  { id: "1", descricao: "Salário Mensal", categoria: "Renda", data: "2026-07-10", valor: 12450.80, status: "success" },
  { id: "2", descricao: "Supermercado Semanal", categoria: "Mercado", data: "2026-07-12", valor: -850.30, status: "success" },
  { id: "3", descricao: "Aluguel da Moradia", categoria: "Moradia", data: "2026-07-15", valor: -2500.00, status: "pending" },
  { id: "4", descricao: "Manutenção Veicular", categoria: "Veículos", data: "2026-07-05", valor: -470.20, status: "delayed" },
  { id: "5", descricao: "Projeto Freelance", categoria: "Renda Extra", data: "2026-07-18", valor: 3200.00, status: "success" },
  { id: "6", descricao: "Plano de Saúde", categoria: "Saúde", data: "2026-07-20", valor: -950.00, status: "cancelled" },
];

export default function DesignSystemPage() {
  const { toast } = useToast();
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const { canInstall, installPwa, isStandalone } = usePwa();

  // States
  const [modalOpen, setModalOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [overlayLoading, setOverlayLoading] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState("visao-geral");
  const [searchVal, setSearchVal] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("2026-07-24");
  const [currencyVal, setCurrencyVal] = React.useState(1500.00);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [checkboxState, setCheckboxState] = React.useState(true);

  // Filtered mock data
  const filteredData = React.useMemo(() => {
    return mockData.filter(
      (item) =>
        item.descricao.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [searchVal]);

  const handleDeleteItem = (id: string) => {
    toast({
      title: "Registro Excluído",
      description: `O item ID #${id} foi removido com sucesso.`,
      variant: "success",
    });
  };

  const columns: Column<MockTransaction>[] = [
    {
      key: "descricao",
      header: "Descrição",
      sortable: true,
      accessor: (item) => (
        <span className="font-medium text-foreground">{item.descricao}</span>
      ),
    },
    {
      key: "categoria",
      header: "Categoria",
      sortable: true,
      accessor: (item) => (
        <Badge variant="neutral">{item.categoria}</Badge>
      ),
    },
    {
      key: "data",
      header: "Data",
      sortable: true,
      accessor: (item) => <span className="text-muted">{item.data}</span>,
    },
    {
      key: "status",
      header: "Status",
      accessor: (item) => (
        <StatusIndicator status={item.status} />
      ),
    },
    {
      key: "valor",
      header: "Valor (USD)",
      align: "right",
      sortable: true,
      accessor: (item) => (
        <span
          className={`font-mono font-bold ${
            item.valor > 0 ? "text-primary" : "text-danger"
          }`}
        >
          {formatCurrency(item.valor)}
        </span>
      ),
    },
  ];

  return (
    <AppShell title="UI Kit & Design System">
      {/* Overlay demonstrativo */}
      <LoadingOverlay
        isLoading={overlayLoading}
        message="Processando dados financeiros..."
      />

      <PageHeader
        title="Arquitetura Multiplataforma"
        description="Infraestrutura preparada para Mobile First (320px+), PWA, Capacitor, iOS Safe Area, Bottom Navigation e layouts adaptativos."
        action={
          <div className="flex items-center gap-2">
            {canInstall && (
              <Button variant="primary" onClick={installPwa}>
                <Download className="w-4 h-4" />
                <span>Instalar PWA</span>
              </Button>
            )}
            <Button variant="secondary" onClick={() => setCmdOpen(true)}>
              <Command className="w-4 h-4 text-primary" />
              <span>Abrir Ctrl+K</span>
            </Button>
          </div>
        }
      />

      {/* Status da Arquitetura Multiplataforma */}
      <Card className="border-primary/30 bg-primary/10">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground tracking-tight">
                Status do Layout Ativo
              </h4>
              <p className="text-xs text-foreground mt-0.5">
                Layout detectado dinamicamente para a tela atual:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isMobile ? "success" : "neutral"} className="py-1 px-3">
              <Smartphone className="w-3.5 h-3.5 mr-1" />
              <span>Celular (&lt;768px): {isMobile ? "Ativo (BottomNav)" : "Inativo"}</span>
            </Badge>

            <Badge variant={isTablet ? "success" : "neutral"} className="py-1 px-3">
              <Tablet className="w-3.5 h-3.5 mr-1" />
              <span>Tablet (768-1023px): {isTablet ? "Ativo (Sidebar Recolhida)" : "Inativo"}</span>
            </Badge>

            <Badge variant={isDesktop ? "success" : "neutral"} className="py-1 px-3">
              <Monitor className="w-3.5 h-3.5 mr-1" />
              <span>Desktop (&gt;=1024px): {isDesktop ? "Ativo (Sidebar Fixa)" : "Inativo"}</span>
            </Badge>

            {isStandalone && (
              <Badge variant="info" className="py-1 px-3">
                PWA Standalone Ativo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Command Palette Menu */}
      <CommandMenu
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        groups={[
          {
            category: "Navegação Rápida",
            items: [
              { id: "1", label: "Visão Geral", description: "Ir para o dashboard", href: "/dashboard", icon: <Layers className="w-4 h-4" /> },
              { id: "2", label: "Design System", description: "Ver catálogo de UI", href: "/design-system", icon: <Sparkles className="w-4 h-4" /> },
            ],
          },
          {
            category: "Ações do Sistema",
            items: [
              {
                id: "3",
                label: "Disparar Notificação Sucesso",
                description: "Testar mensagem de Toast",
                icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
                onSelect: () =>
                  toast({
                    title: "Sucesso!",
                    description: "Ação executada com sucesso via Ctrl+K.",
                    variant: "success",
                  }),
              },
            ],
          },
        ]}
      />

      {/* 1. Stat Cards e Valores Padronizados em USD */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">1. Stat Cards (Valores Padronizados em USD)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receitas Mensais"
            value={12450.80}
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            trend={{ value: "+14.2%", isPositive: true }}
            description="vs. mês anterior"
            variant="positive"
          />
          <StatCard
            title="Despesas Mensais"
            value={-3820.50}
            icon={<TrendingDown className="w-5 h-5 text-danger" />}
            trend={{ value: "-5.1%", isNegative: true }}
            description="vs. mês anterior"
            variant="negative"
          />
          <StatCard
            title="Saldo Disponível"
            value={8630.30}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            trend={{ value: "Saldo Positivo", isPositive: true }}
            description="Total acumulado"
            variant="highlight"
          />
          <StatCard
            title="Reserva Neutra"
            value={0}
            icon={<DollarSign className="w-5 h-5 text-muted" />}
            description="Sem variações"
            variant="neutral"
          />
        </div>
      </section>

      <Separator />

      {/* 2. Formulários & Controles de Entrada */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">2. Formulários e Entradas de Dados (Input, Select, Textarea, Checkbox)</h2>
        <Card>
          <CardHeader>
            <CardTitle>Controles de Formulário Acessíveis</CardTitle>
            <CardDescription>Campos estilizados com estados de erro, instrução e desabilitação</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <Input
              label="E-mail de Notificação"
              placeholder="seu.email@exemplo.com"
              startIcon={<Mail className="w-4 h-4" />}
              helperText="Enviaremos confirmações para este endereço."
            />

            <Input
              label="Campo Bloqueado"
              value="Dado Protegido"
              disabled
              startIcon={<Lock className="w-4 h-4" />}
            />

            <Select
              label="Selecione a Conta"
              options={[
                { value: "corrente", label: "Conta Corrente Principal" },
                { value: "poupanca", label: "Poupança Reserva" },
                { value: "investimento", label: "Carteira de Investimentos" },
              ]}
            />

            <Textarea
              label="Descrição Complementar"
              placeholder="Digite detalhes da movimentação..."
            />

            <div className="sm:col-span-2 pt-2">
              <Checkbox
                label="Confirmar Lançamento Recorrente"
                description="Marque para salvar como despesa mensal automática."
                checked={checkboxState}
                onChange={(e) => setCheckboxState(e.target.checked)}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 3. Notificações (Toast), Alerts, Skeletons, EmptyState & Dropdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">3. Notificações (Toast), ConfirmDialog, Alerts & Dropdown</h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted">Dispare notificações com fechamento manual ou temporizador de 4 segundos:</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() =>
                  toast({
                    title: "Operação Concluída",
                    description: "A receita foi salva com sucesso no sistema.",
                    variant: "success",
                  })
                }
              >
                Toast Sucesso
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  toast({
                    title: "Falha de Conexão",
                    description: "Não foi possível sincronizar os dados.",
                    variant: "error",
                  })
                }
              >
                Toast Erro
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    title: "Atenção Necessária",
                    description: "Verifique a fatura do cartão de crédito.",
                    variant: "warning",
                  })
                }
              >
                Toast Aviso
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  toast({
                    title: "Informação do Sistema",
                    description: "O fuso horário atual é America/Denver.",
                    variant: "info",
                  })
                }
              >
                Toast Info
              </Button>

              <Separator orientation="vertical" className="h-8 hidden sm:block" />

              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Abrir ConfirmDialog Destrutivo
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setOverlayLoading(true);
                  setTimeout(() => setOverlayLoading(false), 2000);
                }}
              >
                Testar Loading Overlay (2s)
              </Button>

              <DropdownMenu
                trigger={
                  <Button variant="secondary" size="sm">
                    <span>Menu Dropdown</span>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
                items={[
                  { label: "Editar Lançamento", icon: <Edit className="w-4 h-4" /> },
                  { label: "Duplicar Transação", icon: <Plus className="w-4 h-4" />, separatorAfter: true },
                  { label: "Excluir Registro", icon: <Trash2 className="w-4 h-4" />, danger: true },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal de Confirmação */}
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            toast({
              title: "Item Removido",
              description: "O registro selecionado foi excluído permanentemente.",
              variant: "success",
            });
          }}
          title="Excluir Conta Bancária?"
          description="Você tem certeza que deseja remover a conta Selecionada? Todos os registros associados serão afetados."
          confirmText="Sim, Excluir Conta"
          destructive
        />

        <div className="space-y-3">
          <Alert variant="info" title="Informação">
            As metas familiares do mês de Julho foram atualizadas automaticamente.
          </Alert>
          <Alert variant="success" title="Sucesso">
            Sua conta bancária foi sincronizada com o banco de dados.
          </Alert>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loader</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empty State Component</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="Nenhum cartão cadastrado"
                description="Cadastre seu primeiro cartão de crédito para gerenciar faturas e vencimentos."
                action={
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Cartão</span>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* 4. Tabela de Dados Genérica & Barra de Filtros */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">4. Tabela de Dados (DataTable), Filtros & Ações</h2>
        
        <FilterBar
          searchValue={searchVal}
          onSearchChange={setSearchVal}
          searchPlaceholder="Filtrar lançamentos da tabela..."
          hasActiveFilters={Boolean(searchVal)}
          onClearFilters={() => setSearchVal("")}
          actions={
            <Button size="sm">
              <Plus className="w-4 h-4" />
              <span>Novo Lançamento</span>
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={filteredData}
          keyExtractor={(item) => item.id}
          actions={(item) => (
            <TableActions
              onView={() =>
                toast({ title: "Visualizar", description: item.descricao })
              }
              onEdit={() =>
                toast({ title: "Editar", description: item.descricao })
              }
              onDelete={() => handleDeleteItem(item.id)}
            />
          )}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={4}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </section>

      <Separator />

      {/* 5. Navegação por Abas (Tabs) & Accordion */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">5. Abas (Tabs) & Sanfona (Accordion)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <SectionCard title="Componente de Abas (Tabs)">
            <div className="space-y-4">
              <Tabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={[
                  { id: "visao-geral", label: "Visão Geral", badge: "Live" },
                  { id: "transacoes", label: "Transações", badge: mockData.length },
                  { id: "relatorios", label: "Relatórios" },
                ]}
              />
              <div className="p-4 rounded-xl bg-background/60 border border-border text-sm text-foreground">
                {activeTab === "visao-geral" && "Conteúdo da aba Visão Geral selecionada."}
                {activeTab === "transacoes" && "Exibindo lista de transações recentes do sistema."}
                {activeTab === "relatorios" && "Gráficos e consolidados de despesas por categoria."}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Componente Accordion">
            <Accordion
              allowMultiple
              defaultExpanded={["1"]}
              items={[
                {
                  id: "1",
                  title: "Como funciona a regra RLS de Família?",
                  content:
                    "Cada registro de conta, despesa e receita exige a verificação 'usuario_pertence_familia(familia_id)', garantindo o isolamento multi-tenant.",
                },
                {
                  id: "2",
                  title: "Quais moedas são suportadas?",
                  content:
                    "O padrão visual do UI Kit está configurado para USD (Dólares) com formatação limpa e legível.",
                },
              ]}
            />
          </SectionCard>
        </div>
      </section>

      <Separator />

      {/* 6. Inputs Especiais (Date Picker & Currency Input) & Popover / Tooltip */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">6. Date Picker, Currency Input, Tooltip & Popover</h2>
        <Card>
          <CardContent className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <DatePicker
              label="Data de Vencimento"
              value={selectedDate}
              onChange={setSelectedDate}
              helperText={`Formatado: ${selectedDate}`}
            />

            <CurrencyInput
              label="Valor em USD (Numeric)"
              value={currencyVal}
              onChange={setCurrencyVal}
              helperText={`Valor numérico limpo: ${currencyVal}`}
            />

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-foreground">Tooltip Exemplo</span>
              <Tooltip content="Informações adicionais do balanço" position="top">
                <Button variant="secondary" className="w-full">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span>Passe o Mouse</span>
                </Button>
              </Tooltip>
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-foreground">Popover Exemplo</span>
              <Popover
                trigger={
                  <Button variant="ghost" className="w-full border border-border">
                    <span>Abrir Popover</span>
                  </Button>
                }
                content={
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-foreground">Configurações Rápidas</p>
                    <p className="text-muted">Ative ou desative notificações diretamente por este popover.</p>
                  </div>
                }
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modal Demonstrativo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal Demonstrativo do UI Kit"
        description="Caixa de diálogo com acessibilidade completa, fechamento por tecla Escape e foco delimitado."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          Componente de modal limpo e fluido, ideal para formulários de cadastro de contas, receitas e despesas.
        </p>
      </Modal>
    </AppShell>
  );
}
