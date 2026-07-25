import { OrcamentosRepository } from "@/lib/repositories/orcamentos.repository";
import { Orcamento } from "@/lib/schemas";

export class OrcamentosService {
  private orcamentosRepo = new OrcamentosRepository();

  async listarOrcamentosPorMes(familiaId: string, mesReferencia: string): Promise<Orcamento[]> {
    return this.orcamentosRepo.getOrcamentosPorMes(familiaId, mesReferencia);
  }
}
