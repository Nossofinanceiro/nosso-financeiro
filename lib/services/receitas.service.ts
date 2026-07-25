import { ReceitasRepository } from "../repositories/receitas.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { FamiliaRepository } from "../repositories/familia.repository";
import { Receita } from "../schemas";

export class ReceitasService {
  private receitasRepo = new ReceitasRepository();
  private authRepo = new AuthRepository();
  private familiaRepo = new FamiliaRepository();

  async getFamiliaId(): Promise<string> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id);
    if (!familia || !familia.id) throw new Error("Usuário não pertence a nenhuma família");

    return familia.id;
  }

  async listarReceitas(mesReferencia?: string): Promise<Receita[]> {
    const familiaId = await this.getFamiliaId();
    return this.receitasRepo.findAll(familiaId, mesReferencia);
  }

  async criarReceita(data: Partial<Receita>): Promise<Receita> {
    const familiaId = await this.getFamiliaId();
    return this.receitasRepo.create(familiaId, data);
  }

  async atualizarReceita(id: string, data: Partial<Receita>): Promise<Receita> {
    const familiaId = await this.getFamiliaId();
    return this.receitasRepo.update(id, familiaId, data);
  }
}
