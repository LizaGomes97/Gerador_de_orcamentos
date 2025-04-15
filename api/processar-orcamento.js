const { Medicamento, OrcamentoService } = require("../utils/orcamento");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Método não permitido" });
  }

  try {
    const { entrada } = req.body;
    const orcamentoService = new OrcamentoService();

    if (!entrada || typeof entrada !== "string") {
      return res.status(400).json({
        success: false,
        message: "Dados de entrada inválidos!",
      });
    }

    const medicamentos = orcamentoService.processarEntrada(entrada);

    if (!medicamentos || medicamentos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nenhum medicamento encontrado nos dados!",
      });
    }

    const relatorio = orcamentoService.gerarOrcamento(medicamentos);

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
};
