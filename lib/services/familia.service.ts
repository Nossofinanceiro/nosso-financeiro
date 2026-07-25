import { FamiliaRepository } from "@/lib/repositories/familia.repository";
import { Familia } from "@/lib/schemas";

export class FamiliaService {
  private familiaRepo = new FamiliaRepository();

  async getFamiliaAtual(usuarioId: string): Promise<Familia> {
    return this.familiaRepo.getFamiliaDoUsuario(usuarioId);
  }
}
