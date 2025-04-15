// teste-processamento.js
// Salve e execute com: node teste-processamento.js

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
}

function processarEntrada(entrada) {
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
            const precos = precosTexto.split(/\s+/).filter((p) => p.length > 0);

            if (precos.length >= 2) {
              med.preco_cheio = parseFloat(precos[0].replace(",", "."));
              med.desconto_percentual = parseFloat(precos[1].replace(",", "."));
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

// Dados de teste
const dadosTeste = `35697  HYLO GEL LUB OCUL 10ML   
  1 
  127,32  0,0   
  127,32 
  127,32         
  
  6769  BLEPHAGEL 40G   
  1 
  188,99  0,0   
  188,99 
  188,99         
  
  14951  HYABAK SOL OFT 10ML   
  1 
  88,69  10,0   
  79,82 
  79,82      Desconto Gerência Aplicado`;

// Outro conjunto de dados para teste
const dadosTeste2 = `35697 HYLO GEL LUB OCUL 10ML
  1
  127,32 0,0
  127,32
  127,32
  38694 GB DES AER BLUE 150ML
  1
  16,90 0,0
  16,90
  16,90
  51157 OZEMPIC 1MG 4AGULHAS
  1
  1338,30 20,6
  1063,00
  1063,00 954424121 E-PHARMA`;

// Teste com formato sem linhas em branco
const dadosTeste3 = `30,90
  38694 GB DES AER BLUE 150ML
  1
  16,90 0,0
  16,90
  16,90
  51157 OZEMPIC 1MG 4AGULHAS
  1
  1338,30 20,6
  1063,00
  1063,00 954424121 E-PHARMA`;

// Teste com o formato da sua imagem
const dadosTeste4 = `30,90
  38694 GB DES AER BLUE 150ML
  1
  16,90 0,0
  16,90
  16,90
  51157 OZEMPIC 1MG 4AGULHAS
  1
  1338,30 20,6
  1063,00
  1063,00 954424121 E-PHARMA`;

// Executar os testes
console.log("========================");
console.log("TESTE COM DADOS ORIGINAIS");
console.log("========================");
let medicamentos1 = processarEntrada(dadosTeste);
exibirResultados(medicamentos1);

console.log("\n\n========================");
console.log("TESTE COM DADOS SEM LINHAS EM BRANCO");
console.log("========================");
let medicamentos2 = processarEntrada(dadosTeste2);
exibirResultados(medicamentos2);

console.log("\n\n========================");
console.log("TESTE COM FORMATO DIFERENTE");
console.log("========================");
let medicamentos3 = processarEntrada(dadosTeste3);
exibirResultados(medicamentos3);

console.log("\n\n========================");
console.log("TESTE COM FORMATO DA IMAGEM");
console.log("========================");
let medicamentos4 = processarEntrada(dadosTeste4);
exibirResultados(medicamentos4);

// Função auxiliar para exibir os resultados
function exibirResultados(medicamentos) {
  console.log(`\nTotal de medicamentos processados: ${medicamentos.length}`);
  medicamentos.forEach((med, index) => {
    console.log(`\nMedicamento ${index + 1}:`);
    console.log(`Código: ${med.codigo}`);
    console.log(`Nome: ${med.nome}`);
    console.log(`Quantidade: ${med.quantidade}`);
    console.log(`Preço Cheio: R$ ${med.preco_cheio.toFixed(2)}`);
    console.log(`Desconto %: ${med.desconto_percentual.toFixed(1)}%`);
    console.log(`Preço com Desconto: R$ ${med.preco_desconto.toFixed(2)}`);
    console.log(`Valor Total: R$ ${med.valor_total.toFixed(2)}`);
    if (med.desconto_especial) {
      console.log(`Desconto Especial: ${med.desconto_especial}`);
    }
  });
}
