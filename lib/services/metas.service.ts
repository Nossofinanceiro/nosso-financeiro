import { MetasRepository } from "@/lib/repositories/metas.repository";
import { Meta } from "@/lib/schemas";

export class MetasService {
  private metasRepo = new MetasRepository();

  async listarMetas(familiaId: string): Promise<Meta[]> {
    return this.metasRepo.getMetas(familiaId);
  }
}
