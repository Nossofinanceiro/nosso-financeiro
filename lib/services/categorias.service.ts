import { CategoriasRepository } from "@/lib/repositories/categorias.repository";
import { AuthRepository } from "@/lib/repositories/auth.repository";
import { FamiliaRepository } from "@/lib/repositories/familia.repository";
import { Categoria } from "@/lib/schemas";

export class CategoriasService {
  private categoriasRepo = new CategoriasRepository();
  private authRepo = new AuthRepository();
  private familiaRepo = new FamiliaRepository();

  private async getFamiliaId(): Promise<string> {
    const user = await this.authRepo.getCurrentUser();
    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id, user.nome);
    return familia.id;
  }

  async listarCategorias(familiaId?: string): Promise<Categoria[]> {
    const id = familiaId || (await this.getFamiliaId());
    return this.categoriasRepo.getCategorias(id);
  }

  async criarCategoria(data: Omit<Categoria, "id" | "familia_id" | "criado_em" | "categoria_sistema">): Promise<Categoria> {
    const familiaId = await this.getFamiliaId();
    return this.categoriasRepo.createCategoria(familiaId, data);
  }

  async atualizarCategoria(
    categoriaId: string,
    data: Partial<Omit<Categoria, "id" | "familia_id" | "criado_em" | "categoria_sistema">>
  ): Promise<Categoria> {
    const familiaId = await this.getFamiliaId();
    return this.categoriasRepo.updateCategoria(familiaId, categoriaId, data);
  }
}
