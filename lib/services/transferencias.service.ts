import { TransferenciasRepository } from "../repositories/transferencias.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { FamiliaRepository } from "../repositories/familia.repository";
import { Transferencia } from "../schemas";

export class TransferenciasService {
  private repo = new TransferenciasRepository();
  private authRepo = new AuthRepository();
  private familiaRepo = new FamiliaRepository();

  async listarTransferencias(): Promise<Transferencia[]> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id);
    if (!familia) throw new Error("Família não encontrada");

    return this.repo.getTransferencias(familia.id);
  }

  async criarTransferencia(transferencia: Omit<Transferencia, "id" | "familia_id" | "criado_em">): Promise<Transferencia> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id);
    if (!familia) throw new Error("Família não encontrada");

    if (transferencia.conta_origem_id === transferencia.conta_destino_id) {
      throw new Error("A conta de origem e destino não podem ser iguais");
    }

    if (transferencia.valor <= 0) {
      throw new Error("O valor da transferência deve ser maior que zero");
    }

    const payload = {
      ...transferencia,
      familia_id: familia.id,
    };

    return this.repo.createTransferencia(payload);
  }

  async atualizarTransferencia(id: string, updates: Partial<Omit<Transferencia, "id" | "familia_id" | "criado_em">>): Promise<Transferencia> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id);
    if (!familia) throw new Error("Família não encontrada");

    const transferencia = await this.repo.getTransferenciaById(id);
    if (!transferencia || transferencia.familia_id !== familia.id) {
      throw new Error("Transferência não encontrada ou não pertence a esta família");
    }

    if (updates.conta_origem_id || updates.conta_destino_id) {
      const novaOrigem = updates.conta_origem_id || transferencia.conta_origem_id;
      const novoDestino = updates.conta_destino_id || transferencia.conta_destino_id;
      if (novaOrigem === novoDestino) {
        throw new Error("A conta de origem e destino não podem ser iguais");
      }
    }

    if (updates.valor !== undefined && updates.valor <= 0) {
      throw new Error("O valor da transferência deve ser maior que zero");
    }

    return this.repo.updateTransferencia(id, updates);
  }

  async excluirTransferencia(id: string): Promise<void> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id);
    if (!familia) throw new Error("Família não encontrada");

    const transferencia = await this.repo.getTransferenciaById(id);
    if (!transferencia || transferencia.familia_id !== familia.id) {
      throw new Error("Transferência não encontrada ou não pertence a esta família");
    }

    await this.repo.deleteTransferencia(id);
  }
}
