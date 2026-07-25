import { CartoesRepository } from "@/lib/repositories/cartoes.repository";
import { CartaoCredito } from "@/lib/schemas";

export class CartoesService {
  private cartoesRepo = new CartoesRepository();

  async listarCartoes(familiaId: string): Promise<CartaoCredito[]> {
    return this.cartoesRepo.getCartoes(familiaId);
  }
}
