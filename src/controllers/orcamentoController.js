// src/controllers/orcamentoController.js

const OrcamentoService = require("../services/orcamentoService");

// Instanciando o serviço
const orcamentoService = new OrcamentoService();

/**
 * Controlador para as operações relacionadas a orçamentos
 */
const OrcamentoController = {
  /**
   * Processa os dados do orçamento e retorna o relatório
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  processarOrcamento: (req, res) => {
    try {
      const { entrada } = req.body;

      if (!entrada || typeof entrada !== "string") {
        return res.status(400).json({
          success: false,
          message: "Dados de entrada inválidos!",
        });
      }

      // Processando os dados com o serviço
      const medicamentos = orcamentoService.processarEntrada(entrada);

      if (!medicamentos || medicamentos.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nenhum medicamento encontrado nos dados!",
        });
      }

      // Gerando o relatório
      const relatorio = orcamentoService.gerarOrcamento(medicamentos);

      // Retornando o resultado
      return res.json({
        success: true,
        relatorio,
        medicamentos: medicamentos.map((med) => med.toJSON()),
      });
    } catch (error) {
      console.error("Erro ao processar orçamento:", error);
      return res.status(500).json({
        success: false,
        message: `Erro ao processar orçamento: ${error.message}`,
      });
    }
  },

  /**
   * Gera os códigos internos dos medicamentos a partir dos dados
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  gerarCodigoInterno: (req, res) => {
    try {
      const { entrada } = req.body;

      if (!entrada || typeof entrada !== "string") {
        return res.status(400).json({
          success: false,
          message: "Dados de entrada inválidos!",
        });
      }

      // Processando os dados com o serviço
      const medicamentos = orcamentoService.processarEntrada(entrada);

      if (!medicamentos || medicamentos.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nenhum medicamento encontrado nos dados!",
        });
      }

      // Gerando a string de códigos
      const codigos = orcamentoService.gerarCodigoInterno(medicamentos);

      // Retornando o resultado
      return res.json({
        success: true,
        codigos,
        quantidade: medicamentos.length,
      });
    } catch (error) {
      console.error("Erro ao gerar código interno:", error);
      return res.status(500).json({
        success: false,
        message: `Erro ao gerar código interno: ${error.message}`,
      });
    }
  },
};

module.exports = OrcamentoController;
