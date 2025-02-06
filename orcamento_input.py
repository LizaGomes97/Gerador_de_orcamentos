import re
import tkinter as tk
from tkinter import messagebox, scrolledtext

class Medicamento:
    def __init__(self, codigo, nome):
        self.codigo = codigo
        self.nome = nome
        self.quantidade = 0
        self.preco_cheio = 0.0
        self.desconto_percentual = 0.0
        self.preco_desconto = 0.0
        self.valor_total = 0.0

class OrcamentoApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Processador de Orçamento de Medicamentos")
        self.root.geometry("800x600")  # Aumentei um pouco o tamanho da janela

        # Área de entrada
        self.label_entrada = tk.Label(root, text="Cole aqui os dados do carrinho:")
        self.label_entrada.pack(pady=5)

        self.entrada_text = scrolledtext.ScrolledText(root, height=15, width=80)
        self.entrada_text.pack(pady=10)

        # Botão processar
        self.processar_btn = tk.Button(root, text="Processar Orçamento", command=self.processar_orcamento)
        self.processar_btn.pack(pady=10)

        # Área de resultado
        self.resultado_text = scrolledtext.ScrolledText(root, height=20, width=80, state='disabled')
        self.resultado_text.pack(pady=10)

    def processar_orcamento(self):
        self.resultado_text.config(state='normal')
        self.resultado_text.delete('1.0', tk.END)

        entrada = self.entrada_text.get('1.0', tk.END).strip()
        
        if not entrada:
            messagebox.showwarning("Aviso", "Por favor, cole os dados do carrinho!")
            return

        try:
            medicamentos = self.processar_entrada(entrada)
            if medicamentos:
                relatorio = self.gerar_orcamento(medicamentos)
                self.resultado_text.insert(tk.END, relatorio)
            else:
                messagebox.showwarning("Aviso", "Nenhum medicamento encontrado nos dados!")
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao processar dados: {str(e)}")
        
        self.resultado_text.config(state='disabled')

    def processar_entrada(self, entrada):
        # Dividir em blocos por linhas em branco (podem ter múltiplos espaços/tabs)
        blocos = re.split(r'\n\s*\n', entrada)
        medicamentos = []
        
        for bloco in blocos:
            # Ignorar blocos vazios
            if not bloco.strip():
                continue
                
            # Remover linhas em branco e espaços extras
            linhas = [linha.strip() for linha in bloco.split('\n') if linha.strip()]
            
            if len(linhas) >= 5:  # Precisamos de pelo menos 5 linhas de dados
                try:
                    # Primeira linha contém código e nome
                    primeira_linha = linhas[0].split(None, 1)  # Divide apenas na primeira ocorrência
                    if len(primeira_linha) < 2:
                        continue
                        
                    codigo = primeira_linha[0].strip()
                    nome = primeira_linha[1].strip()
                    
                    # Criar medicamento
                    med = Medicamento(codigo, nome)
                    
                    # Quantidade
                    med.quantidade = int(linhas[1])
                    
                    # Preços e desconto
                    precos = linhas[2].split()
                    med.preco_cheio = float(precos[0].replace(',', '.'))
                    med.desconto_percentual = float(precos[1].replace(',', '.'))
                    
                    # Preço com desconto
                    med.preco_desconto = float(linhas[3].replace(',', '.'))
                    
                    # Valor total
                    med.valor_total = float(linhas[4].replace(',', '.'))
                    
                    medicamentos.append(med)
                    
                except (ValueError, IndexError) as e:
                    print(f"Erro ao processar bloco: {e}")
                    continue
        
        return medicamentos

    def gerar_orcamento(self, medicamentos):
        relatorio = "ORÇAMENTO DE MEDICAMENTOS\n"
        relatorio += "=" * 60 + "\n\n"
        
        valor_total_orcamento = 0.0
        economia_total = 0.0
        
        for med in medicamentos:
            relatorio += f"Código: {med.codigo}\n"
            relatorio += f"Medicamento: {med.nome}\n"
            relatorio += f"Quantidade: {med.quantidade}\n"
            relatorio += f"Preço Unitário: R$ {med.preco_cheio:.2f}\n"
            relatorio += f"Desconto: {med.desconto_percentual:.1f}%\n"
            relatorio += f"Preço com Desconto: R$ {med.preco_desconto:.2f}\n"
            relatorio += f"Valor Total: R$ {med.valor_total:.2f}\n"
            
            economia = (med.preco_cheio - med.preco_desconto) * med.quantidade
            economia_total += economia
            valor_total_orcamento += med.valor_total
            
            relatorio += "-" * 60 + "\n"
        
        relatorio += "\nRESUMO DO ORÇAMENTO\n"
        relatorio += f"Quantidade de Itens: {len(medicamentos)}\n"
        relatorio += f"Valor Total: R$ {valor_total_orcamento:.2f}\n"
        relatorio += f"Economia Total: R$ {economia_total:.2f}\n"
        
        return relatorio

def main():
    root = tk.Tk()
    app = OrcamentoApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()