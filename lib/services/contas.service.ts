import { ContasRepository } from "@/lib/repositories/contas.repository";
import { AuthRepository } from "@/lib/repositories/auth.repository";
import { FamiliaRepository } from "@/lib/repositories/familia.repository";
import { Conta } from "@/lib/schemas";

export class ContasService {
  private contasRepo = new ContasRepository();
  private authRepo = new AuthRepository();
  private familiaRepo = new FamiliaRepository();

  private async getFamiliaId(): Promise<string> {
    const user = await this.authRepo.getCurrentUser();
    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id, user.nome);
    return familia.id;
  }

  async listarContas(): Promise<Conta[]> {
    const familiaId = await this.getFamiliaId();
    return this.contasRepo.getContas(familiaId);
  }

  async obterSaldoTotal(): Promise<number> {
    const familiaId = await this.getFamiliaId();
    const contas = await this.contasRepo.getContas(familiaId);
    return contas.reduce(
      (acc, c) => acc + (c.saldo_atual !== undefined ? c.saldo_atual : c.saldo_inicial),
      0
    );
  }

  async criarConta(data: Omit<Conta, "id" | "familia_id" | "criado_em" | "atualizado_em" | "saldo_atual">): Promise<Conta> {
    const familiaId = await this.getFamiliaId();
    return this.contasRepo.createConta(familiaId, data);
  }

  async atualizarConta(contaId: string, data: Partial<Omit<Conta, "id" | "familia_id" | "criado_em" | "atualizado_em" | "saldo_atual">>): Promise<Conta> {
    const familiaId = await this.getFamiliaId();
    return this.contasRepo.updateConta(familiaId, contaId, data);
  }

  async excluirConta(contaId: string): Promise<void> {
    const familiaId = await this.getFamiliaId();
    return this.contasRepo.deleteConta(familiaId, contaId);
  }
}
