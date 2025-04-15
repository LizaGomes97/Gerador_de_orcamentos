// server.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// Importando controladores
const orcamentoController = require("./src/controllers/orcamentoController");

// Inicialização do app Express
const app = express();
const port = process.env.PORT || 3000;

// Configuração de middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Rotas da API
app.post("/api/processar-orcamento", orcamentoController.processarOrcamento);
app.post("/api/gerar-codigo", orcamentoController.gerarCodigoInterno);

// Rota para servir a página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
