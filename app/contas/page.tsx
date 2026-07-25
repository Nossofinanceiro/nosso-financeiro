"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageLoading } from "@/components/ui/page-loading";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Wallet, RotateCcw } from "lucide-react";
import { useContas, useDeleteConta } from "@/hooks/use-contas";
import { ContaCard } from "./components/conta-card";
import { ContaModal } from "./components/conta-modal";
import { TransferModal } from "./components/transfer-modal";
import { Conta } from "@/lib/schemas";

export default function ContasPage() {
  const { data: contas, isLoading, isError, error, refetch } = useContas();
  const { mutateAsync: deleteConta } = useDeleteConta();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [contaToEdit, setContaToEdit] = React.useState<Conta | null>(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [contaToDelete, setContaToDelete] = React.useState<Conta | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);

  const handleCreate = () => {
    setContaToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (conta: Conta) => {
    setContaToEdit(conta);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (conta: Conta) => {
    setContaToDelete(conta);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (contaToDelete) {
      await deleteConta(contaToDelete.id);
    }
  };



  return (
    <AppShell title="Contas">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Contas</h2>
          <p className="text-sm text-muted">Gerencie suas contas bancárias e carteiras</p>
        </div>
        <div className="hidden sm:flex gap-3">
          <Button variant="secondary" onClick={() => setIsTransferModalOpen(true)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Transferir
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:hidden w-full">
          <Button variant="secondary" onClick={() => setIsTransferModalOpen(true)} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Transferir
          </Button>
          <Button variant="primary" onClick={handleCreate} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      {isLoading ? (
        <PageLoading />
      ) : isError ? (
        <div className="space-y-4 max-w-xl mx-auto py-12 text-center">
          <Alert variant="danger" title="Erro ao carregar contas">
            {error instanceof Error ? error.message : "Não foi possível carregar as contas."}
          </Alert>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => refetch()} variant="secondary">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      ) : !contas || contas.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-12 h-12 text-muted" />}
          title="Nenhuma conta cadastrada"
          description="Todas as suas contas aparecerão aqui."
          action={
            <Button onClick={handleCreate} variant="primary">Criar primeira conta</Button>
          }
        />
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200 pb-20 sm:pb-0">
          <div className="grid grid-cols-1 gap-4">
            {contas.map((conta, index) => (
              <div key={conta.id} style={{ zIndex: contas.length - index }} className="relative">
                <ContaCard
                  conta={conta}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB (Floating Action Button) para Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="md"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          onClick={handleCreate}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <ContaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setContaToEdit(null);
        }}
        contaToEdit={contaToEdit}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setContaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir conta?"
        description={`Tem certeza que deseja excluir a conta "${contaToDelete?.nome}"? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir Conta"
        destructive={true}
      />

      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </AppShell>
  );
}
