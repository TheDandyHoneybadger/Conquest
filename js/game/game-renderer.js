// js/game/game-renderer.js

import { Game } from './game.js';
import { PHASES, PHASES_ABBR, STATES } from './game-constants.js';
import { selecionarAtacante, selecionarAlvo, responderBloqueio, selecionarBloqueador, mudarFaseManualmente, admitirDerrota, iniciarArrasto } from './game-actions.js';
import { Carta } from './game-engine.js';

/**
 * Função principal que renderiza todo o estado do jogo na tela.
 */
export function renderizarTudo() {
    if (Game.estado === STATES.GAME_OVER || Game.jogadores.length < 2) return;

    const localPlayer = Game.jogadores[Game.controleAtivo];
    const opponentPlayer = Game.jogadores[(Game.controleAtivo + 1) % 2];

    renderizarLadoDoCampo('jogador', localPlayer);
    renderizarLadoDoCampo('oponente', opponentPlayer);

    renderizarMaos(localPlayer, opponentPlayer);
    renderizarPilha();
    renderizarFases();
    renderizarInterfaceCombate();
    updateScoreDisplay(Game.onlineState.scores, Game.onlineState.localPlayerUid, Game.jogadores);
}

/**
 * Renderiza um lado do campo de batalha (jogador ou oponente).
 * @param {string} prefixo - "jogador" ou "oponente".
 * @param {import('./game-engine.js').Jogador} jogador - O objeto do jogador a ser renderizado.
 */
function renderizarLadoDoCampo(prefixo, jogador) {
    // Renderiza informações do general
    const generalInfoEl = document.getElementById(`${prefixo}-general-info`);
    if (generalInfoEl) {
        const xpEl = generalInfoEl.querySelector('.general-xp');
        if (xpEl) xpEl.textContent = jogador.experiencia;
    }
    
    // Renderiza as zonas do campo
    Object.keys(jogador.campo).forEach(slot => {
        const zonaEl = document.getElementById(`${prefixo}-${slot}`);
        if (zonaEl) {
            zonaEl.innerHTML = '';
            const carta = jogador.campo[slot];
            if (carta) {
                const cartaEl = carta.criarElementoHTML();
                adicionarListenersDeCombate(cartaEl, carta, slot);
                zonaEl.appendChild(cartaEl);
            }
        }
    });
    renderizarDeckECemiterio(prefixo, jogador);
}

/**
 * Renderiza as mãos de ambos os jogadores.
 * @param {import('./game-engine.js').Jogador} localPlayer 
 * @param {import('./game-engine.js').Jogador} opponentPlayer 
 */
export function renderizarMaos(localPlayer, opponentPlayer) {
    const maoJogadorEl = document.getElementById('mao-jogador');
    maoJogadorEl.innerHTML = '';
    localPlayer.mao.forEach(carta => {
        const el = carta.criarElementoHTML();
        el.addEventListener('mousedown', (e) => iniciarArrasto(e, carta, null, 'play'));
        maoJogadorEl.appendChild(el);
    });

    const maoOponenteEl = document.getElementById('mao-oponente');
    maoOponenteEl.innerHTML = '';
    opponentPlayer.mao.forEach(carta => {
        maoOponenteEl.appendChild(carta.criarElementoVerso());
    });
}

/**
 * Renderiza as pilhas de deck e cemitério para um jogador.
 * @param {string} prefixo - "jogador" ou "oponente".
 * @param {import('./game-engine.js').Jogador} jogador 
 */
function renderizarDeckECemiterio(prefixo, jogador) {
    const deckZone = document.getElementById(`${prefixo}-deck`);
    if (deckZone) {
        deckZone.innerHTML = '';
        if (jogador.deck.length > 0) {
            const el = new Carta({}, -1, jogador).criarElementoVerso();
            const count = document.createElement('div');
            count.className = 'count-in-zone';
            count.textContent = jogador.deck.length;
            el.appendChild(count);
            deckZone.appendChild(el);
        }
    }
    
    const cemiterioZone = document.getElementById(`${prefixo}-cemiterio`);
    if (cemiterioZone) {
        cemiterioZone.innerHTML = '';
        if (jogador.cemiterio.length > 0) {
            const ultimaCarta = jogador.cemiterio[jogador.cemiterio.length - 1];
            const el = ultimaCarta.criarElementoHTML();
            const count = document.createElement('div');
            count.className = 'count-in-zone';
            count.textContent = jogador.cemiterio.length;
            el.appendChild(count);
            cemiterioZone.appendChild(el);
        }
    }
}

/**
 * Renderiza a pilha de efeitos na zona de conflito.
 */
function renderizarPilha() {
    const conflictZoneEl = document.getElementById('area-de-conflito');
    const resolveBtn = document.getElementById('passar-prioridade-btn');
    if (conflictZoneEl) conflictZoneEl.innerHTML = '';
    
    Game.pilhaDeEfeitos.slice().reverse().forEach(item => {
        if (item.tipo !== 'combate' && conflictZoneEl) { 
            const el = item.carta.criarElementoHTML();
            conflictZoneEl.appendChild(el);
        }
    });
    if (resolveBtn) {
        resolveBtn.textContent = `Passar (J${Game.jogadorComPrioridade + 1})`;
        resolveBtn.disabled = Game.controleAtivo !== Game.jogadorComPrioridade || Game.estado === STATES.RESOLVING_STACK;
        const isHidden = Game.estado === STATES.FREE || Game.estado === STATES.DECLARING_ATTACK || Game.estado === STATES.GAME_OVER;
        resolveBtn.classList.toggle('hidden', isHidden);
    }
}

/**
 * Atualiza o visual dos orbes de fase.
 */
export function renderizarFases() {
    const jogador = Game.jogadores[Game.jogadorAtual];
    if (!jogador) return;
    
    document.querySelectorAll('.phase-orb').forEach((orb, index) => {
         orb.classList.remove('active', 'jogador', 'oponente', 'clickable');
        if(index === Game.fase) {
             orb.classList.add('active', Game.jogadorAtual === Game.controleAtivo ? 'jogador' : 'oponente');
        }
        if (index > Game.fase && Game.jogadorAtual === Game.controleAtivo) {
            orb.classList.add('clickable');
        }
    });
}

/**
 * Cria os orbes de fase na UI.
 */
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

/**
 * Mostra a pré-visualização de uma carta.
 * @param {import('./game-engine.js').Carta} cardData 
 */
export function showPreview(cardData) {
    const display = document.getElementById('game-card-preview-display');
    const content = document.getElementById('game-card-preview-content');

    if (!display || !content) return; 
    
    if (cardData) {
        const cardEl = cardData.criarElementoHTML(true); // Passa true para indicar que é para a pré-visualização
        
        display.innerHTML = '';
        display.appendChild(cardEl);
        
        let fullDesc = `<h3>${cardData.nome}</h3>`;
        fullDesc += `<p><em>${cardData.nacao} / ${cardData.tipo}</em></p><hr>`;
        fullDesc += `<p>${cardData.descricao || ''}</p>`;
         if (cardData.segundaFace && cardData.condicaoTransformacao) {
            const condicaoDesc = cardData.condicaoTransformacao.descricao || 'Condição especial.';
            fullDesc += `<hr><strong>Transformação:</strong><p>${condicaoDesc}</p>`;
        }
        content.innerHTML = fullDesc;
    } else {
        display.innerHTML = '';
        content.innerHTML = '<p>Passe o rato sobre uma carta para ver os detalhes.</p>';
    }
}


/**
 * Adiciona listeners de clique para ataque e defesa.
 * @param {HTMLElement} cartaEl - O elemento HTML da carta.
 * @param {import('./game-engine.js').Carta} carta - O objeto da carta.
 * @param {string} slot - O slot da carta.
 */
function adicionarListenersDeCombate(cartaEl, carta, slot) {
    const jogadorAtivo = Game.jogadores[Game.jogadorAtual];
    const oponente = Game.jogadores[(Game.jogadorAtual + 1) % 2];

    if (Game.fase === 3 && carta.owner === jogadorAtivo && carta.podeAtacar && carta.tipo === 'Unidade' && Game.estado === STATES.FREE && Game.jogadorAtual === Game.controleAtivo) {
        cartaEl.classList.add('atacante-valido');
        cartaEl.addEventListener('click', () => selecionarAtacante(carta, slot));
    }

    if (Game.estado === STATES.DECLARING_ATTACK && carta.owner === oponente) {
        cartaEl.classList.add('alvo-valido');
        cartaEl.addEventListener('click', () => selecionarAlvo(carta, slot));
    }

    if (Game.estado === STATES.CHOOSING_BLOCKER && carta.owner.id !== jogadorAtivo.id && carta.tipo === 'Unidade') {
        cartaEl.classList.add('bloqueador-valido');
        cartaEl.addEventListener('click', () => selecionarBloqueador(carta, slot));
    }

    if (Game.atacanteSelecionado && Game.atacanteSelecionado.carta.uid === carta.uid) {
        cartaEl.classList.add('atacante-selecionado');
    }
}

/**
 * Renderiza a UI de combate (prompt de bloqueio, seta de ataque).
 */
function renderizarInterfaceCombate() {
    const promptAntigo = document.getElementById('prompt-bloqueio');
    if (promptAntigo) promptAntigo.remove();
    const setaAntiga = document.getElementById('seta-ataque');
    if (setaAntiga) setaAntiga.remove();

    if (Game.estado === STATES.WAITING_FOR_BLOCK && Game.controleAtivo === Game.jogadorComPrioridade) {
        const prompt = document.createElement('div');
        prompt.id = 'prompt-bloqueio';
        prompt.innerHTML = `
            <p>${Game.combateAtual.atacante.carta.nome} ataca ${Game.combateAtual.defensor.carta.nome}.<br>Deseja interceptar com outra unidade?</p>
            <button id="btn-bloquear-sim">Interceptar (Custo: 1 XP)</button>
            <button id="btn-bloquear-nao">Não Interceptar</button>
        `;
        document.body.appendChild(prompt);
        document.getElementById('btn-bloquear-sim').onclick = () => responderBloqueio(true);
        document.getElementById('btn-bloquear-nao').onclick = () => responderBloqueio(false);
    }

    if (Game.combateAtual || Game.estado === STATES.DECLARING_ATTACK) {
        const atacante = Game.combateAtual ? Game.combateAtual.atacante : Game.atacanteSelecionado;
        if (!atacante) return;
        
        const defensor = Game.combateAtual ? (Game.combateAtual.bloqueador || Game.combateAtual.defensor) : null;

        const atacanteEl = document.querySelector(`[data-uid='${atacante.carta.uid}']`);
        if (!atacanteEl) return;

        let endX, endY;

        if (defensor) {
            const defensorEl = document.querySelector(`[data-uid='${defensor.carta.uid}']`);
            if (defensorEl) {
                const rectDefensor = defensorEl.getBoundingClientRect();
                endX = rectDefensor.left + rectDefensor.width / 2;
                endY = rectDefensor.top + rectDefensor.height / 2;
            }
        }
        
        if (atacanteEl && endX !== undefined) {
            const field = document.getElementById('field');
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, 'svg');
            svg.id = 'seta-ataque';
            
            const rectField = field.getBoundingClientRect();
            const rectAtacante = atacanteEl.getBoundingClientRect();

            const startX = rectAtacante.left + rectAtacante.width / 2 - rectField.left;
            const startY = rectAtacante.top + rectAtacante.height / 2 - rectField.top;
            
            endX -= rectField.left;
            endY -= rectField.top;

            svg.innerHTML = `
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="red" />
                    </marker>
                </defs>
                <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="red" stroke-width="3" marker-end="url(#arrowhead)" />
            `;
            field.appendChild(svg);
        }
    }
}

export function updateScoreDisplay(scores, localPlayerUid, jogadores) {
    if (!scores) return;
    const jogadorLocal = jogadores.find(j => j.uid === localPlayerUid);
    const oponente = jogadores.find(j => j.uid !== localPlayerUid);

    const jogadorScoreEl = document.getElementById('jogador-score-display');
    const oponenteScoreEl = document.getElementById('oponente-score-display');

    if (jogadorLocal && jogadorScoreEl) jogadorScoreEl.textContent = scores[jogadorLocal.uid] || 0;
    if (oponente && oponenteScoreEl) oponenteScoreEl.textContent = scores[oponente.uid] || 0;
}

export function showDiceRollResult(roomData, localPlayerUid) {
    const overlay = document.getElementById('dice-roll-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    if (!roomData.playerOrder || roomData.playerOrder.length < 2) return;

    const [p1_uid, p2_uid] = roomData.playerOrder;
    const p1_data = roomData.players[p1_uid];
    const p2_data = roomData.players[p2_uid];

    const p1_el = document.getElementById('dice-roll-p1');
    const p2_el = document.getElementById('dice-roll-p2');
    const winner_el = document.getElementById('dice-roll-winner');

    if (p1_el && p1_data) {
        p1_el.querySelector('.dice-player-name').textContent = p1_data.displayName;
        p1_el.querySelector('.dice-result').textContent = roomData.diceRolls[p1_uid] || '?';
    }
    if (p2_el && p2_data) {
        p2_el.querySelector('.dice-player-name').textContent = p2_data.displayName;
        p2_el.querySelector('.dice-result').textContent = roomData.diceRolls[p2_uid] || '?';
    }

    if (roomData.startingPlayerUid && winner_el) {
        const winnerName = roomData.players[roomData.startingPlayerUid]?.displayName || 'Jogador';
        winner_el.textContent = `${winnerName} começa!`;
    } else if(winner_el) {
        winner_el.textContent = '';
    }
}

export function hideDiceRoll() {
    const overlay = document.getElementById('dice-roll-overlay');
    if (overlay) overlay.classList.add('hidden');
}

export function setupUI() {
    criarOrbesDeFase();
    
    const admitirDerrotaBtn = document.getElementById('admitir-derrota-btn');
    if (admitirDerrotaBtn) {
        admitirDerrotaBtn.onclick = () => admitirDerrota();
    }

    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            Game.enviarMensagemChat(e.target.value);
            e.target.value = '';
        }
    });
    document.getElementById('passar-prioridade-btn').addEventListener('click', () => Game.passarPrioridade());
}

export function showEndMatchOverlay(winnerName, localPlayerWon) {
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.className = 'overlay';
    
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2>Fim da Partida</h2>
            <p>${localPlayerWon ? 'Você venceu!' : 'Você perdeu.'}</p>
            <p>O vencedor é ${winnerName}!</p>
            <button id="btn-voltar-menu-final">Voltar ao Menu Principal</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.getElementById('btn-voltar-menu-final').onclick = () => {
        window.location.reload();
    };
}