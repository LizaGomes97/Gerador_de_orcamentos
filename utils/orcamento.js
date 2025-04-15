// utils/orcamento.js

/**
 * Classe que representa um medicamento no sistema
 */
class Medicamento {
  /**
   * Cria uma nova instância de Medicamento
   * @param {string} codigo - Código do medicamento
   * @param {string} nome - Nome do medicamento
   */
  constructor(codigo, nome) {
    this.codigo = codigo;
    this.nome = nome;
    this.quantidade = 0;
    this.preco_cheio = 0.0;
    this.desconto_percentual = 0.0;
    this.preco_desconto = 0.0;
    this.valor_total = 0.0;
    this.desconto_especial = "";
  }

  /**
   * Calcula o valor total do medicamento com base na quantidade e preço
   * @returns {number} Valor total calculado
   */
  calcularValorTotal() {
    return this.preco_desconto * this.quantidade;
  }

  /**
   * Calcula a economia total (diferença entre preço cheio e com desconto)
   * @returns {number} Valor total economizado
   */
  calcularEconomia() {
    return (this.preco_cheio - this.preco_desconto) * this.quantidade;
  }

  /**
   * Converte o medicamento para um objeto simples
   * @returns {Object} Objeto representando o medicamento
   */
  toJSON() {
    return {
      codigo: this.codigo,
      nome: this.nome,
      quantidade: this.quantidade,
      preco_cheio: this.preco_cheio,
      desconto_percentual: this.desconto_percentual,
      preco_desconto: this.preco_desconto,
      valor_total: this.valor_total,
      desconto_especial: this.desconto_especial,
    };
  }
}

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
    console.log("Iniciando processamento da entrada");

    try {
      // Dividir a entrada em linhas
      const linhas = entrada
        .split("\n")
        .map((linha) => linha.trim())
        .filter((linha) => linha);
      console.log(`Total de linhas na entrada: ${linhas.length}`);

      const medicamentos = [];
      let i = 0;

      // Percorrer todas as linhas
      while (i < linhas.length) {
        try {
          // Verificar se a linha atual contém um código de medicamento (começa com número)
          const codigoMatch = linhas[i].match(/^(\d+)\s+(.*?)$/);

          if (codigoMatch) {
            console.log(
              `Encontrado possível medicamento na linha ${i + 1}: ${linhas[i]}`
            );

            const codigo = codigoMatch[1];
            const nome = codigoMatch[2];

            // Verificar se temos linhas suficientes para processar este medicamento
            if (i + 4 < linhas.length) {
              const med = new Medicamento(codigo, nome);

              // Linha seguinte deve ser a quantidade
              i++;
              med.quantidade = parseInt(linhas[i]);

              // Próxima linha deve conter o preço e desconto
              i++;
              const precosTexto = linhas[i];
              const precos = precosTexto
                .split(/\s+/)
                .filter((p) => p.length > 0);

              if (precos.length >= 2) {
                med.preco_cheio = parseFloat(precos[0].replace(",", "."));
                med.desconto_percentual = parseFloat(
                  precos[1].replace(",", ".")
                );
              }

              // Próxima linha deve ser o preço com desconto
              i++;
              med.preco_desconto = parseFloat(linhas[i].replace(",", "."));

              // Próxima linha deve ser o valor total e possível desconto especial
              i++;
              const valorLinha = linhas[i];
              const valorPartes = valorLinha
                .split(/\s+/)
                .filter((p) => p.length > 0);

              med.valor_total = parseFloat(valorPartes[0].replace(",", "."));

              // Se houver mais partes após o valor, é desconto especial
              if (valorPartes.length > 1) {
                med.desconto_especial = valorPartes.slice(1).join(" ");
              }

              // Adicionar o medicamento processado à lista
              medicamentos.push(med);
              console.log(`Medicamento processado: ${codigo} - ${nome}`);
            }
          }
        } catch (e) {
          console.error(`Erro ao processar linha ${i + 1}:`, e);
        }

        // Avançar para a próxima linha
        i++;
      }

      console.log(`Total de medicamentos processados: ${medicamentos.length}`);
      return medicamentos;
    } catch (e) {
      console.error("Erro geral no processamento:", e);
      return [];
    }
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

      const economia = (med.preco_cheio - med.preco_desconto) * med.quantidade;
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

module.exports = { Medicamento, OrcamentoService };
