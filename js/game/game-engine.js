// js/game-engine.js

import { Game } from './game.js';
import { showPreview } from './game-renderer.js';
import { parseEffectString } from './game-logic.js';

// --- ENGINE DE EFEITOS ---
export const EffectEngine = {
    effects: {
        damage: (params, context) => {
            const amount = parseInt(params[0], 10);
            const targets = Game.resolveAlvo(params[1], context);
            targets.forEach(target => {
                if (!target || typeof target.vidaAtual === 'undefined') return;
                target.vidaAtual -= amount;
                Game.log('Efeito', `${context.sourceCard.nome} causa ${amount} de dano a ${target.nome}.`);
                if (target.vidaAtual <= 0) {
                    Game.checarMortes([{ carta: target, dono: target.owner, slot: target.slot }]);
                }
            });
        },
        heal: (params, context) => {
            const amount = parseInt(params[0], 10);
            const targets = Game.resolveAlvo(params[1], context);
            targets.forEach(target => {
                if (!target || typeof target.vidaAtual === 'undefined') return;
                target.vidaAtual += amount;
                if (target.vidaAtual > target.vida) target.vidaAtual = target.vida;
                Game.log('Efeito', `${context.sourceCard.nome} cura ${amount} de vida de ${target.nome}.`);
            });
        },
        draw: (params, context) => {
            const player = context.sourceCard.owner;
            const amount = parseInt(params[0], 10);
            Game.log('Efeito', `${player.nome} compra ${amount} carta(s).`);
            for (let i = 0; i < amount; i++) {
                player.comprarCarta();
            }
        },
        buff: (params, context) => {
            const atk = parseInt(params[0], 10);
            const vida = parseInt(params[1], 10);
            const targets = Game.resolveAlvo(params[2], context);
            targets.forEach(target => {
                if (!target || typeof target.ataque === 'undefined') return;
                target.ataque += atk;
                target.vida += vida;
                target.ataqueAtual += atk;
                target.vidaAtual += vida;
                Game.log('Efeito', `${target.nome} recebe +${atk}/+${vida} permanentemente.`);
            });
        },
        tempBuff: (params, context) => {
            const atk = parseInt(params[0], 10);
            const vida = parseInt(params[1], 10);
            const targets = Game.resolveAlvo(params[2], context);
            targets.forEach(target => {
                if (!target || typeof target.ataqueAtual === 'undefined') return;
                target.ataqueAtual += atk;
                target.vidaAtual += vida; 
                target.tempBuffs.push({ atk, vida });
                Game.log('Efeito', `${target.nome} recebe +${atk}/+${vida} até ao final do turno.`);
            });
        },
        gainExp: (params, context) => {
            const amount = parseInt(params[0], 10);
            context.sourceCard.owner.experiencia += amount;
            Game.log('Efeito', `${context.sourceCard.owner.nome} ganha ${amount} de EXP.`);
        },
        // --- LÓGICA DE UID CORRIGIDA ---
        spawn: (params, context) => {
            const tokenName = params[0];
            const tokenAtk = parseInt(params[1], 10);
            const tokenVida = parseInt(params[2], 10);
            const player = context.sourceCard.owner;
            const emptySlots = ['u1', 'u2', 'u3'].filter(slot => !player.campo[slot]);
            if (emptySlots.length > 0) {
                const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
                const tokenInfo = { nome: tokenName, tipo: 'Unidade', nacao: player.general.nacao, ataque: tokenAtk, vida: tokenVida, descricao: 'Uma criatura invocada.' };
                const tokenUID = `${player.uid}_token_${Game.proximoUID++}`;
                const token = new Carta(tokenInfo, tokenUID, player);
                player.campo[randomSlot] = token;
                token.slot = randomSlot;
                Game.log('Efeito', `${player.nome} cria um ${tokenName} ${tokenAtk}/${tokenVida}.`);
                EffectEngine.trigger('onFriendlyUnitPlay', { sourceCard: token, player: player });
            } else {
                 Game.log('Sistema', `Não há espaço para criar ${tokenName}.`);
            }
        },
        // --- FIM DA CORREÇÃO ---
        returnToHand: (params, context) => {
            const targets = Game.resolveAlvo(params[0], context);
            targets.forEach(target => {
                if (!target || !target.owner) return;
                const owner = target.owner;
                const slot = target.slot;
                if (slot && owner.campo[slot] === target) {
                    if (owner.mao.length < 10) {
                        owner.mao.push(target);
                        owner.campo[slot] = null;
                        Game.log('Efeito', `${target.nome} retorna para a mão de ${owner.nome}.`);
                    } else {
                        Game.log('Sistema', `Mão de ${owner.nome} está cheia. ${target.nome} é destruído.`);
                        Game.checarMortes([{ carta: target, dono: owner, slot: slot }]);
                    }
                }
            });
        },
        destroy: (params, context) => {
            const targets = Game.resolveAlvo(params[0], context);
            targets.forEach(target => {
                 if (!target || !target.owner) return;
                 if (target.tipo === 'Suporte') {
                     const owner = target.owner;
                     const slot = target.slot;
                     if (slot && owner.campo[slot] === target) {
                         owner.cemiterio.push(target);
                         owner.campo[slot] = null;
                         Game.log('Efeito', `O suporte ${target.nome} foi destruído.`);
                     }
                 } else { 
                    Game.checarMortes([{ carta: target, dono: target.owner, slot: target.slot }]);
                 }
            });
        },
        addKeyword: (params, context) => {
            const keyword = params[0];
            const targets = Game.resolveAlvo(params[1], context);
            targets.forEach(target => {
                if (!target || !target.activeKeywords) return;
                target.activeKeywords.add(keyword);
                Game.log('Efeito', `${target.nome} ganha a habilidade ${keyword}.`);
            });
        },
        discard: (params, context) => {
            const amount = parseInt(params[0], 10);
            const targets = Game.resolveAlvo(params[1], context); 
            targets.forEach(player => {
                if (player && player.mao) {
                    Game.log('Efeito', `${player.nome} descarta ${amount} carta(s).`);
                    for (let i = 0; i < amount && player.mao.length > 0; i++) {
                        const cardIndex = Math.floor(Math.random() * player.mao.length);
                        const discardedCard = player.mao.splice(cardIndex, 1)[0];
                        player.cemiterio.push(discardedCard);
                    }
                }
            });
        },
        setStats: (params, context) => {
            const atk = parseInt(params[0], 10);
            const vida = parseInt(params[1], 10);
            const targets = Game.resolveAlvo(params[2], context);
            targets.forEach(target => {
                if (!target) return;
                target.ataque = atk;
                target.vida = vida;
                target.ataqueAtual = atk;
                target.vidaAtual = vida;
                Game.log('Efeito', `${target.nome} tem os seus status definidos para ${atk}/${vida}.`);
            });
        },
        freeze: (params, context) => {
            const targets = Game.resolveAlvo(params[0], context);
            targets.forEach(target => {
                if(target && target.tipo === 'Unidade') {
                    target.isFrozen = true;
                    Game.log('Efeito', `${target.nome} está congelado e não pode atacar.`);
                }
            });
        },
        removeKeywords: (params, context) => {
             const targets = Game.resolveAlvo(params[0], context);
             targets.forEach(target => {
                if(target && target.activeKeywords) {
                    target.activeKeywords.clear();
                    Game.log('Efeito', `${target.nome} perdeu todas as suas habilidades.`);
                }
            });
        }
    },

    execute: (action, context) => {
        if (EffectEngine.effects[action.name]) {
            EffectEngine.effects[action.name](action.params, context);
        } else {
            console.warn(`Efeito não implementado: ${action.name}`);
        }
    },

    trigger: (eventName, context) => {
        const activePlayer = Game.jogadores[Game.jogadorAtual];
        const nonActivePlayer = Game.jogadores[(Game.jogadorAtual + 1) % 2];
        if (!activePlayer || !nonActivePlayer) return;

        const triggeredEffects = [];
        [activePlayer, nonActivePlayer].forEach(player => {
            Object.values(player.campo).forEach(card => {
                if (card && card.efeitoParsed && card.efeitoParsed.condition === eventName) {
                    if (eventName.includes('Play') && context.sourceCard.uid === card.uid) {
                        return;
                    }

                    triggeredEffects.push({
                        player: player,
                        card: card,
                        actions: card.efeitoParsed.actions
                    });
                }
            });
        });

        if (triggeredEffects.length > 0) {
            triggeredEffects.sort((a, b) => (a.player === activePlayer ? -1 : 1));
            Game.log('Sistema', `Evento '${eventName}' disparou ${triggeredEffects.length} efeito(s).`);
            triggeredEffects.forEach(trigger => {
                trigger.actions.forEach(action => {
                    Game.adicionarNaPilha({
                        tipo: 'efeito',
                        carta: trigger.card,
                        dono: trigger.player,
                        contexto: { action: action, sourceCard: trigger.card, triggerContext: context }
                    });
                });
            });
        }
    }
};

// --- CLASSE DA CARTA ---
export class Carta {
    constructor(info, uid, owner) {
        this.uid = uid;
        this.owner = owner;
        Object.assign(this, info);
        this.vidaAtual = this.vida;
        this.ataqueAtual = this.ataque;
        this.faceAtual = 'frente';
        this.activeKeywords = new Set(this.keywords || []);
        this.efeitoParsed = this.efeito ? parseEffectString(this.efeito) : null;
        this.podeAtacar = false;
        this.tempBuffs = [];
        this.isFrozen = false;
        this.slot = null;
    }

    transformar() {
        if (this.faceAtual === 'frente' && this.segundaFace) {
            this.faceAtual = 'verso';
            const { nome, ataque, vida, descricao, efeito, keywords } = this.segundaFace;
            Object.assign(this, { nome, ataque, vida, descricao, efeito: efeito || '', keywords: keywords || [] });
            this.ataqueAtual = ataque;
            this.vidaAtual = vida;
            this.activeKeywords = new Set(this.keywords);
            this.efeitoParsed = this.efeito ? parseEffectString(this.efeito) : null;
        }
    }
    
    criarElementoHTML() {
        const container = document.createElement('div');
        container.className = 'card-container';
        container.dataset.uid = this.uid;
        
        const cardEl = document.createElement('div');
        const tipo = this.tipo || 'Desconhecido';
        const nacao = this.nacao || 'Neutra';
        cardEl.className = `carta tipo-${tipo.toLowerCase()} nacao-${nacao.toLowerCase()}`;
        
        const frontFace = document.createElement('div');
        frontFace.className = 'carta-face carta-face-front';
        
        const custoHTML = this.custo !== undefined ? `<div class="atributo atributo-xp">${this.custo}</div>` : '';
        const ataqueHTML = this.ataque !== undefined ? `<div class="atributo atributo-atk">${this.ataqueAtual}</div>` : '';
        const vidaHTML = this.vida !== undefined ? `<div class="atributo atributo-vida">${this.vidaAtual}</div>` : '';
        const tituloNacao = this.tituloNacao || `${this.nacao} / ${this.tipo}`;
        
        const artPath = this.arte || 'images/placeholder.png';
        const onErrorScript = `this.onerror=null; this.src='images/placeholder.png';`;

        frontFace.innerHTML = `
            <div class="carta-arte"><img src="${artPath}" alt="${this.nome}" onerror="${onErrorScript}"></div>
            <div class="template-overlay"></div>
            <div class="nation-logo"></div>
            <div class="carta-atributos">${custoHTML}${ataqueHTML}${vidaHTML}</div>
            <div class="carta-nacao">${tituloNacao}</div>
            <div class="carta-nome">${this.nome}</div>
            <div class="carta-descricao">${this.descricao || ''}</div>
        `;
        cardEl.appendChild(frontFace);
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

// --- CLASSE DO JOGADOR ---
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
        this.stats = { aliadosMortos: 0, danoCausado: 0, cartasCompradas: 0 };
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
}