import re
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from tkinter.font import Font

# Definindo cores do tema Drogasil
CORES = {
    'vermelho_principal': '#FF5C5C',  # Vermelho Drogasil
    'cinza_claro': '#F5F5F5',        # Fundo claro
    'cinza_medio': '#E0E0E0',        # Bordas
    'texto_escuro': '#333333',       # Texto principal
    'branco': '#F8F9FA',             # Texto em botões
    'hover_vermelho': '#FF3355'      # Vermelho mais escuro para hover
}

class EstiloApp:
    @staticmethod
    def configurar_estilo():
        style = ttk.Style()
        
        # Configurando tema base
        style.theme_use('clam')
        
        # Configurando estilo dos botões
        style.configure(
            'Custom.TButton',
            background=CORES['vermelho_principal'],
            foreground=CORES['branco'],
            borderwidth=0, #remove o contorno
            focusthickness=0,
            focuscolor=CORES['vermelho_principal'],
            padding=(10, 10),
            relief="raised",
            font=('Helvetica', 10)
            
        )
        
        # Configurando diferentes estados do botão
        style.map('Custom.TButton',
            background=[
                ('active', CORES['hover_vermelho']),
                ('pressed', CORES['hover_vermelho'])
            ],
            foreground=[
                ('active', CORES['branco']),
                ('pressed', CORES['branco'])
            ],
            relief=[
                ('pressed', 'sunken')
            ]
        )
        
        return style

class Medicamento:
    def __init__(self, codigo, nome):
        self.codigo = codigo
        self.nome = nome
        self.quantidade = 0
        self.preco_cheio = 0.0
        self.desconto_percentual = 0.0
        self.preco_desconto = 0.0
        self.valor_total = 0.0
        self.desconto_especial = ""

class OrcamentoApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Processador de Orçamento de Medicamentos - Drogasil")
        self.root.geometry("800x600")
        
        # Configurando cores de fundo da janela principal
        self.root.configure(bg=CORES['cinza_claro'])
        
        # Configurando fontes
        self.titulo_font = Font(family="Helvetica", size=14, weight="bold")
        self.texto_font = Font(family="Helvetica", size=10)
        
        # Configurando estilo
        self.style = EstiloApp.configurar_estilo()
        
        # Criando widgets
        self.criar_widgets()

    def criar_widgets(self):
        # Frame principal
        main_frame = tk.Frame(self.root, bg=CORES['cinza_claro'], padx=20, pady=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Título
        titulo_label = tk.Label(
            main_frame,
            text="Processador de Orçamento",
            font=self.titulo_font,
            bg=CORES['cinza_claro'],
            fg=CORES['vermelho_principal']
        )
        titulo_label.pack(pady=(0, 20))

        # Label de entrada
        self.label_entrada = tk.Label(
            main_frame,
            text="Cole aqui os dados do carrinho:",
            font=self.texto_font,
            bg=CORES['cinza_claro'],
            fg=CORES['texto_escuro']
        )
        self.label_entrada.pack(pady=5)

        # Campo de entrada
        self.entrada_text = scrolledtext.ScrolledText(
            main_frame,
            height=15,
            width=80,
            font=self.texto_font,
            bg=CORES['branco'],
            relief="solid",
            borderwidth=1
        )
        self.entrada_text.pack(pady=10)

        # Frame para botões
        self.main_buttons_frame = tk.Frame(main_frame, bg=CORES['cinza_claro'])
        self.main_buttons_frame.pack(pady=10, fill =tk.X)

         # Frame interno para os botões
        buttons_container = tk.Frame(self.main_buttons_frame, bg=CORES['cinza_claro'])
        buttons_container.pack(anchor='center')  # ancora o container no centro

        # Criando botões
        botoes = [
            ("Limpar Tudo", self.limpar_tudo),
            ("Processar Orçamento", self.processar_orcamento),
            ("Copiar Orçamento", self.copiar_orcamento),
            ("Gerar Código Interno", self.gerar_codigo_interno)
        ]

        for texto, comando in botoes:
            btn = ttk.Button(
                buttons_container,
                text=texto,
                command=comando,
                style='Custom.TButton'
            )
            btn.pack(side=tk.LEFT, padx=5)

        # Campo de resultado
        self.resultado_text = scrolledtext.ScrolledText(
            main_frame,
            height=20,
            width=80,
            font=self.texto_font,
            bg=CORES['branco'],
            relief="solid",
            borderwidth=1,
            state='disabled'
        )
        self.resultado_text.pack(pady=10)

    def mostrar_mensagem(self, tipo, titulo, mensagem):
        if tipo == "erro":
            messagebox.showerror(titulo, mensagem)
        elif tipo == "aviso":
            messagebox.showwarning(titulo, mensagem)
        else:
            messagebox.showinfo(titulo, mensagem)

    def limpar_tudo(self):
        self.entrada_text.delete('1.0', tk.END)
        self.resultado_text.config(state='normal')
        self.resultado_text.delete('1.0', tk.END)
        self.resultado_text.config(state='disabled')

    def copiar_orcamento(self):
        conteudo = self.resultado_text.get('1.0', tk.END).strip()
        if not conteudo:
            self.mostrar_mensagem("aviso", "Aviso", "Não há orçamento para copiar!")
            return

        self.root.clipboard_clear()
        self.root.clipboard_append(conteudo)
        self.mostrar_mensagem("info", "Sucesso", "Orçamento copiado para a área de transferência!")

    def gerar_codigo_interno(self):
        self.resultado_text.config(state='normal')
        self.resultado_text.delete('1.0', tk.END)

        entrada = self.entrada_text.get('1.0', tk.END).strip()
        
        if not entrada:
            self.mostrar_mensagem("aviso", "Aviso", "Por favor, cole os dados do carrinho!")
            return

        try:
            medicamentos = self.processar_entrada(entrada)
            if medicamentos:
                codigos = ' '.join(med.codigo for med in medicamentos)
                self.resultado_text.insert(tk.END, codigos)
            else:
                self.mostrar_mensagem("aviso", "Aviso", "Nenhum medicamento encontrado nos dados!")
        except Exception as e:
            self.mostrar_mensagem("erro", "Erro", f"Erro ao processar dados: {str(e)}")
        
        self.resultado_text.config(state='disabled')

    def processar_orcamento(self):
        self.resultado_text.config(state='normal')
        self.resultado_text.delete('1.0', tk.END)

        entrada = self.entrada_text.get('1.0', tk.END).strip()
        
        if not entrada:
            self.mostrar_mensagem("aviso", "Aviso", "Por favor, cole os dados do carrinho!")
            return

        try:
            medicamentos = self.processar_entrada(entrada)
            if medicamentos:
                relatorio = self.gerar_orcamento(medicamentos)
                self.resultado_text.insert(tk.END, relatorio)
            else:
                self.mostrar_mensagem("aviso", "Aviso", "Nenhum medicamento encontrado nos dados!")
        except Exception as e:
            self.mostrar_mensagem("erro", "Erro", f"Erro ao processar dados: {str(e)}")
        
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
                    valor_parts = linhas[4].split()
                    med.valor_total = float(valor_parts[0].replace(',', '.'))
                    if len(valor_parts) > 1:
                        med.desconto_especial = ' '.join(valor_parts[1:])
                    
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
            
            if med.desconto_especial:
                relatorio += f"Desconto especial: {med.desconto_especial}\n"
                
            relatorio += f"Preço Unitário: R$ {med.preco_cheio:.2f}\n"
            
            if med.desconto_percentual > 0:
                relatorio += f"Preço com Desconto: R$ {med.preco_desconto:.2f}\n"
                
            relatorio += f"Valor Total: R$ {med.valor_total:.2f}\n"
            relatorio += "-" * 60 + "\n"
            
            economia = (med.preco_cheio - med.preco_desconto) * med.quantidade
            economia_total += economia
            valor_total_orcamento += med.valor_total
        
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