const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/api" : "";

// server.js - versão corrigida com lógica original
const cors = require("cors");
app.use(cors());
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// Inicialização do app Express
const app = express();
const port = process.env.PORT || 3000;

// Configuração de middlewares
app.use(bodyParser.json({ limit: "5mb" })); // Aumentando o limite para payloads grandes
app.use(express.static(path.join(__dirname, "public")));

// =============== MODELO DE MEDICAMENTO ===============
class Medicamento {
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

  calcularValorTotal() {
    return this.preco_desconto * this.quantidade;
  }

  calcularEconomia() {
    return (this.preco_cheio - this.preco_desconto) * this.quantidade;
  }

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

// =============== SERVIÇO DE ORÇAMENTO ===============
class OrcamentoService {
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
        // relatorio += `Desconto: ${med.desconto_percentual.toFixed(1)}%\n`;
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

  gerarCodigoInterno(medicamentos) {
    return medicamentos.map((med) => med.codigo).join(" ");
  }
}

// Instanciando o serviço
const orcamentoService = new OrcamentoService();

// =============== ROTAS DA API ===============
// Rota para processar orçamento
app.post(`${basePath}/processar-orcamento`, (req, res) => {
  try {
    const { entrada } = req.body;
    console.log("Recebida requisição para processar orçamento");

    if (!entrada || typeof entrada !== "string") {
      console.log("Dados de entrada inválidos");
      return res.status(400).json({
        success: false,
        message: "Dados de entrada inválidos!",
      });
    }

    console.log("Iniciando processamento dos medicamentos");
    const medicamentos = orcamentoService.processarEntrada(entrada);

    if (!medicamentos || medicamentos.length === 0) {
      console.log("Nenhum medicamento encontrado nos dados");
      return res.status(400).json({
        success: false,
        message: "Nenhum medicamento encontrado nos dados!",
      });
    }

    console.log(`Gerando relatório para ${medicamentos.length} medicamentos`);
    const relatorio = orcamentoService.gerarOrcamento(medicamentos);

    console.log("Relatório gerado com sucesso");
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
});

// Rota para gerar código interno
app.post(`${basePath}/gerar-codigo`, (req, res) => {
  try {
    const { entrada } = req.body;
    console.log("Recebida requisição para gerar código interno");

    if (!entrada || typeof entrada !== "string") {
      console.log("Dados de entrada inválidos");
      return res.status(400).json({
        success: false,
        message: "Dados de entrada inválidos!",
      });
    }

    console.log("Iniciando processamento dos medicamentos");
    const medicamentos = orcamentoService.processarEntrada(entrada);

    if (!medicamentos || medicamentos.length === 0) {
      console.log("Nenhum medicamento encontrado nos dados");
      return res.status(400).json({
        success: false,
        message: "Nenhum medicamento encontrado nos dados!",
      });
    }

    console.log("Gerando códigos internos");
    const codigos = orcamentoService.gerarCodigoInterno(medicamentos);

    console.log("Códigos gerados com sucesso");
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
});

// Rota para servir a página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/api/teste", (req, res) => {
  res.json({ status: "ok", message: "API funcionando!" });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro na aplicação:", err.stack);
  res.status(500).json({
    success: false,
    message: "Erro interno no servidor",
  });
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
