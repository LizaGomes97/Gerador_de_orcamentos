import re

class Medicamento:
    def __init__(self, codigo, substancia, laboratorio, apresentacao):
        self.codigo = codigo
        self.substancia = substancia
        self.laboratorio = laboratorio
        self.apresentacao = apresentacao
        self.quantidade = 0
        self.preco_cheio = 0.0
        self.desconto_percentual = 0.0
        self.preco_desconto = 0.0
        self.valor_total = 0.0

def processar_entrada(entrada):
    linhas = entrada.strip().split('\n')
    medicamentos = []
    
    i = 0
    while i < len(linhas):
        # Linha de identificação do medicamento
        if re.match(r'^\d{6}', linhas[i]):
            partes = linhas[i].split()
            codigo = partes[0]
            substancia = partes[1]
            laboratorio = partes[2]
            apresentacao = ' '.join(partes[3:])
            
            # Próxima linha é a quantidade
            quantidade = int(linhas[i+1].strip())
            
            # Próxima linha são os preços
            precos = linhas[i+2].split()
            preco_cheio = float(precos[0].replace(',', '.'))
            desconto_percentual = float(precos[1].replace(',', '.'))
            
            # Próxima linha é o preço com desconto
            preco_desconto = float(linhas[i+3].replace(',', '.'))
            
            # Próxima linha (opcional) pode ser o valor total
            valor_total = float(linhas[i+4].replace(',', '.')) if len(linhas) > i+4 else preco_desconto * quantidade
            
            # Criar objeto Medicamento
            med = Medicamento(codigo, substancia, laboratorio, apresentacao)
            med.quantidade = quantidade
            med.preco_cheio = preco_cheio
            med.desconto_percentual = desconto_percentual
            med.preco_desconto = preco_desconto
            med.valor_total = valor_total
            
            medicamentos.append(med)
            
            # Avançar para o próximo medicamento
            i += 5
        else:
            i += 1
    
    return medicamentos

def gerar_orcamento(medicamentos):
    print("ORÇAMENTO DE MEDICAMENTOS")
    print("=" * 50)
    
    valor_total_orcamento = 0.0
    economia_total = 0.0
    
    for med in medicamentos:
        print(f"Código: {med.codigo}")
        print(f"Medicamento: {med.substancia} - {med.laboratorio}")
        print(f"Apresentação: {med.apresentacao}")
        print(f"Quantidade: {med.quantidade}")
        print(f"Preço Unitário: R$ {med.preco_cheio:.2f}")
        print(f"Desconto: {med.desconto_percentual:.2f}%")
        print(f"Preço com Desconto: R$ {med.preco_desconto:.2f}")
        print(f"Valor Total: R$ {med.valor_total:.2f}")
        
        economia = (med.preco_cheio - med.preco_desconto) * med.quantidade
        economia_total += economia
        valor_total_orcamento += med.valor_total
        
        print("-" * 50)
    
    print(f"RESUMO DO ORÇAMENTO")
    print(f"Valor Total: R$ {valor_total_orcamento:.2f}")
    print(f"Economia Total: R$ {economia_total:.2f}")

def main():
    # Exemplo de entrada
    entrada = """121212 Metoprolol NQG 10'S 
1
34,50 10,00
30,55
30,55

145154 Sumatripitana MEG 20'S
2
20,00 10,00
18,00
32,00"""
    
    medicamentos = processar_entrada(entrada)
    gerar_orcamento(medicamentos)

if __name__ == "__main__":
    main()