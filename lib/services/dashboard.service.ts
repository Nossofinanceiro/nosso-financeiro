import { AuthRepository } from "@/lib/repositories/auth.repository";
import { FamiliaRepository } from "@/lib/repositories/familia.repository";
import { DashboardRepository } from "@/lib/repositories/dashboard.repository";
import { ContasRepository } from "@/lib/repositories/contas.repository";
import { DashboardData } from "@/lib/schemas";

export class DashboardService {
  private authRepo = new AuthRepository();
  private familiaRepo = new FamiliaRepository();
  private dashboardRepo = new DashboardRepository();
  private contasRepo = new ContasRepository();

  async getDashboardConsolidado(mesReferencia?: string): Promise<DashboardData> {
    const user = await this.authRepo.getCurrentUser();
    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id, user.nome);

    const mes = mesReferencia || new Date().toISOString().slice(0, 7);

    const [resumo, proximasDespesas, proximasReceitas, contas, proximoPagamentoDate, valorDisponivel, receitasPendentesAteMes, despesasPendentesAteMes] = await Promise.all([
      this.dashboardRepo.getResumoMensal(familia.id, mes),
      this.dashboardRepo.getProximasDespesas(familia.id, 5),
      this.dashboardRepo.getProximasReceitas(familia.id, 5),
      this.contasRepo.getContas(familia.id),
      this.dashboardRepo.getProximoPagamentoDate(familia.id).catch(() => null),
      this.dashboardRepo.getValorDisponivelAteProximoPagamento(familia.id).catch(() => 0),
      this.dashboardRepo.getTotalReceitasPendentesAteMes(familia.id, mes),
      this.dashboardRepo.getTotalDespesasPendentesAteMes(familia.id, mes),
    ]);

    console.log("DEBUG: contas =", contas);
    console.log("DEBUG: receitasPendentesAteMes =", receitasPendentesAteMes);
    console.log("DEBUG: despesasPendentesAteMes =", despesasPendentesAteMes);

    const saldoAtual = contas
      .filter((c) => c.ativa)
      .reduce((acc, conta) => acc + Number(conta.saldo_atual || 0), 0);

    const proximaDespesa = proximasDespesas[0];
    const proximoPagamento = proximaDespesa
      ? {
          descricao: proximaDespesa.descricao,
          valor: proximaDespesa.valor_previsto,
          data: proximaDespesa.data_vencimento || proximoPagamentoDate || mes,
        }
      : proximoPagamentoDate
      ? {
          descricao: "Próximo Pagamento Familiar",
          valor: 0,
          data: proximoPagamentoDate,
        }
      : null;

    const disponivelAteProximo = valorDisponivel !== 0 ? valorDisponivel : saldoAtual;
    const despesasPendentes = resumo?.despesas_pendentes || 0;
    // Saldo previsto is calculated using all pending transactions up to the selected month
    const saldoPrevisto = saldoAtual + receitasPendentesAteMes - despesasPendentesAteMes;

    return {
      usuario: user,
      familia,
      mes_referencia: mes,
      saldo_atual: saldoAtual,
      receitas_previstas: resumo?.total_receitas_previstas || 0,
      receitas_recebidas: resumo?.total_receitas_recebidas || 0,
      receitas_pendentes: receitasPendentesAteMes,
      despesas_previstas: resumo?.total_despesas_previstas || 0,
      despesas_pagas: resumo?.total_despesas_pagas || 0,
      despesas_pendentes: despesasPendentesAteMes,
      saldo_previsto: saldoPrevisto,
      disponivel_ate_proximo_pagamento: disponivelAteProximo,
      proximo_pagamento: proximoPagamento,
      proximas_despesas: proximasDespesas,
      proximas_receitas: proximasReceitas,
      contas,
      despesas_por_categoria: [],
    };
  }
}
