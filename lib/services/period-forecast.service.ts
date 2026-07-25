import { PeriodForecastRepository } from "../repositories/period-forecast.repository";
import { PeriodForecastRequest, PeriodForecastResponse, MembroFamilia } from "../schemas";
import { format, endOfMonth, subDays } from "date-fns";
import { AuthRepository } from "../repositories/auth.repository";
import { FamiliaRepository } from "../repositories/familia.repository";
import { ContasRepository } from "../repositories/contas.repository";

export class PeriodForecastService {
  private repo = new PeriodForecastRepository();
  private authRepo = new AuthRepository();
  private familiaRepo = new FamiliaRepository();
  private contasRepo = new ContasRepository();

  async getForecast(request: PeriodForecastRequest): Promise<PeriodForecastResponse> {
    const user = await this.authRepo.getCurrentUser();
    const familia = await this.familiaRepo.getFamiliaDoUsuario(user.id, user.nome);
    const hoje = format(new Date(), "yyyy-MM-dd");
    let dataInicial = hoje;
    let dataFinal = hoje;
    
    let proximoPagamento = null;

    if (request.modo === "proximo_pagamento") {
      const proximo = await this.repo.getProximoPagamento(familia.id, hoje);
      if (proximo) {
        proximoPagamento = proximo;
        dataFinal = format(subDays(new Date(proximo.data), 1), "yyyy-MM-dd");
        // Se a próxima receita for hoje, o dataFinal ficará "ontem". 
        // Nesse caso, o período não tem dias úteis para analisar despesas futuras antes do pagamento, 
        // mas as despesas atrasadas ainda contarão.
      } else {
        // Se não houver, fallback para fim do mês para não quebrar a UI
        dataFinal = format(endOfMonth(new Date()), "yyyy-MM-dd");
      }
    } else if (request.modo === "fim_mes") {
      dataFinal = format(endOfMonth(new Date()), "yyyy-MM-dd");
    } else if (request.modo === "personalizado") {
      dataInicial = request.dataInicial || hoje;
      dataFinal = request.dataFinal || hoje;
      
      // Validação básica
      if (new Date(dataFinal) < new Date(dataInicial)) {
        dataFinal = dataInicial;
      }
    }

    const [contas, despesas, receitas] = await Promise.all([
      this.contasRepo.getContas(familia.id),
      this.repo.getDespesasNoPeriodo(familia.id, dataFinal),
      this.repo.getReceitasNoPeriodo(familia.id, dataInicial, dataFinal)
    ]);
    
    const saldoAtual = contas.filter(c => c.ativa).reduce((acc, c) => acc + Number(c.saldo_atual || 0), 0);

    // O repositório já traz despesas atrasadas e despesas <= dataFinal.
    // Filtrar despesas pendentes cujo vencimento está entre dataInicial e dataFinal, OU que estão atrasadas (< dataInicial).
    // Mas a query já fez lte(dataFinal) e in("pendente", "atrasada").
    // Só precisamos ignorar as despesas que são "pendentes" (não atrasadas) mas com vencimento ANTES da dataInicial?
    // Na verdade, qualquer despesa pendente com vencimento < dataInicial deveria ser considerada atrasada se hoje > vencimento.
    // Se dataInicial é no futuro, uma despesa entre hoje e dataInicial já foi contabilizada?
    // Regra 5: "somar despesas pendentes com vencimento entre a data inicial e a data final; despesas atrasadas que continuam pendentes, mesmo que sejam anteriores à data inicial".
    const despesasValidas = despesas.filter(d => {
      const dataVenc = d.data_vencimento;
      if (!dataVenc) return false;
      const isAtrasada = d.status === "atrasada" || dataVenc < hoje;
      const isInPeriod = dataVenc >= dataInicial && dataVenc <= dataFinal;
      return isAtrasada || isInPeriod;
    });

    const despesasPendentesTotal = despesasValidas.reduce((acc, d) => {
      return acc + Number(d.valor_pago !== null ? d.valor_pago : d.valor_previsto);
    }, 0);

    const receitasValidas = receitas.filter(r => {
      const dataPrev = r.data_prevista;
      if (!dataPrev) return false;
      return dataPrev >= dataInicial && dataPrev <= dataFinal;
    });

    const receitasPrevistasTotal = receitasValidas.reduce((acc, r) => acc + Number(r.valor_previsto), 0);

    const disponivelAtual = saldoAtual - despesasPendentesTotal;
    const saldoPrevisto = saldoAtual + receitasPrevistasTotal - despesasPendentesTotal;

    return {
      modo: request.modo,
      data_inicial: dataInicial,
      data_final: dataFinal,
      saldo_atual_familiar: saldoAtual,
      despesas_pendentes_no_periodo: despesasPendentesTotal,
      receitas_previstas_no_periodo: receitasPrevistasTotal,
      disponivel_com_dinheiro_atual: disponivelAtual,
      saldo_previsto_na_data_final: saldoPrevisto,
      proximo_pagamento: proximoPagamento,
      lancamentos_despesas: despesasValidas,
      lancamentos_receitas: receitasValidas,
    };
  }
}
