import { DespesasRepository } from "../repositories/despesas.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { FamiliaRepository } from "../repositories/familia.repository";
import { Despesa } from "../schemas";

export class DespesasService {
  private despesasRepo = new DespesasRepository();
  private authRepo = new AuthRepository();
  private familiaRepo = new FamiliaRepository();

  async getFamiliaId(): Promise<string> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id);
    if (!familia || !familia.id) throw new Error("Usuário não pertence a nenhuma família");

    return familia.id;
  }

  async listarDespesas(mesReferencia?: string): Promise<Despesa[]> {
    const familiaId = await this.getFamiliaId();
    const mes = mesReferencia || new Date().toISOString().slice(0, 7); // YYYY-MM
    return this.despesasRepo.getDespesasByMes(familiaId, mes);
  }

  async criarDespesa(despesa: Partial<Despesa>): Promise<Despesa> {
    const familiaId = await this.getFamiliaId();
    return this.despesasRepo.createDespesa({ ...despesa, familia_id: familiaId });
  }

  async atualizarDespesa(id: string, updates: Partial<Despesa>): Promise<Despesa> {
    const familiaId = await this.getFamiliaId();
    
    // Validate ownership
    const despesa = await this.despesasRepo.getDespesaById(id);
    if (!despesa || despesa.familia_id !== familiaId) {
      throw new Error("Despesa não encontrada ou não pertence a esta família");
    }

    return this.despesasRepo.updateDespesa(id, updates);
  }

  async marcarComoPaga(id: string, dataPagamento: string, valorPago: number, contaId: string): Promise<Despesa> {
    return this.atualizarDespesa(id, {
      status: "paga",
      data_pagamento: dataPagamento,
      valor_pago: valorPago,
      conta_id: contaId
    });
  }

  async cancelarDespesa(id: string): Promise<Despesa> {
    return this.atualizarDespesa(id, { status: "cancelada" });
  }
}
