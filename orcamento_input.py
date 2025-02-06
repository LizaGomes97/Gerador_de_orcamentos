import re
import tkinter as tk
from tkinter import messagebox, scrolledtext

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

class OrcamentoApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Processador de Orçamento de Medicamentos")
        self.root.geometry("600x500")

        # Área de entrada
        self.label_entrada = tk.Label(root, text="Cole aqui os dados do carrinho:")
        self.label_entrada.pack(pady=5)

        self.entrada_text = scrolledtext.ScrolledText(root, height=10, width=70)
        self.entrada_text.pack(pady=10)

        # Botão processar
        self.processar_btn = tk.Button(root, text="Processar Orçamento", command=self.processar_orcamento)
        self.processar_btn.pack(pady=10)

        # Área de resultado
        self.resultado_text = scrolledtext.ScrolledText(root, height=15, width=70, state='disabled')
        self.resultado_text.pack(pady=10)

    def processar_orcamento(self):
        # Limpar resultado anterior
        self.resultado_text.config(state='normal')
        self.resultado_text.delete('1.0', tk.END)

        # Pegar dados de entrada
        entrada = self.entrada_text.get('1.0', tk.END).strip()
        
        if not entrada:
            messagebox.showwarning("Aviso", "Por favor, cole os dados do carrinho!")
            return

        # Processar entrada
        medicamentos = self.processar_entrada(entrada)
        
        # Gerar relatório
        relatorio = self.gerar_orcamento(medicamentos)
        
        # Mostrar resultado
        self.resultado_text.insert(tk.END, relatorio)
        self.resultado_text.config(state='disabled')

    def processar_entrada(self, entrada):
        # Dividir a entrada em blocos de medicamentos
        blocos = re.split(r'\n\s*\n', entrada)
        medicamentos = []
        
        for bloco in blocos:
            # Remover linhas em branco
            linhas = [linha.strip() for linha in bloco.split('\n') if linha.strip()]
            
            if len(linhas) >= 6:  # Garantir que temos todos os dados necessários
                codigo = linhas[0]
                substancia_match = re.match(r'(\w+)\s+(\w+)\s+(.+)', linhas[1])
                
                if substancia_match:
                    substancia, laboratorio, apresentacao = substancia_match.groups()
                    quantidade = int(linhas[2])
                    
                    precos = linhas[3].split()
                    preco_cheio = float(precos[0].replace(',', '.'))
                    desconto_percentual = float(precos[1].replace(',', '.'))
                    
                    preco_desconto = float(linhas[4].replace(',', '.'))
                    
                    # Valor total pode ser opcional
                    valor_total = float(linhas[5].replace(',', '.')) if len(linhas) > 5 else preco_desconto * quantidade
                    
                    # Criar objeto Medicamento
                    med = Medicamento(codigo, substancia, laboratorio, apresentacao)
                    med.quantidade = quantidade
                    med.preco_cheio = preco_cheio
                    med.desconto_percentual = desconto_percentual
                    med.preco_desconto = preco_desconto
                    med.valor_total = valor_total
                    
                    medicamentos.append(med)
        
        return medicamentos

    def gerar_orcamento(self, medicamentos):
        relatorio = "ORÇAMENTO DE MEDICAMENTOS\n"
        relatorio += "=" * 50 + "\n"
        
        valor_total_orcamento = 0.0
        economia_total = 0.0
        
        for med in medicamentos:
            relatorio += f"Código: {med.codigo}\n"
            relatorio += f"Medicamento: {med.substancia} - {med.laboratorio}\n"
            relatorio += f"Apresentação: {med.apresentacao}\n"
            relatorio += f"Quantidade: {med.quantidade}\n"
            relatorio += f"Preço Unitário: R$ {med.preco_cheio:.2f}\n"
            relatorio += f"Desconto: {med.desconto_percentual:.2f}%\n"
            relatorio += f"Preço com Desconto: R$ {med.preco_desconto:.2f}\n"
            relatorio += f"Valor Total: R$ {med.valor_total:.2f}\n"
            
            economia = (med.preco_cheio - med.preco_desconto) * med.quantidade
            economia_total += economia
            valor_total_orcamento += med.valor_total
            
            relatorio += "-" * 50 + "\n"
        
        relatorio += "RESUMO DO ORÇAMENTO\n"
        relatorio += f"Valor Total: R$ {valor_total_orcamento:.2f}\n"
        relatorio += f"Economia Total: R$ {economia_total:.2f}\n"
        
        return relatorio

def main():
    root = tk.Tk()
    app = OrcamentoApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()