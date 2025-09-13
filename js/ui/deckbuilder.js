// js/ui/deckbuilder.js

import { databaseCartas } from '../../data/database.js';
import { auth, db } from '../firebase/firebase-config.js';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

export const DeckBuilder = {
    // --- Configurações ---
    MAX_DECK_SIZE: 39,
    MAX_COPIES: 3,

    // --- Estado Interno ---
    allDecks: {},
    activeDeckName: null,
    principalDeckName: null,
    currentDeck: {
        general: null,
        cards: []
    },
    elements: {},
    flippedCards: new Set(),

    // --- MÉTODOS DE INICIALIZAÇÃO ---
    async init() {
        this.cacheDOMElements();
        if (!this.elements.saveDeckBtn) {
            console.error("Deckbuilder DOM não está pronto.");
            return;
        }
        await this.loadAllDecks();
        this.bindEventListeners();
        this.renderAll();
    },

    cacheDOMElements() {
        this.elements = {
            previewDisplay: document.querySelector('.card-preview-display'),
            previewDescription: document.getElementById('deckbuilder-card-preview-descricao'),
            saveDeckBtn: document.getElementById('save-deck-btn'),
            deckSelect: document.getElementById('deck-select'),
            newDeckBtn: document.getElementById('new-deck-btn'),
            renameDeckBtn: document.getElementById('rename-deck-btn'),
            deleteDeckBtn: document.getElementById('delete-deck-btn'),
            clearDeckBtn: document.getElementById('clear-deck-btn'),
            setActiveDeckBtn: document.getElementById('set-active-deck-btn'),
            collectionSelect: document.getElementById('collection-select'),
            collectionScrollArea: document.querySelector('.collection-scroll-area'),
            deckCount: document.getElementById('deck-count'),
            generalArea: document.getElementById('general-display-area'),
            deckListArea: document.getElementById('deck-list-area'),
            popupOverlay: document.getElementById('popup-overlay'),
            popupTitle: document.getElementById('popup-title'),
            popupInput: document.getElementById('popup-input'),
            popupConfirmBtn: document.getElementById('popup-confirm-btn'),
            popupCancelBtn: document.getElementById('popup-cancel-btn')
        };
    },
    
    bindEventListeners() {
        this.elements.collectionSelect.addEventListener('change', () => this.renderCollection());
        this.elements.saveDeckBtn.addEventListener('click', () => this.saveCurrentDeck());
        this.elements.clearDeckBtn.addEventListener('click', () => this.clearDeck());
        this.elements.deckSelect.addEventListener('change', (e) => this.loadDeck(e.target.value));
        this.elements.newDeckBtn.addEventListener('click', () => this.createNewDeck());
        this.elements.renameDeckBtn.addEventListener('click', () => this.renameDeck());
        this.elements.deleteDeckBtn.addEventListener('click', () => this.deleteDeck());
        this.elements.setActiveDeckBtn.addEventListener('click', () => this.setPrincipalDeck());

        const generalDropZone = this.elements.generalArea;
        generalDropZone.addEventListener('dragover', (e) => { e.preventDefault(); generalDropZone.classList.add('drag-over'); });
        generalDropZone.addEventListener('dragenter', (e) => { e.preventDefault(); generalDropZone.classList.add('drag-over'); });
        generalDropZone.addEventListener('dragleave', () => { generalDropZone.classList.remove('drag-over'); });
        generalDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            generalDropZone.classList.remove('drag-over');
            const cardId = e.dataTransfer.getData('text/plain');
            const cardData = databaseCartas.find(c => c.id === cardId);
            if (cardData && cardData.tipo === 'General') {
                this.setGeneral(cardId);
            }
        });
    },

    // --- FUNÇÕES DE DADOS (AGORA COM FIRESTORE) ---

    async loadAllDecks() {
        const user = auth.currentUser;
        if (!user) {
            this.allDecks = {};
            this.renderAll();
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            this.principalDeckName = userSnap.data().principalDeckName || null;
        }

        this.allDecks = {};
        const decksRef = collection(db, 'users', user.uid, 'decks');
        const querySnapshot = await getDocs(decksRef);
        querySnapshot.forEach((doc) => {
            this.allDecks[doc.id] = doc.data();
        });

        if (Object.keys(this.allDecks).length === 0) {
            await this.createNewDeck('Meu Primeiro Deck', true);
        } else {
            this.activeDeckName = this.principalDeckName || Object.keys(this.allDecks)[0];
            this.loadDeck(this.activeDeckName);
        }
    },

    async saveCurrentDeck() {
        const user = auth.currentUser;
        if (!user || !this.activeDeckName) {
            alert("Você precisa estar logado e ter um deck selecionado.");
            return;
        }
        if (!this.currentDeck.general) {
            alert("Seu deck precisa de um General.");
            return;
        }
        if (this.currentDeck.cards.length !== this.MAX_DECK_SIZE) {
            alert(`Seu deck precisa ter exatamente ${this.MAX_DECK_SIZE} cartas (atualmente tem ${this.currentDeck.cards.length}).`);
            return;
        }

        try {
            const deckRef = doc(db, 'users', user.uid, 'decks', this.activeDeckName);
            await setDoc(deckRef, this.currentDeck);
            this.allDecks[this.activeDeckName] = JSON.parse(JSON.stringify(this.currentDeck));
            alert(`Deck "${this.activeDeckName}" salvo com sucesso na nuvem!`);
        } catch (error) {
            console.error("Erro ao salvar deck:", error);
            alert("Houve um erro ao salvar o deck.");
        }
    },

    async createNewDeck(defaultName = null, shouldLoad = false) {
        const user = auth.currentUser;
        if (!user) return;

        const callback = async (newName) => {
            if (!newName) return;
            if (this.allDecks[newName]) {
                alert('Já existe um deck com esse nome.');
                return;
            }
            const newDeckData = { name: newName, general: null, cards: [] };
            const deckRef = doc(db, 'users', user.uid, 'decks', newName);
            await setDoc(deckRef, newDeckData);
            
            this.allDecks[newName] = newDeckData;
            this.activeDeckName = newName;
            this.loadDeck(newName);
        };

        if (defaultName) {
            await callback(defaultName);
        } else {
            this.showPopup('Criar Novo Deck', 'Novo Deck', callback);
        }
    },

    async deleteDeck() {
        const user = auth.currentUser;
        if (!user || !this.activeDeckName) return;

        if (Object.keys(this.allDecks).length <= 1) {
            alert("Você não pode deletar seu único deck.");
            return;
        }

        if (confirm(`Tem certeza que deseja deletar o deck "${this.activeDeckName}" da nuvem?`)) {
            const deckRef = doc(db, 'users', user.uid, 'decks', this.activeDeckName);
            await deleteDoc(deckRef);

            delete this.allDecks[this.activeDeckName];
            this.activeDeckName = Object.keys(this.allDecks)[0];
            this.loadDeck(this.activeDeckName);
        }
    },
    
    async renameDeck() {
        const user = auth.currentUser;
        if (!user || !this.activeDeckName) return;
        
        this.showPopup('Renomear Deck', this.activeDeckName, async (newName) => {
            if (!newName || newName === this.activeDeckName) return;
            if (this.allDecks[newName]) {
                alert('Já existe um deck com esse nome.');
                return;
            }

            const oldDeckName = this.activeDeckName;
            const deckData = this.allDecks[oldDeckName];
            deckData.name = newName;

            const newDeckRef = doc(db, 'users', user.uid, 'decks', newName);
            await setDoc(newDeckRef, deckData);
            
            const oldDeckRef = doc(db, 'users', user.uid, 'decks', oldDeckName);
            await deleteDoc(oldDeckRef);
            
            delete this.allDecks[oldDeckName];
            this.allDecks[newName] = deckData;
            this.activeDeckName = newName;
            this.updateDeckSelectionUI();
        });
    },

    async setPrincipalDeck() {
        const user = auth.currentUser;
        if (!user || !this.activeDeckName) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { principalDeckName: this.activeDeckName }, { merge: true });

            this.principalDeckName = this.activeDeckName;
            alert(`Deck "${this.activeDeckName}" definido como principal!`);
            this.updateDeckSelectionUI();
        } catch (error) {
            console.error("Erro ao definir deck principal:", error);
            alert("Houve um erro ao definir o deck principal.");
        }
    },

    loadDeck(deckName) {
        if (this.allDecks[deckName]) {
            this.activeDeckName = deckName;
            this.currentDeck = JSON.parse(JSON.stringify(this.allDecks[deckName]));
            this.renderAll();
        }
    },

    // --- FUNÇÕES DE RENDERIZAÇÃO E UI ---

    renderAll() {
        this.populateEditionFilter();
        this.updateDeckView();
        this.updateDeckSelectionUI();
        this.showPreview(null);
    },
    
    createCardElement(cardData) {
        if (!cardData) return null;
        const container = document.createElement('div');
        container.className = 'card-container';
        container.dataset.cardId = cardData.id;

        const cardEl = document.createElement('div');
        const tipo = cardData.tipo || 'Desconhecido';
        const nacao = cardData.nacao || 'Neutra';
        cardEl.className = `carta tipo-${tipo.toLowerCase()} nacao-${nacao.toLowerCase()}`;

        const frontFace = document.createElement('div');
        frontFace.className = 'carta-face carta-face-front';
        const custoHTML = cardData.custo !== undefined ? `<div class="atributo atributo-xp">${cardData.custo}</div>` : '';
        const ataqueHTML = cardData.ataque !== undefined ? `<div class="atributo atributo-atk">${cardData.ataque}</div>` : '';
        const vidaHTML = cardData.vida !== undefined ? `<div class="atributo atributo-vida">${cardData.vida}</div>` : '';
        const tituloNacao = cardData.tituloNacao || `${cardData.nacao} / ${cardData.tipo}`;
        
        // CORREÇÃO: Garante fallback para placeholder se a arte falhar
        const artPath = cardData.arte || 'images/placeholder.png';
        const onErrorScript = `this.onerror=null; this.src='images/placeholder.png';`;

        frontFace.innerHTML = `
            <div class="carta-arte"><img src="${artPath}" alt="${cardData.nome}" onerror="${onErrorScript}"></div>
            <div class="template-overlay"></div>
            <div class="nation-logo"></div>
            <div class="carta-atributos">${custoHTML}${ataqueHTML}${vidaHTML}</div>
            <div class="carta-nacao">${tituloNacao}</div>
            <div class="carta-nome">${cardData.nome}</div>
            <div class="carta-descricao">${cardData.descricao || ''}</div>
        `;
        cardEl.appendChild(frontFace);

        if (cardData.segundaFace) {
            const backFaceData = cardData.segundaFace;
            const backFace = document.createElement('div');
            backFace.className = 'carta-face carta-face-back';
            const backAtkHTML = backFaceData.ataque !== undefined ? `<div class="atributo atributo-atk">${backFaceData.ataque}</div>` : '';
            const backVidaHTML = backFaceData.vida !== undefined ? `<div class="atributo atributo-vida">${backFaceData.vida}</div>` : '';
            const backArtPath = backFaceData.arte || 'images/placeholder.png';

            backFace.innerHTML = `
                <div class="carta-arte"><img src="${backArtPath}" alt="${backFaceData.nome}" onerror="${onErrorScript}"></div>
                <div class="template-overlay"></div>
                <div class="nation-logo"></div>
                <div class="carta-atributos">${backAtkHTML}${backVidaHTML}</div>
                <div class="carta-nacao">General Transformado</div>
                <div class="carta-nome">${backFaceData.nome}</div>
                <div class="carta-descricao">${backFaceData.descricao || ''}</div>
            `;
            cardEl.appendChild(backFace);
        }

        container.appendChild(cardEl);
        return container;
    },
    
    renderCollection() {
        this.elements.collectionScrollArea.innerHTML = '';
        const selectedEdition = this.elements.collectionSelect.value;
        let initialCards = databaseCartas;
        if (selectedEdition !== 'all') {
            initialCards = databaseCartas.filter(card => card.id && card.id.startsWith(selectedEdition + '_'));
        }

        const generalNation = this.currentDeck.general ? databaseCartas.find(c => c.id === this.currentDeck.general)?.nacao : null;
        const filteredCards = initialCards.filter(card => {
            return !generalNation || card.nacao === 'Neutro' || card.nacao === generalNation;
        });

        const typesInOrder = ['General', 'Unidade', 'Ação', 'Suporte'];
        const typeHeaders = { General: 'Generais', Unidade: 'Unidades', Ação: 'Ações', Suporte: 'Suportes' };
        const nationOrder = ["Aethel", "Kragmar", "Sylvanis", "Noxaeterna", "Leviathus", "Neutro"];

        typesInOrder.forEach(type => {
            const cardsOfType = filteredCards.filter(card => card.tipo === type);
            
            if (cardsOfType.length > 0) {
                const typeHeader = document.createElement('h4');
                typeHeader.textContent = typeHeaders[type];
                this.elements.collectionScrollArea.appendChild(typeHeader);

                if (type === 'General') {
                    const grid = document.createElement('div');
                    grid.className = 'collection-grid';
                    cardsOfType.forEach(card => {
                        const cardEl = this.createCardElement(card);
                        cardEl.draggable = true;
                        cardEl.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', card.id));
                        cardEl.addEventListener('click', (e) => this.toggleCardFlip(e));
                        cardEl.addEventListener('mouseenter', () => this.showPreview(card));
                        grid.appendChild(cardEl);
                    });
                    this.elements.collectionScrollArea.appendChild(grid);
                } else {
                    const cardsByNation = {};
                    cardsOfType.forEach(card => {
                        if (!cardsByNation[card.nacao]) cardsByNation[card.nacao] = [];
                        cardsByNation[card.nacao].push(card);
                    });

                    nationOrder.forEach(nation => {
                        if (cardsByNation[nation] && cardsByNation[nation].length > 0) {
                            const nationHeader = document.createElement('h5');
                            nationHeader.textContent = nation;
                            this.elements.collectionScrollArea.appendChild(nationHeader);
                            
                            const grid = document.createElement('div');
                            grid.className = 'collection-grid';
                            cardsByNation[nation].forEach(card => {
                                const cardEl = this.createCardElement(card);
                                const count = this.currentDeck.cards.filter(id => id === card.id).length;
                                if (count >= this.MAX_COPIES) {
                                    cardEl.classList.add('disabled');
                                }
                                cardEl.addEventListener('click', () => this.addCardToDeck(card.id));
                                cardEl.addEventListener('mouseenter', () => this.showPreview(card));
                                grid.appendChild(cardEl);
                            });
                            this.elements.collectionScrollArea.appendChild(grid);
                        }
                    });
                }
            }
        });
    },
    
    updateDeckView() {
        this.elements.generalArea.innerHTML = '<span>Arraste um General aqui</span>';
        if (this.currentDeck.general) {
            const generalData = databaseCartas.find(c => c.id === this.currentDeck.general);
            if (generalData) {
                const cardEl = this.createCardElement(generalData);
                cardEl.addEventListener('click', (e) => this.toggleCardFlip(e));
                cardEl.addEventListener('dblclick', () => this.setGeneral(null)); 
                cardEl.addEventListener('mouseenter', () => this.showPreview(generalData));
                this.elements.generalArea.innerHTML = '';
                this.elements.generalArea.appendChild(cardEl);
            }
        }
        
        this.elements.deckListArea.innerHTML = '';
        const cardCounts = this.currentDeck.cards.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        const sortedCardData = Object.keys(cardCounts)
            .map(id => databaseCartas.find(c => c.id === id))
            .filter(Boolean)
            .sort((a, b) => (a.custo || 0) - (b.custo || 0) || a.nome.localeCompare(b.nome));

        sortedCardData.forEach(cardData => {
            const cardEl = this.createCardElement(cardData);
            cardEl.addEventListener('click', () => this.removeCardFromDeck(cardData.id));
            cardEl.addEventListener('mouseenter', () => this.showPreview(cardData));
            const countBadge = document.createElement('div');
            countBadge.className = 'card-count-badge';
            countBadge.textContent = `x${cardCounts[cardData.id]}`;
            cardEl.appendChild(countBadge);
            this.elements.deckListArea.appendChild(cardEl);
        });

        this.elements.deckCount.textContent = `Deck (${this.currentDeck.cards.length} / ${this.MAX_DECK_SIZE})`;
        this.renderCollection();
    },

    showPreview(cardData) {
        if (!cardData) {
            this.elements.previewDisplay.innerHTML = '';
            this.elements.previewDescription.innerHTML = 'Passe o mouse sobre uma carta para ver os detalhes.';
            return;
        }
        
        const previewCardEl = this.createCardElement(cardData);
        if (cardData.tipo === 'General') {
            previewCardEl.addEventListener('click', (e) => this.toggleCardFlip(e));
        }

        const isFlipped = this.flippedCards.has(cardData.id);
        if (isFlipped) {
            previewCardEl.querySelector('.carta').classList.add('is-flipped');
        }

        this.elements.previewDisplay.innerHTML = '';
        this.elements.previewDisplay.appendChild(previewCardEl);
        
        let descriptionHTML = '';
        const dataToShow = (isFlipped && cardData.segundaFace) ? cardData.segundaFace : cardData;

        descriptionHTML = `<strong>${dataToShow.nome}</strong><hr>`;
        descriptionHTML += `<p>${dataToShow.descricao || '<i>Esta carta não possui descrição.</i>'}</p>`;
        
        if (cardData.segundaFace) {
            descriptionHTML += `<hr><strong>Transformação:</strong><p>${cardData.condicaoTransformacao.descricao}</p>`;
        }
        
        this.elements.previewDescription.innerHTML = descriptionHTML;
    },

    toggleCardFlip(event) {
        const cardContainer = event.currentTarget;
        const cardElement = cardContainer.querySelector('.carta');
        const cardId = cardContainer.dataset.cardId;
        if (!cardElement || !cardId) return;

        cardElement.classList.toggle('is-flipped');
        const isNowFlipped = cardElement.classList.contains('is-flipped');

        if (isNowFlipped) this.flippedCards.add(cardId);
        else this.flippedCards.delete(cardId);
        
        const cardData = databaseCartas.find(c => c.id === cardId);
        this.showPreview(cardData);
    },
    
    setGeneral(cardId) {
        const oldGeneralNation = this.currentDeck.general ? databaseCartas.find(c => c.id === this.currentDeck.general)?.nacao : null;
        const newGeneralNation = cardId ? databaseCartas.find(c => c.id === cardId)?.nacao : null;
        if (oldGeneralNation !== newGeneralNation) {
            this.currentDeck.cards = this.currentDeck.cards.filter(id => {
                const card = databaseCartas.find(c => c.id === id);
                return card && (card.nacao === newGeneralNation || card.nacao === 'Neutro');
            });
        }
        this.currentDeck.general = cardId;
        this.updateDeckView();
    },

    addCardToDeck(cardId) {
        if (!this.currentDeck.general) {
            alert("Por favor, escolha um General primeiro.");
            return;
        }
        if (this.currentDeck.cards.length >= this.MAX_DECK_SIZE) return;
        const count = this.currentDeck.cards.filter(id => id === cardId).length;
        if (count >= this.MAX_COPIES) return;

        this.currentDeck.cards.push(cardId);
        this.updateDeckView();
    },

    removeCardFromDeck(cardId) {
        const index = this.currentDeck.cards.lastIndexOf(cardId);
        if (index > -1) {
            this.currentDeck.cards.splice(index, 1);
            this.updateDeckView();
        }
    },
    
    clearDeck() {
        if (confirm('Tem certeza que deseja limpar o deck atual?')) {
            this.currentDeck.general = null;
            this.currentDeck.cards = [];
            this.flippedCards.clear();
            this.updateDeckView();
        }
    },

    updateDeckSelectionUI() {
        this.elements.deckSelect.innerHTML = '';
        const principalDeck = this.principalDeckName;
        Object.keys(this.allDecks).sort().forEach(name => {
            const isPrincipal = name === principalDeck ? ' (Principal)' : '';
            const option = new Option(name + isPrincipal, name);
            if (name === this.activeDeckName) {
                option.selected = true;
            }
            this.elements.deckSelect.add(option);
        });
    },

    populateEditionFilter() {
        if (!this.elements.collectionSelect) return;
        const editions = [...new Set(databaseCartas.map(c => c.id.split('_')[0]))];
        this.elements.collectionSelect.innerHTML = '<option value="all">Todas as Edições</option>';
        editions.forEach(e => {
            this.elements.collectionSelect.innerHTML += `<option value="${e}">${e}</option>`;
        });
    },
    
    showPopup(title, value, callback) {
        this.elements.popupTitle.textContent = title;
        this.elements.popupInput.value = value;
        this.elements.popupOverlay.classList.remove('hidden');
        this.elements.popupInput.focus();
        this.elements.popupConfirmBtn.onclick = async () => {
            const newValue = this.elements.popupInput.value.trim();
            if (newValue) {
                await callback(newValue);
                this.elements.popupOverlay.classList.add('hidden');
            } else {
                alert("O nome não pode ser vazio.");
            }
        };
        this.elements.popupCancelBtn.onclick = () => {
            this.elements.popupOverlay.classList.add('hidden');
        };
    },
};