const API_BASE = window.location.origin;
// Classe para a aplicação de orçamento
class OrcamentoApp {
  constructor() {
    // Inicialização de elementos DOM
    this.entradaText = document.getElementById("entrada");
    this.resultadoText = document.getElementById("resultado");
    this.btnLimpar = document.getElementById("btn-limpar");
    this.btnProcessar = document.getElementById("btn-processar");
    this.btnCopiar = document.getElementById("btn-copiar");
    this.btnCodigo = document.getElementById("btn-codigo");
    this.btnImprimir = document.getElementById("btn-imprimir");
    this.emptyResults = document.getElementById("empty-results");
    this.printTemplate = document.getElementById("print-template");

    // Configuração de event listeners
    this.configurarEventos();
    this.atualizarEstadoResultado();
  }

  configurarEventos() {
    this.btnLimpar.addEventListener("click", () => this.limparTudo());
    this.btnProcessar.addEventListener("click", () =>
      this.processarOrcamento()
    );
    this.btnCopiar.addEventListener("click", () => this.copiarOrcamento());
    this.btnCodigo.addEventListener("click", () => this.gerarCodigoInterno());
    this.btnImprimir.addEventListener("click", () => this.imprimirOrcamento());

    // Atualizar estado quando resultado mudar
    this.resultadoText.addEventListener("input", () =>
      this.atualizarEstadoResultado()
    );
  }

  atualizarEstadoResultado() {
    if (this.resultadoText.value.trim() === "") {
      this.emptyResults.style.display = "block";
      this.resultadoText.style.display = "none";
      this.btnImprimir.disabled = true;
      this.btnImprimir.classList.add("disabled");
    } else {
      this.emptyResults.style.display = "none";
      this.resultadoText.style.display = "block";
      this.btnImprimir.disabled = false;
      this.btnImprimir.classList.remove("disabled");
    }
  }

  mostrarMensagem(tipo, titulo, mensagem) {
    // Criando o elemento de diálogo
    const dialog = document.createElement("div");
    dialog.className = `dialog ${tipo}`;

    // Ícone adequado para o tipo de mensagem
    let icone = "";
    if (tipo === "info") icone = '<i class="fas fa-check-circle"></i>';
    else if (tipo === "warning")
      icone = '<i class="fas fa-exclamation-triangle"></i>';
    else if (tipo === "error") icone = '<i class="fas fa-times-circle"></i>';

    dialog.innerHTML = `${icone} <span style="margin-left: 10px">${titulo}: ${mensagem}</span>`;

    // Adicionando à página
    document.body.appendChild(dialog);

    // Removendo após a animação
    setTimeout(() => {
      document.body.removeChild(dialog);
    }, 5000);
  }

  limparTudo() {
    this.entradaText.value = "";
    this.resultadoText.value = "";
    this.atualizarEstadoResultado();
  }

  copiarOrcamento() {
    const conteudo = this.resultadoText.value.trim();

    if (!conteudo) {
      this.mostrarMensagem("warning", "Aviso", "Não há orçamento para copiar!");
      return;
    }

    // Copiando para a área de transferência
    navigator.clipboard
      .writeText(conteudo)
      .then(() => {
        this.mostrarMensagem(
          "info",
          "Sucesso",
          "Orçamento copiado para a área de transferência!"
        );
      })
      .catch((err) => {
        this.mostrarMensagem("error", "Erro", "Falha ao copiar: " + err);
      });
  }

  imprimirOrcamento() {
    const conteudo = this.resultadoText.value.trim();

    if (!conteudo) {
      this.mostrarMensagem(
        "warning",
        "Aviso",
        "Não há orçamento para imprimir!"
      );
      return;
    }

    // Preparando o conteúdo formatado para impressão
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR");

    // Criar o template de impressão
    this.printTemplate.innerHTML = `
          <div class="print-content">
              <div class="print-header">
                  <h1>DROGASIL - ORÇAMENTO DE MEDICAMENTOS</h1>
                  <p>Data: ${dataAtual} - Hora: ${horaAtual}</p>
              </div>
              
              <div class="print-body">
                  ${this.formatarParaImpressao(conteudo)}
              </div>
              
              <div class="print-footer">
                  <p>Drogasil - Processador de Orçamentos v1.0</p>
                  <p>Este documento é apenas um orçamento e não representa um comprovante de compra.</p>
              </div>
          </div>
      `;

    // Salvar o conteúdo original da página
    const originalContent = document.body.innerHTML;

    // Substituir pelo template de impressão
    document.body.innerHTML = this.printTemplate.innerHTML;

    // Disparar a impressão
    window.print();

    // Restaurar o conteúdo original
    document.body.innerHTML = originalContent;

    // Reinicializar as referências e event listeners
    this.constructor();
  }

  formatarParaImpressao(texto) {
    // Adiciona formatação HTML ao texto do orçamento
    // Substitui as linhas de separação por elementos HTML
    let formatado = texto
      .replace(/^(.+)$/gm, "<div>$1</div>")
      .replace(/={60}/g, '<hr style="border-top: 2px solid #000;">')
      .replace(/-{60}/g, '<hr style="border-top: 1px dashed #999;">');

    return formatado;
  }

  async gerarCodigoInterno() {
    // Mostrar algum indicador de carregamento
    this.btnCodigo.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i>&nbsp; Processando...';
    this.btnCodigo.disabled = true;

    this.resultadoText.value = "";
    const entrada = this.entradaText.value.trim();

    if (!entrada) {
      this.mostrarMensagem(
        "warning",
        "Aviso",
        "Por favor, cole os dados do carrinho!"
      );
      this.btnCodigo.innerHTML =
        '<i class="fas fa-barcode"></i>&nbsp; Gerar Código Interno';
      this.btnCodigo.disabled = false;
      return;
    }

    try {
      // Enviando dados para o backend
      const response = await fetch("/api/gerar-codigo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entrada }),
      });

      const data = await response.json();

      if (data.success) {
        this.resultadoText.value = data.codigos;
        this.atualizarEstadoResultado();
        this.mostrarMensagem(
          "info",
          "Sucesso",
          `Códigos gerados para ${data.quantidade} medicamento(s)!`
        );
      } else {
        this.mostrarMensagem("error", "Erro", data.message);
      }
    } catch (e) {
      console.error("Erro na requisição:", e);
      this.mostrarMensagem(
        "error",
        "Erro",
        `Erro ao se comunicar com o servidor: ${e.message}`
      );
    } finally {
      // Restaurar o botão
      this.btnCodigo.innerHTML =
        '<i class="fas fa-barcode"></i>&nbsp; Gerar Código Interno';
      this.btnCodigo.disabled = false;
    }
  }

  async processarOrcamento() {
    // Mostrar algum indicador de carregamento
    this.btnProcessar.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i>&nbsp; Processando...';
    this.btnProcessar.disabled = true;

    this.resultadoText.value = "";
    const entrada = this.entradaText.value.trim();

    if (!entrada) {
      this.mostrarMensagem(
        "warning",
        "Aviso",
        "Por favor, cole os dados do carrinho!"
      );
      this.btnProcessar.innerHTML =
        '<i class="fas fa-cogs"></i>&nbsp; Processar Orçamento';
      this.btnProcessar.disabled = false;
      return;
    }

    try {
      // Enviando dados para o backend
      const response = await fetch(`${API_BASE}/api/processar-orcamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entrada }),
      });

      const data = await response.json();

      if (data.success) {
        this.resultadoText.value = data.relatorio;
        this.atualizarEstadoResultado();
        this.mostrarMensagem(
          "info",
          "Sucesso",
          "Orçamento processado com sucesso!"
        );
      } else {
        this.mostrarMensagem("error", "Erro", data.message);
      }
    } catch (e) {
      console.error("Erro na requisição:", e);
      this.mostrarMensagem(
        "error",
        "Erro",
        `Erro ao se comunicar com o servidor: ${e.message}`
      );
    } finally {
      // Restaurar o botão
      this.btnProcessar.innerHTML =
        '<i class="fas fa-cogs"></i>&nbsp; Processar Orçamento';
      this.btnProcessar.disabled = false;
    }
  }
}

// Inicialização da aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  const app = new OrcamentoApp();
});
