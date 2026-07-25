import { AuthRepository } from "@/lib/repositories/auth.repository";

export class AuthService {
  private authRepo = new AuthRepository();

  async getCurrentUser() {
    return this.authRepo.getCurrentUser();
  }

  async getSession() {
    return this.authRepo.getSession();
  }
}
