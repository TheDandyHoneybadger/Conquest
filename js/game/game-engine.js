// js/game/game-engine.js

import { Game } from './game.js';
import { showPreview } from './game-renderer.js';

// --- CLASSE DA CARTA (Versão Manual) ---
export class Carta {
    constructor(info, uid, owner) {
        this.uid = uid;
        this.owner = owner;
        Object.assign(this, info);

        // Propriedades para controle manual
        this.vidaAtual = this.vida;
        this.ataqueAtual = this.ataque;
        this.tapped = false; // "Virada" ou "Esgotada"
        this.faceDown = false; // "Virada para baixo"
        this.zona = null; // 'mao', 'campo', 'cemiterio', etc.
        this.slot = null;

        // Propriedades legadas (mantidas para compatibilidade inicial, podem ser removidas)
        this.faceAtual = 'frente';
        this.activeKeywords = new Set(this.keywords || []);
        this.podeAtacar = false;
        this.tempBuffs = [];
        this.isFrozen = false;
    }

    criarElementoHTML() {
        const container = document.createElement('div');
        container.className = 'card-container';
        container.dataset.uid = this.uid;
        
        // Aplica a classe de animação se a carta estiver virada
        if (this.tapped) {
            container.classList.add('tapped');
        }

        const cardEl = document.createElement('div');
        const tipo = this.tipo || 'Desconhecido';
        const nacao = this.nacao || 'Neutra';
        cardEl.className = `carta tipo-${tipo.toLowerCase()} nacao-${nacao.toLowerCase()}`;
        
        if (this.faceDown) {
            cardEl.innerHTML = `<div class="carta-verso-jogo"></div>`;
        } else {
            const custoHTML = this.custo !== undefined ? `<div class="atributo atributo-xp">${this.custo}</div>` : '';
            const ataqueHTML = this.ataque !== undefined ? `<div class="atributo atributo-atk">${this.ataqueAtual}</div>` : '';
            const vidaHTML = this.vida !== undefined ? `<div class="atributo atributo-vida">${this.vidaAtual}</div>` : '';
            const tituloNacao = this.tituloNacao || `${this.nacao} / ${this.tipo}`;
            
            const artPath = this.arte || 'images/placeholder.png';
            const onErrorScript = `this.onerror=null; this.src='images/placeholder.png';`;

            cardEl.innerHTML = `
                <div class="carta-face carta-face-front">
                    <div class="carta-arte"><img src="${artPath}" alt="${this.nome}" onerror="${onErrorScript}"></div>
                    <div class="template-overlay"></div>
                    <div class="nation-logo"></div>
                    <div class="carta-atributos">${custoHTML}${ataqueHTML}${vidaHTML}</div>
                    <div class="carta-nacao">${tituloNacao}</div>
                    <div class="carta-nome">${this.nome}</div>
                    <div class="carta-descricao">${this.descricao || ''}</div>
                </div>
            `;
        }

        container.appendChild(cardEl);
        
        container.addEventListener('mouseenter', () => showPreview(this));
        
        return container;
    }

    criarElementoVerso() {
        const container = document.createElement('div');
        container.className = 'card-container';
        
        const cardEl = document.createElement('div');
        cardEl.className = 'carta';
        
        const verso = document.createElement('div');
        verso.className = 'carta-verso-jogo';
        cardEl.appendChild(verso);
        container.appendChild(cardEl);

        return container;
    }
}

// --- CLASSE DO JOGADOR (Versão Manual) ---
export class Jogador {
    constructor(id, uid, generalInfo) {
        this.id = id;
        this.uid = uid;
        this.nome = `Jogador ${id}`;
        this.general = new Carta(generalInfo, `gen-${uid}`, this);
        this.experiencia = 1;
        this.deck = [];
        this.mao = [];
        this.cemiterio = [];
        this.campo = { u1: null, u2: null, u3: null, s1: null, s2: null, g: this.general };
        
        // Novo: Array para rastrear TODAS as cartas do jogador para fácil busca
        this.allCards = [this.general]; 
    }
    
    comprarCarta() {
        if (this.deck.length > 0 && this.mao.length < 10) { 
            const carta = this.deck.pop();
            this.mao.push(carta); 
        } else if (this.deck.length === 0) {
            Game.log('Sistema', `${this.nome} não tem mais cartas para comprar (fadiga)!`);
        } else {
             Game.log('Sistema', `${this.nome} tem a mão cheia e não pode comprar mais cartas.`);
        }
    }

    // Novo: Função para encontrar uma carta em qualquer zona
    findCardByUid(uid) {
        return this.allCards.find(c => c.uid === uid);
    }
}

