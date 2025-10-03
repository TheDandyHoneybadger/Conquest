// js/game/game-renderer.js

import { Game } from './game.js';
import { PHASES, PHASES_ABBR } from './game-constants.js';
import { admitirDerrota, mudarFaseManualmente } from './game-actions.js';
import { Carta } from './game-engine.js';
import { showContextMenu, hideContextMenu } from '../ui/context-menu.js';

export function renderizarTudo() {
    if (!Game.isGameRunning || Game.jogadores.length < 2) return;

    const localPlayer = Game.jogadores[Game.controleAtivo];
    const opponentPlayer = Game.jogadores[(Game.controleAtivo + 1) % 2];
    const isMyTurn = Game.jogadores[Game.jogadorAtual].uid === Game.onlineState.localPlayerUid;

    renderizarLadoDoCampo('jogador', localPlayer);
    renderizarLadoDoCampo('oponente', opponentPlayer);

    renderizarMaos(localPlayer, opponentPlayer);
    renderizarZonaDeConflito();
    renderizarFases();
    updateScoreDisplay(Game.onlineState.scores, Game.onlineState.localPlayerUid, Game.jogadores);
    
    const passarTurnoBtn = document.getElementById('passar-turno-btn');
    if (passarTurnoBtn) {
        passarTurnoBtn.disabled = !isMyTurn;
        passarTurnoBtn.textContent = isMyTurn ? "Passar Turno" : `Turno de ${opponentPlayer.nome}`;
    }
}

function renderizarLadoDoCampo(prefixo, jogador) {
    renderizarPlayerStats(prefixo, jogador);

    Object.keys(jogador.campo).forEach(slot => {
        const zonaEl = document.getElementById(`${prefixo}-${slot}`);
        if (zonaEl) {
            const carta = jogador.campo[slot];
            zonaEl.innerHTML = '';
            if (carta) {
                const cartaEl = carta.criarElementoHTML();
                if (carta.isAnimating) cartaEl.style.visibility = 'hidden';
                
                carta.zona = 'campo';
                cartaEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showContextMenu(e, carta, slot, 'campo');
                });
                cartaEl.addEventListener('mouseenter', (e) => showPreview(carta));
                adicionarListenersDeAtaque(cartaEl, carta);

                zonaEl.appendChild(cartaEl);
            }
        }
    });
    renderizarDeckECemiterio(prefixo, jogador);
}

export function renderizarMaos(localPlayer, opponentPlayer) {
    const maoJogadorEl = document.getElementById('mao-jogador');
    maoJogadorEl.innerHTML = '';
    localPlayer.mao.forEach(carta => {
        carta.zona = 'mao';
        const el = carta.criarElementoHTML();
        if (carta.isAnimating) el.style.visibility = 'hidden';
        
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, carta, null, 'mao');
        });
        el.addEventListener('mouseenter', (e) => showPreview(carta));
        maoJogadorEl.appendChild(el);
    });

    const maoOponenteEl = document.getElementById('mao-oponente');
    maoOponenteEl.innerHTML = '';
    opponentPlayer.mao.forEach(carta => {
        const el = carta.criarElementoVerso();
        maoOponenteEl.appendChild(el);
    });
}

function adicionarListenersDeAtaque(cartaEl, carta) {
    if (Game.estado !== 'ATACANDO') return;

    const jogadorAtivo = Game.jogadores[Game.jogadorAtual];
    const isMyTurn = jogadorAtivo.uid === Game.onlineState.localPlayerUid;

    if (!isMyTurn) return;

    if (carta.owner === jogadorAtivo && carta.tipo !== 'Suporte') {
        cartaEl.classList.add('atacante-valido');
        cartaEl.addEventListener('click', () => Game.iniciarAtaqueComCarta(carta));
    }

    if (Game.atacanteSelecionado && carta.uid === Game.atacanteSelecionado.uid) {
        cartaEl.classList.add('atacante-selecionado');
    }

    if (Game.atacanteSelecionado && carta.owner !== jogadorAtivo) {
        cartaEl.classList.add('alvo-valido');
        cartaEl.addEventListener('click', () => Game.selecionarAlvo(carta));
    }
}

function renderizarDeckECemiterio(prefixo, jogador) {
    const deckZone = document.getElementById(`${prefixo}-deck`);
    if (deckZone) {
        const newDeckZone = deckZone.cloneNode(false);
        deckZone.parentNode.replaceChild(newDeckZone, deckZone);
        
        if (jogador.deck.length > 0) {
            const el = new Carta({}, -1, jogador).criarElementoVerso();
            const count = document.createElement('div');
            count.className = 'count-in-zone';
            count.textContent = jogador.deck.length;
            el.appendChild(count);
            newDeckZone.appendChild(el);
        }
        
        newDeckZone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, null, prefixo, 'deck');
        });
    }
    
    const cemiterioZone = document.getElementById(`${prefixo}-cemiterio`);
    if (cemiterioZone) {
        const newCemZone = cemiterioZone.cloneNode(false);
        cemiterioZone.parentNode.replaceChild(newCemZone, cemiterioZone);

        if (jogador.cemiterio.length > 0) {
            const ultimaCarta = jogador.cemiterio[jogador.cemiterio.length - 1];
            const el = ultimaCarta.criarElementoHTML();
            const count = document.createElement('div');
            count.className = 'count-in-zone';
            count.textContent = jogador.cemiterio.length;
            el.appendChild(count);
            newCemZone.appendChild(el);
        }
        
        newCemZone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, null, prefixo, 'cemiterio');
        });
    }
}

function renderizarZonaDeConflito() {
    const conflictZoneEl = document.getElementById('area-de-conflito');
    if (!conflictZoneEl) return;
    
    // Lógica para mostrar/esconder a zona de conflito
    if (Game.zonaDeConflito.length > 0) {
        conflictZoneEl.classList.add('visible');
    } else {
        conflictZoneEl.classList.remove('visible');
    }
    
    conflictZoneEl.innerHTML = '';
    Game.zonaDeConflito.forEach(carta => {
        carta.zona = 'conflito';
        const cartaEl = carta.criarElementoHTML();
        if (carta.isAnimating) {
            cartaEl.style.visibility = 'hidden';
        }
        cartaEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, carta, null, 'conflito');
        });
        cartaEl.addEventListener('mouseenter', (e) => showPreview(carta));
        adicionarListenersDeAtaque(cartaEl, carta);
        conflictZoneEl.appendChild(cartaEl);
    });
}

export function renderizarFases() {
    const jogador = Game.jogadores[Game.jogadorAtual];
    if (!jogador) return;
    document.querySelectorAll('.phase-orb').forEach((orb, index) => {
        orb.classList.remove('active', 'jogador', 'oponente', 'clickable');
        if (index === Game.fase) {
            orb.classList.add('active', Game.jogadorAtual === Game.controleAtivo ? 'jogador' : 'oponente');
        }
        if (Game.jogadores[Game.jogadorAtual].uid === Game.onlineState.localPlayerUid) {
            orb.classList.add('clickable');
        }
    });
}
export function criarOrbesDeFase() {
    const track = document.getElementById('phase-track');
    if (!track) return;
    track.innerHTML = '';
    PHASES_ABBR.forEach((abbr, index) => {
        const orb = document.createElement('div');
        orb.className = 'phase-orb';
        orb.id = `phase-${index}`;
        orb.textContent = abbr;
        orb.title = PHASES[index];
        orb.addEventListener('click', () => mudarFaseManualmente(index));
        track.appendChild(orb);
    });
}
export function showPreview(cardData) {
    const display = document.getElementById('game-card-preview-display');
    const content = document.getElementById('game-card-preview-content');
    if (!display || !content) return;
    if (cardData) {
        const cardEl = cardData.criarElementoHTML(true);
        display.innerHTML = '';
        display.appendChild(cardEl);
        let fullDesc = `<h3>${cardData.nome}</h3>`;
        fullDesc += `<p><em>${cardData.nacao} / ${cardData.tipo}</em></p><hr>`;
        fullDesc += `<p>${cardData.descricao || ''}</p>`;
        content.innerHTML = fullDesc;
    } else {
        display.innerHTML = '';
        content.innerHTML = '<p>Passe o mouse sobre uma carta para ver os detalhes.</p>';
    }
}
export function updateScoreDisplay(scores, localPlayerUid, jogadores) {
    if (!scores || !jogadores || jogadores.length < 2) return;
    const localPlayerScore = scores[localPlayerUid] || 0;
    const opponentUid = jogadores.find(j => j.uid !== localPlayerUid)?.uid;
    const opponentScore = opponentUid ? (scores[opponentUid] || 0) : 0;
    const jogadorScoreEl = document.getElementById('jogador-score');
    const oponenteScoreEl = document.getElementById('oponente-score');
    if (jogadorScoreEl) jogadorScoreEl.textContent = localPlayerScore;
    if (oponenteScoreEl) oponenteScoreEl.textContent = opponentScore;
}
export function setupUI() {
    criarOrbesDeFase();
    
    document.body.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu(true);
        }
        if (Game.estado === 'ATACANDO') {
            const cardElement = e.target.closest('.card-container');
            const fieldElement = e.target.closest('#field');
            if (!cardElement && fieldElement) {
                Game.cancelarAtaque();
            }
        }
    });

    const mainFieldContainer = document.querySelector('.main-field-container');
    if (mainFieldContainer) {
        mainFieldContainer.addEventListener('mouseleave', () => showPreview(null));
    }


    const admitirDerrotaBtn = document.getElementById('admitir-derrota-btn');
    if (admitirDerrotaBtn) admitirDerrotaBtn.onclick = () => admitirDerrota();
    
    const passarTurnoBtn = document.getElementById('passar-turno-btn');
    if (passarTurnoBtn) passarTurnoBtn.addEventListener('click', () => Game.passarTurno());

    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    
    const sendChatMessage = () => {
        if (chatInput && chatInput.value.trim()) {
            Game.enviarMensagemChat(chatInput.value.trim());
            chatInput.value = '';
        }
    };

    if (chatSendBtn) chatSendBtn.onclick = sendChatMessage;
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

    const popup = document.getElementById('zone-popup');
    const closeBtn = document.getElementById('zone-popup-close-btn');
    if (popup && closeBtn) {
        closeBtn.onclick = () => popup.classList.add('hidden');
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.add('hidden');
            }
        });
    }

    const logContainer = document.getElementById('game-log');
    if (logContainer) {
        logContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('card-link')) {
                e.preventDefault();
                const cardUID = e.target.dataset.uid;
                const card = Game.findCardByUid(cardUID);
                if (card) {
                    showPreview(card);
                }
            }
        });
    }
}
function renderizarPlayerStats(prefixo, jogador) {
    const statsEl = document.getElementById(`${prefixo}-stats-display`);
    if (!statsEl || !jogador.general) return;
    const vidaEl = statsEl.querySelector('.stat-vida');
    const xpEl = statsEl.querySelector('.stat-xp');
    if (vidaEl) vidaEl.textContent = jogador.general.vidaAtual;
    if (xpEl) xpEl.textContent = jogador.experiencia;
}

export function animateCardMove(fromRect, carta) {
    const clone = carta.criarElementoHTML();
    clone.classList.add('card-clone');
    clone.style.width = `${fromRect.width}px`;
    clone.style.height = `${fromRect.height}px`;
    clone.style.left = `${fromRect.left}px`;
    clone.style.top = `${fromRect.top}px`;
    document.body.appendChild(clone);

    carta.isAnimating = true;
    renderizarTudo();

    requestAnimationFrame(() => {
        // CORREÇÃO: O seletor agora procura especificamente por um .card-container
        const toEl = document.querySelector(`.card-container[data-uid="${carta.uid}"]`);
        if (!toEl) {
            clone.style.opacity = '0';
            clone.addEventListener('transitionend', () => {
                if (document.body.contains(clone)) document.body.removeChild(clone);
                carta.isAnimating = false;
                renderizarTudo();
            }, { once: true });
            return;
        }
        
        const toRect = toEl.getBoundingClientRect();

        requestAnimationFrame(() => {
            clone.style.left = `${toRect.left}px`;
            clone.style.top = `${toRect.top}px`;
            clone.style.width = `${toRect.width}px`;
            clone.style.height = `${toRect.height}px`;
        });

        clone.addEventListener('transitionend', () => {
            if (document.body.contains(clone)) {
                document.body.removeChild(clone);
            }
            carta.isAnimating = false;
            renderizarTudo();
        }, { once: true });
    });
}


export function showZonePopup(title, cardArray, zoneType) {
    const popup = document.getElementById('zone-popup');
    const titleEl = document.getElementById('zone-popup-title');
    const cardsContainer = document.getElementById('zone-popup-cards');

    if (!popup || !titleEl || !cardsContainer) return;

    titleEl.textContent = `${title} (${cardArray.length})`;
    cardsContainer.innerHTML = '';

    const reversedCardArray = [...cardArray].reverse();

    reversedCardArray.forEach(card => {
        const cardEl = card.criarElementoHTML();
        
        cardEl.addEventListener('mouseenter', (e) => showPreview(card));
        cardEl.addEventListener('mouseleave', () => showPreview(null)); 

        cardEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, card, null, zoneType);
        });
        
        cardsContainer.appendChild(cardEl);
    });

    popup.classList.remove('hidden');
}

export function showDiceRollResult(roomData) {
    const overlay = document.getElementById('dice-roll-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    if (!roomData.playerOrder || roomData.playerOrder.length < 2) return;

    const [p1_uid, p2_uid] = roomData.playerOrder;
    const p1_data = roomData.players[p1_uid];
    const p2_data = roomData.players[p2_uid];

    const playerNameEl = document.getElementById('dice-player-name');
    const opponentNameEl = document.getElementById('dice-opponent-name');
    const playerResultEl = document.getElementById('dice-player-result');
    const opponentResultEl = document.getElementById('dice-opponent-result');
    const titleEl = document.getElementById('dice-roll-title');

    if (p1_data && p2_data) {
        playerNameEl.textContent = p1_data.displayName;
        opponentNameEl.textContent = p2_data.displayName;
        playerResultEl.textContent = roomData.diceRolls[p1_uid] || '?';
        opponentResultEl.textContent = roomData.diceRolls[p2_uid] || '?';
    }

    if (roomData.startingPlayerUid && titleEl) {
        const winnerName = roomData.players[roomData.startingPlayerUid]?.displayName || 'Jogador';
        titleEl.textContent = `${winnerName} começa!`;
    } else if (titleEl) {
        titleEl.textContent = 'A decidir quem começa...';
    }
}
export function hideDiceRoll() {
    const overlay = document.getElementById('dice-roll-overlay');
    if (overlay) overlay.classList.add('hidden');
}

export function logMessage(sender, message, card = null) {
    const logContainer = document.getElementById('game-log');
    if (logContainer) {
        const messageElement = document.createElement('p');
        let finalMessage = message;

        if (card) {
            const cardLink = `<a href="#" class="card-link" data-uid="${card.uid}">${card.nome}</a>`;
            finalMessage = message.replace(card.nome, cardLink);
        }

        messageElement.innerHTML = `<strong>${sender}:</strong> ${finalMessage}`;
        logContainer.appendChild(messageElement);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}