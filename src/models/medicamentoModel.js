// src/models/medicamentoModel.js

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

module.exports = Medicamento;
