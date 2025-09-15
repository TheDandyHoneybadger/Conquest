import tkinter as tk
from tkinter import ttk, filedialog, messagebox, simpledialog
import json
import re
import os
from PIL import Image, ImageTk

# ==============================================================================
# CONFIGURAÇÕES E ORDEM DE ORGANIZAÇÃO
# ==============================================================================
NATION_ORDER = ["Aethel", "Kragmar", "Sylvanis", "Noxaeterna", "Leviathus", "Neutro"]
TYPE_ORDER = ["General", "Unidade", "Ação", "Suporte"]

# ATUALIZADO: Adicionadas novas condições da expansão
CONDICOES = {
    'onPlay': [], 'onDeath': [], 'onTurnStart': [], 'onTurnEnd': [], 'onAttack': [],
    'onActivate': ['exp_cost'], 'onFriendlyUnitPlay': [], 'onEnemyUnitPlay': [],
    'onFriendlyUnitDeath': [], 'onEnemyUnitDeath': [], 'onDefend': [],
    'onSurviveDamage': [], 'onOwnerGeneralDamage': [], 'onEnemyGeneralDamage': [],
    'onOwnerPlayAction': [], 'onOwnerPlaySupport': [], 'onOwnerDrawCard': [],
    'onOwnerDiscardCard': [], 'onGeneralTransform': [], 'onGainExp': [], 'onSpendExp': [],
    'onOpponentPayExtraCost': [], 'onOpponentPlayCard': [], 'onEnemyUnitFreeze': [],
    'onEnemyUnitUnfreeze': [], 'onMill': [], 'onPlayActionOnSelf': []
}
# ATUALIZADO: Adicionados novos efeitos da expansão
EFEITOS = {
    'draw': ['N'], 'damage': ['N', 'alvo'], 'heal': ['N', 'alvo'],
    'buff': ['X', 'Y', 'alvo'], 'tempBuff': ['X', 'Y', 'alvo'],
    'setStats': ['X', 'Y', 'alvo'], 'copyStats': ['alvo1', 'alvo2'],
    'destroy': ['alvo'], 'returnToHand': ['alvo'], 'discard': ['N', 'alvo'],
    'addKeyword': ['keyword', 'alvo'], 'gainExp': ['N'],
    'spawn': ['token', 'X', 'Y', 'alvo'], 'freeze': ['alvo'],
    'removeKeywords': ['alvo'], 'lockActions': ['alvo'], 'increaseCost': ['N', 'alvo'],
    'tutor': ['tipo_carta', 'N'], 'doubleStats': ['alvo'], 'mindControl': ['alvo'],
    'mill': ['N', 'alvo'], 'recover': ['tipo_carta', 'alvo']
}
# ATUALIZADO: Adicionados novos alvos da expansão
ALVOS = [
    'self', 'triggering_unit', 'owner_general', 'opponent_general', 'target_unit',
    'target_friendly_unit', 'target_enemy_unit', 'all_units', 'all_friendly_units',
    'all_enemy_units', 'random_enemy_unit', 'empty_friendly_zone', 'opponent',
    'self_player', 'highest_attack_enemy_unit', 'opponent_next_card',
    'highest_cost_card_in_hand', 'chosen_card_in_hand', 'defending_unit',
    'all_sleeping_units', 'self_graveyard'
]
# ATUALIZADO: Adicionadas novas keywords da expansão
KEYWORDS = {
    'Ímpeto': [], 'Toque Mortal': [], 'Vínculo Vital': [],
    'Proteger': ['N'], 'Evasão': [], 'Ressurgir': [],
    'Guarda-Costas': [], 'Atropelar': []
}
# ATUALIZADO: Adicionadas novas condições de transformação da expansão
TRANSFORMATION_CONDITIONS = [
    'ALIADOS_MORTOS', 'CAUSAR_DANO', 'COMPRAR_CARTAS', 'GANHAR_EXP', 'SOBREVIVER_DANO',
    'CONTROLAR_MAQUINAS', 'ATINGIR_ATAQUE', 'INIMIGOS_ADORMECIDOS',
    'CARTAS_NO_PROPRIO_CEMITERIO'
]

class CardCreatorApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Criador de Cartas v2.1 - Projeto Épico")
        self.geometry("1400x850")

        # Adicionada configuração de qualidade para a compressão WebP
        self.WEBP_QUALITY = 80  # Valor de 0 (pior) a 100 (melhor)

        # CAMINHOS AJUSTADOS PARA MELHOR ORGANIZAÇÃO
        self.data_path = "data"
        self.images_path = "images"
        self.database_path = os.path.join(self.data_path, "database.js")

        self.all_cards = []
        self.existing_ids = set()
        self.selected_card_id = None

        self.check_project_structure()
        self.load_database()
        
        self.main_notebook = ttk.Notebook(self)
        self.main_notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.editor_tab = ttk.Frame(self.main_notebook)
        self.main_notebook.add(self.editor_tab, text="Editor de Cartas")
        
        self.editions_tab = ttk.Frame(self.main_notebook)
        self.main_notebook.add(self.editions_tab, text="Gerenciador de Edições")

        self.create_editor_widgets(self.editor_tab)
        self.create_editions_widgets(self.editions_tab)

        self.update_collection_combobox()
        self.populate_card_list()
        self.populate_editions_list()
        
        self._bind_auto_update_events()

    def check_project_structure(self):
        # Garante que a pasta de imagens exista
        if not os.path.exists(self.images_path):
            os.makedirs(self.images_path)
            messagebox.showinfo("Informação", f"A pasta '{self.images_path}' foi criada para organizar as artes das cartas.")

        # Garante que a pasta de dados exista
        if not os.path.exists(self.data_path):
            os.makedirs(self.data_path)
            messagebox.showinfo("Informação", f"A pasta '{self.data_path}' foi criada.\nSeu arquivo 'database.js' deve ser colocado aqui.")

    def load_database(self):
        # ATUALIZADO: Lógica de carregamento mais robusta que ignora comentários
        try:
            with open(self.database_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove comentários de linha única (//) e de bloco (/* ... */)
            content_no_comments = re.sub(r'//.*', '', content)
            content_no_comments = re.sub(r'/\*.*?\*/', '', content_no_comments, flags=re.DOTALL)

            # Encontra o array de cartas no conteúdo
            match = re.search(r'\[\s*\{.*\}\s*\]', content_no_comments, re.DOTALL)
            if not match:
                self.all_cards = []
                self.existing_ids = set()
                return

            json_str = match.group(0)
            self.all_cards = json.loads(json_str) if json_str else []
            self.existing_ids = {card.get('id', '') for card in self.all_cards}

        except FileNotFoundError:
            self.all_cards = []
        except (json.JSONDecodeError, IndexError) as e:
            messagebox.showerror("Erro de Leitura", f"O arquivo '{self.database_path}' parece estar corrompido ou mal formatado.\n\nDetalhes: {e}")
            self.all_cards = []
            self.quit()

    def save_database(self):
        try:
            self.renumber_and_sort_cards()
            
            for card in self.all_cards:
                card_id = card.get('id')
                card_type = card.get('tipo')
                if not card_id or not card_type:
                    continue
                
                if 'arte' in card:
                    novo_caminho = self._processar_renomeacao_arte(card, card_id, card_type, 'arte')
                    card['arte'] = novo_caminho

                if 'segundaFace' in card and 'arte' in card['segundaFace']:
                    novo_caminho_f2 = self._processar_renomeacao_arte(card['segundaFace'], card_id, card_type, 'arte', id_suffix='_face2')
                    card['segundaFace']['arte'] = novo_caminho_f2

            json_string = json.dumps(self.all_cards, indent=4, ensure_ascii=False)
            js_content = f"export const databaseCartas = {json_string};\n"
            with open(self.database_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
            
            messagebox.showinfo("Sucesso", f"Banco de dados '{self.database_path}' salvo com sucesso!\nAs cartas foram reorganizadas, renumeradas e as artes sincronizadas.")
            self.refresh_all_views()
        except Exception as e:
            messagebox.showerror("Erro ao Salvar", f"Não foi possível salvar: {e}")

    def renumber_and_sort_cards(self):
        # ... (restante do código permanece o mesmo)
        nation_map = {name: i for i, name in enumerate(NATION_ORDER)}
        type_map = {name: i for i, name in enumerate(TYPE_ORDER)}

        for card in self.all_cards:
            if 'nacao' not in card: card['nacao'] = "Neutro"
            if 'tipo' not in card: card['tipo'] = "Unidade"

        self.all_cards.sort(key=lambda card: (
            card.get('id', '_').split('_')[0], 
            nation_map.get(card.get('nacao'), 99),
            type_map.get(card.get('tipo'), 99),
            card.get('nome', '')
        ))

        cards_by_edition = {}
        for card in self.all_cards:
            edition_match = re.match(r"([A-Z0-9]+)_", card.get('id', ''))
            if not edition_match: continue
            edition = edition_match.group(1)
            
            if edition not in cards_by_edition:
                cards_by_edition[edition] = []
            cards_by_edition[edition].append(card)

        new_card_list = []
        self.existing_ids = set()
        for edition, cards in sorted(cards_by_edition.items()):
            for i, card in enumerate(cards, 1):
                new_id = f"{edition}_{i:03d}"
                card['id'] = new_id
                self.existing_ids.add(new_id)
                new_card_list.append(card)
        
        self.all_cards = new_card_list

    def create_editions_widgets(self, parent):
        # ... (restante do código permanece o mesmo)
        editions_frame = ttk.Frame(parent, padding="10")
        editions_frame.pack(fill=tk.BOTH, expand=True)
        editions_frame.grid_columnconfigure(1, weight=1)
        editions_frame.grid_rowconfigure(0, weight=1)

        left_panel = ttk.Frame(editions_frame)
        left_panel.grid(row=0, column=0, sticky="ns", padx=(0, 10))

        list_frame = ttk.Labelframe(left_panel, text="Edições", padding=5)
        list_frame.pack(fill=tk.BOTH, expand=True)

        self.editions_listbox = tk.Listbox(list_frame, exportselection=False)
        self.editions_listbox.pack(fill=tk.BOTH, expand=True)
        self.editions_listbox.bind('<<ListboxSelect>>', self.on_edition_select)

        buttons_frame = ttk.Frame(left_panel)
        buttons_frame.pack(fill=tk.X, pady=5)
        ttk.Button(buttons_frame, text="Nova Edição", command=self.create_new_edition).pack(fill=tk.X, pady=2)
        ttk.Button(buttons_frame, text="Renomear Edição", command=self.rename_selected_edition).pack(fill=tk.X, pady=2)
        ttk.Button(buttons_frame, text="Deletar Edição", command=self.delete_selected_edition, style="Danger.TButton").pack(fill=tk.X, pady=2)

        spoiler_frame = ttk.Labelframe(editions_frame, text="Spoiler da Edição", padding=10)
        spoiler_frame.grid(row=0, column=1, sticky="nsew")
        
        self.spoiler_tree = ttk.Treeview(spoiler_frame)
        self.spoiler_tree.pack(fill=tk.BOTH, expand=True)
        
    def populate_editions_list(self):
        # ... (restante do código permanece o mesmo)
        if hasattr(self, 'editions_listbox'):
            self.editions_listbox.delete(0, tk.END)
        
        collections = sorted(list(set(c.get('id', '').split('_')[0] for c in self.all_cards if c.get('id') and '_' in c.get('id', ''))))
        for collection in collections:
            self.editions_listbox.insert(tk.END, collection)
        return collections

    def on_edition_select(self, event=None):
        # ... (restante do código permanece o mesmo)
        selection = self.editions_listbox.curselection()
        if not selection: return
        edition_code = self.editions_listbox.get(selection[0])
        self.populate_spoiler_tree(edition_code)

    def populate_spoiler_tree(self, edition_code):
        # ... (restante do código permanece o mesmo)
        for i in self.spoiler_tree.get_children():
            self.spoiler_tree.delete(i)
        
        type_map = {name: i for i, name in enumerate(TYPE_ORDER)}
        nation_map = {name: i for i, name in enumerate(NATION_ORDER)}

        cards_in_edition = sorted(
            [c for c in self.all_cards if c.get('id', '').startswith(edition_code + '_')],
            key=lambda card: (nation_map.get(card.get('nacao'), 99), type_map.get(card.get('tipo'), 99))
        )
        
        cards_by_group = {}
        for card in cards_in_edition:
            nacao = card.get("nacao", "Sem Nação")
            tipo = card.get("tipo", "Desconhecido")
            if nacao not in cards_by_group: cards_by_group[nacao] = {}
            if tipo not in cards_by_group[nacao]: cards_by_group[nacao][tipo] = []
            cards_by_group[nacao][tipo].append(card)

        for nacao in sorted(cards_by_group.keys(), key=lambda n: nation_map.get(n, 99)):
            nation_node = self.spoiler_tree.insert("", "end", text=nacao, open=True)
            for tipo in sorted(cards_by_group[nacao].keys(), key=lambda t: type_map.get(t, 99)):
                type_node = self.spoiler_tree.insert(nation_node, "end", text=tipo, open=True)
                for card in cards_by_group[nacao][tipo]:
                    self.spoiler_tree.insert(type_node, "end", text=f"[{card['id']}] {card.get('nome', '')}")

    def create_new_edition(self):
        # ... (restante do código permanece o mesmo)
        new_code = simpledialog.askstring("Nova Edição", "Digite o código para a nova edição (ex: 'EXP1', 'ROTA'):")
        if new_code and new_code.isalnum() and '_' not in new_code:
            new_code = new_code.upper()
            if new_code not in self.editions_listbox.get(0, tk.END):
                self.editions_listbox.insert(tk.END, new_code)
                
                if hasattr(self, 'entries') and "Coleção" in self.entries:
                    current_values = list(self.entries["Coleção"]['values'])
                    if new_code not in current_values:
                        current_values.append(new_code)
                        self.entries["Coleção"]['values'] = sorted(current_values)
                
                messagebox.showinfo("Sucesso", f"Edição '{new_code}' pronta para ser usada.\nCrie novas cartas selecionando-a no campo 'Coleção'.")
            else:
                messagebox.showwarning("Aviso", "Uma edição com esse código já existe.")
        elif new_code:
            messagebox.showerror("Erro", "O código da edição deve ser alfanumérico e não pode conter '_'.")

    def rename_selected_edition(self):
        # ... (restante do código permanece o mesmo)
        selection = self.editions_listbox.curselection()
        if not selection:
            messagebox.showerror("Erro", "Nenhuma edição selecionada para renomear.")
            return
        old_code = self.editions_listbox.get(selection[0])
        
        new_code = simpledialog.askstring("Renomear Edição", f"Digite o novo código para a edição '{old_code}':")
        if new_code and new_code.isalnum() and '_' not in new_code:
            new_code = new_code.upper()
            if new_code == old_code: return
            if new_code in self.editions_listbox.get(0, tk.END):
                messagebox.showerror("Erro", f"A edição '{new_code}' já existe.")
                return

            if messagebox.askyesno("Atenção!", f"Isso renomeará os IDs de TODAS as cartas da edição '{old_code}' para '{new_code}'.\n\nEsta ação não pode ser desfeita. Deseja continuar?"):
                for card in self.all_cards:
                    if card.get('id', '').startswith(old_code + '_'):
                        card['id'] = card['id'].replace(old_code + '_', new_code + '_', 1)
                
                self.refresh_all_views()
                messagebox.showinfo("Sucesso", f"Edição '{old_code}' renomeada para '{new_code}'.\nClique em 'Salvar TUDO' para reorganizar, renumerar e persistir as mudanças.")

        elif new_code: messagebox.showerror("Erro", "O código da edição deve ser alfanumérico e não pode conter '_'.")

    def delete_selected_edition(self):
        # ... (restante do código permanece o mesmo)
        selection = self.editions_listbox.curselection()
        if not selection:
            messagebox.showerror("Erro", "Nenhuma edição selecionada para deletar.")
            return
        code_to_delete = self.editions_listbox.get(selection[0])
        
        if messagebox.askyesno("Confirmar Exclusão", f"Tem certeza que deseja deletar TODAS as cartas da edição '{code_to_delete}'?\n\nEsta ação é permanente e não pode ser desfeita."):
            self.all_cards = [card for card in self.all_cards if not card.get('id', '').startswith(code_to_delete + '_')]
            self.refresh_all_views()
            messagebox.showinfo("Sucesso", f"Edição '{code_to_delete}' e todas as suas cartas foram deletadas.\nClique em 'Salvar TUDO' para persistir as mudanças.")

    def refresh_all_views(self):
        # ... (restante do código permanece o mesmo)
        self.existing_ids = {card.get('id', '') for card in self.all_cards}
        self.populate_card_list()
        self.populate_editions_list()
        self.update_collection_combobox()
        if hasattr(self, 'spoiler_tree'):
            self.spoiler_tree.delete(*self.spoiler_tree.get_children())
        self.clear_form()
    
    def create_editor_widgets(self, parent):
        # ... (restante do código permanece o mesmo)
        main_frame = ttk.Frame(parent, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        main_frame.grid_rowconfigure(0, weight=1)
        main_frame.grid_columnconfigure(1, weight=1)
        left_frame = ttk.Labelframe(main_frame, text="Cartas Existentes (Todas as Edições)", padding="10")
        left_frame.grid(row=0, column=0, sticky="ns", padx=(0, 10))
        self.card_tree = ttk.Treeview(left_frame, selectmode="browse")
        self.card_tree.pack(fill=tk.BOTH, expand=True)
        self.card_tree.bind('<<TreeviewSelect>>', self.on_card_select)
        right_frame = ttk.Frame(main_frame)
        right_frame.grid(row=0, column=1, sticky="nsew")
        self.notebook = ttk.Notebook(right_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        self.create_basic_info_tab()
        self.create_effects_tab()
        self.create_general_tab()
        button_frame = ttk.Frame(right_frame)
        button_frame.pack(fill=tk.X, pady=10)
        ttk.Button(button_frame, text="Limpar Formulário", command=self.clear_form).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Salvar como Nova Carta", command=self.save_card_as_new).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="DELETAR Carta", command=self.delete_selected_card, style="Danger.TButton").pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Salvar TUDO", command=self.save_database, style="Accent.TButton").pack(side=tk.RIGHT, padx=5)
        self.style = ttk.Style(self)
        self.style.configure("Accent.TButton", foreground="blue", font=('TkDefaultFont', 9, 'bold'))
        self.style.configure("Danger.TButton", foreground="red")
        
    def _collect_data_from_form(self):
        # ... (restante do código permanece o mesmo)
        card = {}
        card_type = self.entries["Tipo"].get()
        if not card_type: return None
        card['tipo'] = card_type
        card['id'] = self.entries["ID"].get()
        card['nome'] = self.entries["Nome"].get()
        card['nacao'] = self.entries["Nação"].get()
        if self.entries["Título da Nação"].get(): card['tituloNacao'] = self.entries["Título da Nação"].get()
        desc_text = self.entries["Descrição"].get("1.0", "end-1c").strip()
        if desc_text: card['descricao'] = desc_text
        for key in ['custo', 'ataque', 'vida']:
            val = self.entries[key.capitalize()].get()
            if val.isdigit(): card[key] = int(val)
        if self.image_var.get(): card['arte'] = self.image_var.get()
        condition = self.condition_combo.get()
        effects = self.effect_sequence_listbox.get(0, tk.END)
        if condition and effects: card['efeito'] = f"{condition}:{','.join(effects)}"
        keywords_list = []
        for kw, data in self.keyword_vars.items():
            if data["var"].get():
                if "entry" in data and data["entry"].get().isdigit(): keywords_list.append(f"{kw}({data['entry'].get()})")
                else: keywords_list.append(kw)
        if keywords_list: card['keywords'] = keywords_list
        if card_type == 'General':
            face2_data = {}
            if self.entries["2ª Face Nome"].get(): face2_data['nome'] = self.entries["2ª Face Nome"].get()
            if self.entries["2ª Face Ataque"].get().isdigit(): face2_data['ataque'] = int(self.entries["2ª Face Ataque"].get())
            if self.entries["2ª Face Vida"].get().isdigit(): face2_data['vida'] = int(self.entries["2ª Face Vida"].get())
            desc_face2 = self.entries["2ª Face Descrição"].get().strip()
            if desc_face2: face2_data['descricao'] = desc_face2
            if self.image_var_face2.get(): face2_data['arte'] = self.image_var_face2.get()
            if face2_data: card['segundaFace'] = face2_data
            cond_data = {}
            if self.entries["Condição Tipo"].get(): cond_data['tipo'] = self.entries["Condição Tipo"].get()
            if self.entries["Condição Valor"].get().isdigit(): cond_data['valor'] = int(self.entries["Condição Valor"].get())
            if self.entries["Condição Custo"].get().isdigit(): cond_data['custo'] = int(self.entries["Condição Custo"].get())
            desc_cond = self.entries["Condição Descrição"].get().strip()
            if desc_cond: cond_data['descricao'] = desc_cond
            if cond_data: card['condicaoTransformacao'] = cond_data
        return card

    def create_basic_info_tab(self):
        # ... (restante do código permanece o mesmo)
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Informações Básicas")
        self.entries = {}
        form_frame = ttk.Frame(tab)
        form_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        fields = {"ID": "", "Coleção": [], "Tipo": TYPE_ORDER, "Nome": "", "Nação": NATION_ORDER, "Título da Nação": "", "Custo": "", "Ataque": "", "Vida": ""}
        for i, (label, value) in enumerate(fields.items()):
            ttk.Label(form_frame, text=f"{label}:").grid(row=i, column=0, sticky="w", pady=2, padx=5)
            if label == "Coleção": self.entries[label] = ttk.Combobox(form_frame, values=value, width=58)
            elif isinstance(value, list): self.entries[label] = ttk.Combobox(form_frame, values=value, state="readonly", width=58)
            else: self.entries[label] = ttk.Entry(form_frame, width=60)
            self.entries[label].grid(row=i, column=1, sticky="ew", pady=2)
        self.entries["ID"].config(state="readonly")
        ttk.Label(form_frame, text="Descrição:").grid(row=len(fields), column=0, sticky="nw", pady=2, padx=5)
        self.entries["Descrição"] = tk.Text(form_frame, height=4, width=60)
        self.entries["Descrição"].grid(row=len(fields), column=1, sticky="ew", pady=2)
        self.image_var = tk.StringVar()
        self._create_image_selector(form_frame, "Arte:", self.image_var, len(fields)+1)
        self.art_preview_label = ttk.Label(tab, text="Preview da Arte", relief="groove", anchor="center")
        self.art_preview_label.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    def _create_image_selector(self, parent, label_text, text_variable, row_index):
        # ... (restante do código permanece o mesmo)
        ttk.Label(parent, text=label_text).grid(row=row_index, column=0, sticky="w", pady=2, padx=5)
        img_frame = ttk.Frame(parent)
        img_frame.grid(row=row_index, column=1, sticky="ew")
        entry = ttk.Entry(img_frame, textvariable=text_variable, state="readonly")
        entry.pack(side=tk.LEFT, expand=True, fill=tk.X)
        ttk.Button(img_frame, text="Procurar...", command=lambda: self.select_image(text_variable)).pack(side=tk.LEFT, padx=5)

    def select_image(self, text_variable):
        # ATUALIZADO: Adicionado .webp à lista de tipos de arquivo
        filepath = filedialog.askopenfilename(
            title="Selecione uma imagem",
            initialdir=self.images_path,
            filetypes=[("Imagens", "*.png *.jpg *.jpeg *.bmp *.webp"), ("Todos os arquivos", "*.*")]
        )
        if filepath:
            relative_path = os.path.relpath(filepath, start=os.getcwd())
            text_variable.set(relative_path.replace("\\", "/"))
            self._auto_update_card_data()

    def create_effects_tab(self):
        # ... (restante do código permanece o mesmo)
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Efeitos e Keywords")
        kw_frame = ttk.Labelframe(tab, text="Habilidades Passivas (Keywords)", padding="10")
        kw_frame.pack(fill=tk.X)
        self.keyword_vars = {}
        cols = 3
        for i, (kw, params) in enumerate(KEYWORDS.items()):
            var = tk.BooleanVar()
            chk = ttk.Checkbutton(kw_frame, text=kw, variable=var)
            chk.grid(row=i // cols, column=(i % cols) * 2, sticky="w")
            self.keyword_vars[kw] = {"var": var}
            if params:
                entry = ttk.Entry(kw_frame, width=5)
                entry.grid(row=i // cols, column=(i % cols) * 2 + 1, sticky="w", padx=5)
                self.keyword_vars[kw]["entry"] = entry
        builder_frame = ttk.Labelframe(tab, text="Construtor de Efeito Programado", padding="10")
        builder_frame.pack(fill=tk.BOTH, pady=10, expand=True)
        cond_frame = ttk.Frame(builder_frame)
        cond_frame.pack(fill=tk.X, pady=5)
        ttk.Label(cond_frame, text="Condição (Quando):", width=15).pack(side=tk.LEFT)
        self.condition_combo = ttk.Combobox(cond_frame, values=list(CONDICOES.keys()), state="readonly")
        self.condition_combo.pack(side=tk.LEFT, fill=tk.X, expand=True)
        comp_frame = ttk.Frame(builder_frame)
        comp_frame.pack(fill=tk.X, pady=5)
        ttk.Label(comp_frame, text="Efeito (O que):", width=15).pack(side=tk.LEFT)
        self.effect_combo = ttk.Combobox(comp_frame, values=list(EFEITOS.keys()), state="readonly")
        self.effect_combo.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.effect_combo.bind("<<ComboboxSelected>>", self.update_effect_params_ui)
        self.effect_params_frame = ttk.Frame(builder_frame)
        self.effect_params_frame.pack(fill=tk.X, pady=5, padx=(20, 0))
        ttk.Button(builder_frame, text="Adicionar Efeito à Sequência ↓", command=self.add_effect_to_sequence).pack(pady=5)
        seq_frame = ttk.Labelframe(builder_frame, text="Sequência de Efeitos (Ordem de Execução)", padding="10")
        seq_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        self.effect_sequence_listbox = tk.Listbox(seq_frame, height=5)
        self.effect_sequence_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        seq_buttons_frame = ttk.Frame(seq_frame)
        seq_buttons_frame.pack(side=tk.LEFT, padx=10)
        ttk.Button(seq_buttons_frame, text="Subir", command=lambda: self.move_effect_in_sequence(-1)).pack(pady=2)
        ttk.Button(seq_buttons_frame, text="Descer", command=lambda: self.move_effect_in_sequence(1)).pack(pady=2)
        ttk.Button(seq_buttons_frame, text="Remover", command=self.remove_effect_from_sequence).pack(pady=2)

    def update_effect_params_ui(self, event=None):
        # ... (restante do código permanece o mesmo)
        for widget in self.effect_params_frame.winfo_children(): widget.destroy()
        effect = self.effect_combo.get()
        if not effect: return
        params = EFEITOS.get(effect, [])
        self.effect_param_widgets = []
        for param in params:
            frame = ttk.Frame(self.effect_params_frame)
            frame.pack(fill=tk.X)
            ttk.Label(frame, text=f"  ↳ {param}:", width=10).pack(side=tk.LEFT)
            widget = None
            if param.startswith('alvo'): widget = ttk.Combobox(frame, values=ALVOS, state="readonly")
            elif param == 'keyword': widget = ttk.Combobox(frame, values=list(KEYWORDS.keys()), state="readonly")
            else: widget = ttk.Entry(frame)
            widget.pack(side=tk.LEFT, fill=tk.X, expand=True)
            self.effect_param_widgets.append(widget)

    def add_effect_to_sequence(self):
        # ... (restante do código permanece o mesmo)
        effect_name = self.effect_combo.get()
        if not effect_name: return
        param_values = [w.get() for w in self.effect_param_widgets]
        effect_string = f"{effect_name}({','.join(param_values)})"
        self.effect_sequence_listbox.insert(tk.END, effect_string)
        self._auto_update_card_data()

    def move_effect_in_sequence(self, direction):
        # ... (restante do código permanece o mesmo)
        indices = self.effect_sequence_listbox.curselection()
        if not indices: return
        idx = indices[0]
        new_idx = idx + direction
        if 0 <= new_idx < self.effect_sequence_listbox.size():
            item = self.effect_sequence_listbox.get(idx)
            self.effect_sequence_listbox.delete(idx)
            self.effect_sequence_listbox.insert(new_idx, item)
            self.effect_sequence_listbox.selection_set(new_idx)
        self._auto_update_card_data()

    def remove_effect_from_sequence(self):
        # ... (restante do código permanece o mesmo)
        indices = self.effect_sequence_listbox.curselection()
        if not indices: return
        self.effect_sequence_listbox.delete(indices[0])
        self._auto_update_card_data()

    def create_general_tab(self):
        # ... (restante do código permanece o mesmo)
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Dados de General (2ª Face)")
        main_frame = ttk.Frame(tab)
        main_frame.pack(fill=tk.BOTH, expand=True)
        form_frame = ttk.Frame(main_frame)
        form_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        face2_frame = ttk.Labelframe(form_frame, text="Segunda Face", padding="10")
        face2_frame.pack(fill=tk.X)
        self.entries["2ª Face Nome"] = self._create_form_entry(face2_frame, "Nome:", row_index=0)
        self.entries["2ª Face Ataque"] = self._create_form_entry(face2_frame, "Ataque:", row_index=1)
        self.entries["2ª Face Vida"] = self._create_form_entry(face2_frame, "Vida:", row_index=2)
        self.entries["2ª Face Descrição"] = self._create_form_entry(face2_frame, "Descrição:", row_index=3)
        self.image_var_face2 = tk.StringVar()
        self._create_image_selector(face2_frame, "Arte da 2ª Face:", self.image_var_face2, 4)
        trans_frame = ttk.Labelframe(form_frame, text="Condição de Transformação", padding="10")
        trans_frame.pack(fill=tk.X, pady=10)
        self.entries["Condição Tipo"] = self._create_form_entry(trans_frame, "Tipo:", TRANSFORMATION_CONDITIONS, 0)
        self.entries["Condição Valor"] = self._create_form_entry(trans_frame, "Valor:", row_index=1)
        self.entries["Condição Custo"] = self._create_form_entry(trans_frame, "Custo (EXP):", row_index=2)
        self.entries["Condição Descrição"] = self._create_form_entry(trans_frame, "Descrição:", row_index=3)
        self.art_preview_label_face2 = ttk.Label(main_frame, text="Preview da Arte (2ª Face)", relief="groove", anchor="center")
        self.art_preview_label_face2.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    def _create_form_entry(self, parent, label, options=None, row_index=None):
        # ... (restante do código permanece o mesmo)
        if row_index is None: row_index = len(parent.winfo_children()) // 2
        ttk.Label(parent, text=label).grid(row=row_index, column=0, sticky="w", pady=2)
        if options: entry = ttk.Combobox(parent, values=options, state="readonly", width=48)
        else: entry = ttk.Entry(parent, width=50)
        entry.grid(row=row_index, column=1, sticky="ew", pady=2)
        return entry

    def _populate_entry(self, key, value):
        # ... (restante do código permanece o mesmo)
        if value is None: value = ''
        widget = self.entries.get(key)
        if not widget: return
        current_state = str(widget.cget('state'))
        if current_state == 'readonly': widget.config(state='normal')
        if isinstance(widget, tk.Text):
            widget.delete("1.0", tk.END)
            widget.insert("1.0", str(value))
        else:
            widget.delete(0, tk.END)
            widget.insert(0, str(value))
        if current_state == 'readonly': widget.config(state='readonly')

    def update_art_preview(self, image_var, preview_label):
        # ... (restante do código permanece o mesmo)
        path = image_var.get()
        if path and os.path.exists(path):
            try:
                img = Image.open(path)
                img.thumbnail((250, 350), Image.Resampling.LANCZOS)
                photo = ImageTk.PhotoImage(img)
                preview_label.config(image=photo, text="")
                preview_label.image = photo
            except Exception:
                preview_label.config(image='', text="Erro ao carregar\nimagem")
        else:
            preview_label.config(image='', text="Sem Arte")

    def clear_form(self, clear_selection=True):
        # ... (restante do código permanece o mesmo)
        if clear_selection:
            if self.card_tree.selection():
                self.card_tree.selection_remove(self.card_tree.selection()[0])
            self.selected_card_id = None
        
        for key, widget in self.entries.items():
            if key == "Coleção": continue
            self._populate_entry(key, "")
        self.image_var.set("")
        self.image_var_face2.set("")
        self.update_art_preview(self.image_var, self.art_preview_label)
        self.update_art_preview(self.image_var_face2, self.art_preview_label_face2)
        self.condition_combo.set('')
        self.effect_combo.set('')
        self.effect_sequence_listbox.delete(0, tk.END)
        if hasattr(self, 'effect_params_frame'):
            for widget in self.effect_params_frame.winfo_children(): widget.destroy()
        if hasattr(self, 'keyword_vars'):
            for data in self.keyword_vars.values():
                data["var"].set(False)
                if "entry" in data: data["entry"].delete(0, tk.END)
        self.update_collection_combobox()

    def update_collection_combobox(self):
        # ... (restante do código permanece o mesmo)
        collections = self.populate_editions_list()
        if hasattr(self, 'entries') and "Coleção" in self.entries:
            self.entries["Coleção"]['values'] = collections
            if collections:
                current_value = self.entries["Coleção"].get()
                if not current_value or current_value not in collections:
                    self.entries["Coleção"].set(collections[0])
            else:
                self.entries["Coleção"].set("CORE")

    def generate_unique_id(self, collection_code):
        # ... (restante do código permanece o mesmo)
        max_num = 0
        prefix = f"{collection_code.upper()}_"
        for existing_id in self.existing_ids:
            if existing_id.startswith(prefix):
                try:
                    num_part = int(existing_id.split('_')[1])
                    if num_part > max_num:
                        max_num = num_part
                except (ValueError, IndexError):
                    continue
        new_num = max_num + 1
        return f"{prefix}{new_num:03d}"

    def populate_card_list(self):
        # ... (restante do código permanece o mesmo)
        for i in self.card_tree.get_children():
            self.card_tree.delete(i)
        
        cards_by_collection = {}
        for card in self.all_cards:
            card_id = card.get("id")
            if not card_id or '_' not in card_id:
                continue

            collection = card_id.split('_')[0]
            nacao = card.get("nacao", "Sem Nação")
            tipo = card.get("tipo", "Desconhecido")
            
            if collection not in cards_by_collection: cards_by_collection[collection] = {}
            if nacao not in cards_by_collection[collection]: cards_by_collection[collection][nacao] = {}
            if tipo not in cards_by_collection[collection][nacao]: cards_by_collection[collection][nacao][tipo] = []
            
            cards_by_collection[collection][nacao][tipo].append(card)

        for collection in sorted(cards_by_collection.keys()):
            collection_node = self.card_tree.insert("", "end", text=collection, open=True)
            for nacao in sorted(cards_by_collection[collection].keys(), key=lambda n: NATION_ORDER.index(n) if n in NATION_ORDER else 99):
                nation_node = self.card_tree.insert(collection_node, "end", text=nacao, open=False)
                for tipo in sorted(cards_by_collection[collection][nacao].keys(), key=lambda t: TYPE_ORDER.index(t) if t in TYPE_ORDER else 99):
                    type_node = self.card_tree.insert(nation_node, "end", text=tipo, open=False)
                    sorted_cards = sorted(cards_by_collection[collection][nacao][tipo], key=lambda x: x.get('id'))
                    for card in sorted_cards:
                        self.card_tree.insert(type_node, "end", iid=card['id'], text=f"[{card['id']}] {card.get('nome', '')}")

    def _processar_renomeacao_arte(self, art_data, card_id, card_type, art_key, id_suffix=""):
        # ATUALIZADO: Converte a imagem para .webp com compressão
        old_path = art_data.get(art_key)
        
        if not old_path or not os.path.exists(old_path):
            return old_path

        edition = card_id.split('_')[0]
        
        target_dir = os.path.join(self.images_path, edition, card_type)
        os.makedirs(target_dir, exist_ok=True)

        # O novo arquivo será sempre .webp para otimização
        new_filename = f"{card_id}{id_suffix}.webp"
        new_path = os.path.join(target_dir, new_filename)
        new_path = new_path.replace("\\", "/")

        # Se o arquivo de origem já for o de destino, não faz nada
        if old_path == new_path:
            return new_path

        try:
            # Abre a imagem, converte para WebP e salva com compressão
            with Image.open(old_path) as img:
                img.save(new_path, 'webp', quality=self.WEBP_QUALITY)
            return new_path
        except Exception as e:
            # Se a conversão falhar (ex: formato de arquivo inválido), 
            # avisa o usuário e retorna o caminho antigo sem quebrar o programa.
            print(f"AVISO: Não foi possível converter '{old_path}' para WebP. A arte não foi alterada. Erro: {e}")
            messagebox.showwarning("Erro de Conversão", f"Não foi possível converter a imagem '{os.path.basename(old_path)}' para WebP.\n\nVerifique se o arquivo é uma imagem válida (PNG, JPG, etc).\n\nA arte original será mantida.")
            return old_path
    
    def on_card_select(self, event=None):
        # ... (restante do código permanece o mesmo)
        selection = self.card_tree.selection()
        if not selection:
            return
        
        card_id = selection[0]
        
        if not re.match(r"([A-Z0-9]+)_(\d+)", card_id):
            self.clear_form(clear_selection=False)
            return

        selected_card = next((card for card in self.all_cards if card.get('id') == card_id), None)
        
        if selected_card:
            self.selected_card_id = card_id
            self._populate_form_with_card_data(selected_card)

    def _populate_form_with_card_data(self, card):
        # ... (restante do código permanece o mesmo)
        self.clear_form(clear_selection=False)
        
        self._populate_entry("ID", card.get('id'))
        if card.get('id'):
            self.entries["Coleção"].set(card.get('id').split('_')[0])
        self._populate_entry("Tipo", card.get('tipo'))
        self._populate_entry("Nome", card.get('nome'))
        self._populate_entry("Nação", card.get('nacao'))
        self._populate_entry("Título da Nação", card.get('tituloNacao'))
        self._populate_entry("Custo", card.get('custo'))
        self._populate_entry("Ataque", card.get('ataque'))
        self._populate_entry("Vida", card.get('vida'))
        self._populate_entry("Descrição", card.get('descricao'))
        self.image_var.set(card.get('arte', ''))
        self.update_art_preview(self.image_var, self.art_preview_label)

        if card.get('efeito'):
            parts = card['efeito'].split(':', 1)
            if len(parts) == 2:
                condition, effects_str = parts
                self.condition_combo.set(condition)
                effects = effects_str.split(',')
                for effect in effects:
                    self.effect_sequence_listbox.insert(tk.END, effect)
        
        if card.get('keywords'):
            for kw_string in card['keywords']:
                match = re.match(r"([A-Za-z\s]+)(?:\((\d+)\))?", kw_string)
                if match:
                    kw_name, kw_value = match.groups()
                    if kw_name in self.keyword_vars:
                        self.keyword_vars[kw_name]["var"].set(True)
                        if kw_value and "entry" in self.keyword_vars[kw_name]:
                            self.keyword_vars[kw_name]["entry"].insert(0, kw_value)
        
        if card.get('segundaFace'):
            face2 = card['segundaFace']
            self._populate_entry("2ª Face Nome", face2.get('nome'))
            self._populate_entry("2ª Face Ataque", face2.get('ataque'))
            self._populate_entry("2ª Face Vida", face2.get('vida'))
            self._populate_entry("2ª Face Descrição", face2.get('descricao'))
            self.image_var_face2.set(face2.get('arte', ''))
            self.update_art_preview(self.image_var_face2, self.art_preview_label_face2)

        if card.get('condicaoTransformacao'):
            cond = card['condicaoTransformacao']
            self._populate_entry("Condição Tipo", cond.get('tipo'))
            self._populate_entry("Condição Valor", cond.get('valor'))
            self._populate_entry("Condição Custo", cond.get('custo'))
            self._populate_entry("Condição Descrição", cond.get('descricao'))

    def delete_selected_card(self):
        # ... (restante do código permanece o mesmo)
        if not self.selected_card_id:
            messagebox.showerror("Erro", "Nenhuma carta selecionada para deletar.")
            return

        card_to_delete = next((c for c in self.all_cards if c.get('id') == self.selected_card_id), None)
        if not card_to_delete: return

        card_name = card_to_delete.get('nome', self.selected_card_id)
        if messagebox.askyesno("Confirmar Exclusão", f"Tem certeza que deseja deletar a carta '{card_name}' [{self.selected_card_id}]?\n\nEsta ação é permanente."):
            self.all_cards.remove(card_to_delete)
            self.refresh_all_views()
            messagebox.showinfo("Sucesso", f"Carta '{card_name}' deletada.\nClique em 'Salvar TUDO' para persistir a mudança.")

    def save_card_as_new(self):
        # ... (restante do código permanece o mesmo)
        new_card_data = self._collect_data_from_form()
        if not new_card_data:
            messagebox.showerror("Erro", "O campo 'Tipo' é obrigatório.")
            return
        if not self.entries["Coleção"].get():
            messagebox.showerror("Erro", "O campo 'Coleção' é obrigatório para criar uma nova carta.")
            return
            
        new_id = self.generate_unique_id(self.entries["Coleção"].get())
        new_card_data['id'] = new_id

        card_type = new_card_data.get('tipo')
        if 'arte' in new_card_data and card_type:
            novo_caminho = self._processar_renomeacao_arte(new_card_data, new_id, card_type, 'arte')
            new_card_data['arte'] = novo_caminho
        
        if 'segundaFace' in new_card_data and 'arte' in new_card_data['segundaFace'] and card_type:
            novo_caminho_f2 = self._processar_renomeacao_arte(new_card_data['segundaFace'], new_id, card_type, 'arte', id_suffix='_face2')
            new_card_data['segundaFace']['arte'] = novo_caminho_f2

        self.all_cards.append(new_card_data)
        self.existing_ids.add(new_id)
        
        self.populate_card_list()
        self.card_tree.selection_set(new_id)
        self.card_tree.see(new_id)
        self.on_card_select(None)

        messagebox.showinfo("Sucesso", f"Nova carta '{new_card_data.get('nome', '')}' criada com ID {new_id}.\nAs imagens foram convertidas e otimizadas para WebP.\nClique em 'Salvar TUDO' para persistir a mudança.")

    def _auto_update_card_data(self, event=None):
        # ... (restante do código permanece o mesmo)
        if not self.selected_card_id:
            return
        
        card_to_update = next((c for c in self.all_cards if c.get('id') == self.selected_card_id), None)
        if not card_to_update:
            return

        updated_data = self._collect_data_from_form()
        if not updated_data:
            return

        updated_data['id'] = card_to_update['id']

        card_to_update.clear()
        card_to_update.update(updated_data)

    def _bind_auto_update_events(self):
        # ... (restante do código permanece o mesmo)
        for widget in self.entries.values():
            if isinstance(widget, ttk.Combobox):
                widget.bind("<<ComboboxSelected>>", self._auto_update_card_data)
            elif isinstance(widget, tk.Text):
                widget.bind("<KeyRelease>", self._auto_update_card_data)
            else:
                widget.bind("<KeyRelease>", self._auto_update_card_data)

        for data in self.keyword_vars.values():
            data["var"].trace_add("write", lambda *args: self._auto_update_card_data())
            if "entry" in data:
                data["entry"].bind("<KeyRelease>", self._auto_update_card_data)
        
        self.condition_combo.bind("<<ComboboxSelected>>", self._auto_update_card_data)
        
        self.image_var.trace_add("write", lambda *args: self.update_art_preview(self.image_var, self.art_preview_label))
        self.image_var_face2.trace_add("write", lambda *args: self.update_art_preview(self.image_var_face2, self.art_preview_label_face2))


if __name__ == "__main__":
    app = CardCreatorApp()
    app.mainloop()