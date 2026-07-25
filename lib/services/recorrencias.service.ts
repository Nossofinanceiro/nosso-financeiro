import { RecorrenciasRepository } from "@/lib/repositories/recorrencias.repository";
import { Recorrencia } from "@/lib/schemas";

export class RecorrenciasService {
  private recorrenciasRepo = new RecorrenciasRepository();

  async listarRecorrencias(familiaId: string): Promise<Recorrencia[]> {
    return this.recorrenciasRepo.getRecorrencias(familiaId);
  }
}
