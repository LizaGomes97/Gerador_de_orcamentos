import re
import tkinter as tk
from tkinter import messagebox, scrolledtext
import tempfile
import os

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
        self.root.geometry("800x600")

        # Frame para os botões no topo
        self.button_frame = tk.Frame(root)
        self.button_frame.pack(pady=5, fill=tk.X)

        # Área de entrada
        self.label_entrada = tk.Label(root, text="Cole aqui os dados do carrinho:")
        self.label_entrada.pack(pady=5)

        self.entrada_text = scrolledtext.ScrolledText(root, height=15, width=80)
        self.entrada_text.pack(pady=10)

        # Frame para os botões principais
        self.main_buttons_frame = tk.Frame(root)
        self.main_buttons_frame.pack(pady=5)

        # Botões
        self.limpar_btn = tk.Button(self.main_buttons_frame, text="Limpar Tudo", command=self.limpar_tudo)
        self.limpar_btn.pack(side=tk.LEFT, padx=5)

        self.processar_btn = tk.Button(self.main_buttons_frame, text="Processar Orçamento", command=self.processar_orcamento)
        self.processar_btn.pack(side=tk.LEFT, padx=5)

        self.copiar_btn = tk.Button(self.main_buttons_frame, text="Copiar Orçamento", command=self.copiar_orcamento)
        self.copiar_btn.pack(side=tk.LEFT, padx=5)

        # Área de resultado
        self.resultado_text = scrolledtext.ScrolledText(root, height=20, width=80, state='disabled')
        self.resultado_text.pack(pady=10)

    def limpar_tudo(self):
        # Limpa área de entrada
        self.entrada_text.delete('1.0', tk.END)
        # Limpa área de resultado
        self.resultado_text.config(state='normal')
        self.resultado_text.delete('1.0', tk.END)
        self.resultado_text.config(state='disabled')

    def copiar_orcamento(self):
        conteudo = self.resultado_text.get('1.0', tk.END).strip()
        if not conteudo:
            messagebox.showwarning("Aviso", "Não há orçamento para copiar!")
            return

        # Copia para a área de transferência
        self.root.clipboard_clear()
        self.root.clipboard_append(conteudo)
        messagebox.showinfo("Sucesso", "Orçamento copiado para a área de transferência!")

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
        blocos = re.split(r'\n\s*\n', entrada)
        medicamentos = []
        
        for bloco in blocos:
            if not bloco.strip():
                continue
                
            linhas = [linha.strip() for linha in bloco.split('\n') if linha.strip()]
            
            if len(linhas) >= 5:
                try:
                    primeira_linha = linhas[0].split(None, 1)
                    if len(primeira_linha) < 2:
                        continue
                        
                    codigo = primeira_linha[0].strip()
                    nome = primeira_linha[1].strip()
                    
                    med = Medicamento(codigo, nome)
                    med.quantidade = int(linhas[1])
                    
                    precos = linhas[2].split()
                    med.preco_cheio = float(precos[0].replace(',', '.'))
                    med.desconto_percentual = float(precos[1].replace(',', '.'))
                    
                    med.preco_desconto = float(linhas[3].replace(',', '.'))
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