// src/services/orcamentoService.js

const Medicamento = require("../models/medicamentoModel");

/**
 * Classe que implementa o serviço de processamento de orçamentos
 */
class OrcamentoService {
  /**
   * Processa o texto de entrada e extrai os medicamentos
   * @param {string} entrada - Texto com os dados dos medicamentos
   * @returns {Array<Medicamento>} Lista de medicamentos extraídos
   */
  processarEntrada(entrada) {
    // Dividindo o texto em blocos (separados por linhas em branco)
    const blocos = entrada.split(/\n\s*\n/);
    const medicamentos = [];

    for (const bloco of blocos) {
      if (!bloco.trim()) continue;

      // Dividindo cada bloco em linhas
      const linhas = bloco
        .split("\n")
        .map((linha) => linha.trim())
        .filter((linha) => linha);

      if (linhas.length >= 5) {
        try {
          // Processando a primeira linha para obter código e nome
          const primeiraLinha = linhas[0].split(/\s+(.+)/);
          if (primeiraLinha.length < 2) continue;

          const codigo = primeiraLinha[0].trim();
          const nome = primeiraLinha[1].trim();

          const med = new Medicamento(codigo, nome);
          med.quantidade = parseInt(linhas[1]);

          // Processando preços
          const precos = linhas[2].split(/\s+/);
          med.preco_cheio = parseFloat(precos[0].replace(",", "."));
          med.desconto_percentual = parseFloat(precos[1].replace(",", "."));

          med.preco_desconto = parseFloat(linhas[3].replace(",", "."));

          // Processando valor total e possível desconto especial
          const valorParts = linhas[4].split(/\s+/);
          med.valor_total = parseFloat(valorParts[0].replace(",", "."));

          if (valorParts.length > 1) {
            med.desconto_especial = valorParts.slice(1).join(" ");
          }

          medicamentos.push(med);
        } catch (e) {
          console.error("Erro ao processar bloco:", e);
          continue;
        }
      }
    }

    return medicamentos;
  }

  /**
   * Gera um relatório de orçamento formatado
   * @param {Array<Medicamento>} medicamentos - Lista de medicamentos
   * @returns {string} Texto formatado do orçamento
   */
  gerarOrcamento(medicamentos) {
    let relatorio = "ORÇAMENTO DE MEDICAMENTOS\n";
    relatorio += "=".repeat(60) + "\n\n";

    let valor_total_orcamento = 0.0;
    let economia_total = 0.0;

    for (const med of medicamentos) {
      relatorio += `Código: ${med.codigo}\n`;
      relatorio += `Medicamento: ${med.nome}\n`;
      relatorio += `Quantidade: ${med.quantidade}\n`;

      if (med.desconto_especial) {
        relatorio += `Desconto especial: ${med.desconto_especial}\n`;
      }

      relatorio += `Preço Unitário: R$ ${med.preco_cheio.toFixed(2)}\n`;

      if (med.desconto_percentual > 0) {
        relatorio += `Preço com Desconto: R$ ${med.preco_desconto.toFixed(
          2
        )}\n`;
      }

      relatorio += `Valor Total: R$ ${med.valor_total.toFixed(2)}\n`;
      relatorio += "-".repeat(60) + "\n";

      const economia = med.calcularEconomia();
      economia_total += economia;
      valor_total_orcamento += med.valor_total;
    }

    relatorio += "\nRESUMO DO ORÇAMENTO\n";
    relatorio += `Quantidade de Itens: ${medicamentos.length}\n`;
    relatorio += `Valor Total: R$ ${valor_total_orcamento.toFixed(2)}\n`;
    relatorio += `Economia Total: R$ ${economia_total.toFixed(2)}\n`;

    return relatorio;
  }

  /**
   * Extrai os códigos dos medicamentos e retorna como string
   * @param {Array<Medicamento>} medicamentos - Lista de medicamentos
   * @returns {string} Códigos dos medicamentos separados por espaço
   */
  gerarCodigoInterno(medicamentos) {
    return medicamentos.map((med) => med.codigo).join(" ");
  }
}

module.exports = OrcamentoService;
