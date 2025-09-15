// js/game/game-actions.js

import { Game } from './game.js';
import { STATES } from './game-constants.js';

export function selecionarAtacante(carta, slot) {
    if (Game.estado !== STATES.FREE) return;
    if (carta.isFrozen) {
        Game.log('Sistema', `${carta.nome} está congelado e não pode atacar.`);
        return;
    }
    Game.atacanteSelecionado = { carta, slot, dono: carta.owner };
    Game.estado = STATES.DECLARING_ATTACK;
    Game.log('Sistema', `Você selecionou ${carta.nome} para atacar. Escolha um alvo.`);
    Game.renderizarTudo();
}

export function selecionarAlvo(alvoCarta, alvoSlot) {
    if (Game.estado !== STATES.DECLARING_ATTACK) return;
    const oponente = Game.jogadores.find(j => j.uid !== Game.onlineState.localPlayerUid);
    const unidadesComGuardaCostas = Object.values(oponente.campo).filter(c => c && c.tipo === 'Unidade' && c.activeKeywords.has('Guarda-Costas'));
    const todasUnidadesOponente = Object.values(oponente.campo).filter(c => c && c.tipo === 'Unidade');

    if (unidadesComGuardaCostas.length > 0 && !alvoCarta.activeKeywords.has('Guarda-Costas')) {
        Game.log('Sistema', 'Você deve atacar uma unidade com Guarda-Costas primeiro.');
        return;
    }

    if (alvoCarta.tipo === 'General' && todasUnidadesOponente.length > 0) {
        Game.log('Sistema', 'Você deve atacar as unidades inimigas primeiro.');
        return;
    }

    const defensor = { carta: alvoCarta, slot: alvoSlot, dono: alvoCarta.owner };
    Game.declararAtaque(Game.atacanteSelecionado, defensor);
}

export function responderBloqueio(resposta) {
    if (Game.estado !== STATES.WAITING_FOR_BLOCK && Game.estado !== STATES.CHOOSING_BLOCKER) return;
    
    const oponente = Game.jogadores[Game.jogadorComPrioridade];
    const unidadesDisponiveis = Object.values(oponente.campo).filter(c => c && c.tipo === 'Unidade');

    if (resposta === true) {
        if (unidadesDisponiveis.length === 0) {
            Game.log('Sistema', 'Nenhuma unidade disponível para interceptar.');
            responderBloqueio(false);
            return;
        }
        if (oponente.experiencia < 1) {
            Game.log('Sistema', 'XP insuficiente para interceptar.');
            responderBloqueio(false);
            return;
        }
        oponente.experiencia -= 1;
        Game.estado = STATES.CHOOSING_BLOCKER;
        Game.log('Sistema', 'Selecione uma de suas unidades para interceptar o ataque.');
    } else {
        Game.log('Sistema', 'Nenhuma interceptação declarada. O combate direto irá acontecer.');
        Game.resolverCombateFinal();
    }
    Game.renderizarTudo();
}

export function selecionarBloqueador(bloqueadorCarta, bloqueadorSlot) {
    if (Game.estado !== STATES.CHOOSING_BLOCKER) return;
    Game.combateAtual.bloqueador = { carta: bloqueadorCarta, slot: bloqueadorSlot, dono: bloqueadorCarta.owner };
    Game.log('Sistema', `${bloqueadorCarta.nome} intercepta o ataque, protegendo ${Game.combateAtual.defensor.carta.nome}.`);
    Game.resolverCombateFinal();
}

export function iniciarArrasto(evento, carta, slotId, mode){
    evento.preventDefault();
    
    const jogadorComPrioridade = Game.jogadores[Game.jogadorComPrioridade];
    const temPrioridade = jogadorComPrioridade.uid === Game.onlineState.localPlayerUid;
    
    const podeArrastar = (
        mode === 'play' && 
        temPrioridade && 
        (Game.fase === 2 || Game.fase === 4) && 
        carta.custo <= jogadorComPrioridade.experiencia
    );

    if (!podeArrastar) return;

    Game.dragState = { active: true, mode: mode, el: evento.currentTarget, data: { cartaObj: carta, slotId: slotId } };
    
    const clone = Game.dragState.el.cloneNode(true);
    clone.classList.add('arrastando');
    document.body.appendChild(clone);
    Game.dragState.clone = clone;

    Game.dragState.el.style.opacity = '0.5';

    moverElemento(evento);
    document.addEventListener('mousemove', moverElemento);
    document.addEventListener('mouseup', soltarElemento);
    destacarAlvosValidos();
}

function moverElemento(evento) {
    if (!Game.dragState.active || !Game.dragState.clone) return;
    Game.dragState.clone.style.position = 'fixed';
    Game.dragState.clone.style.zIndex = '1001';
    Game.dragState.clone.style.pointerEvents = 'none';
    Game.dragState.clone.style.left = `${evento.clientX - Game.dragState.clone.offsetWidth / 2}px`;
    Game.dragState.clone.style.top = `${evento.clientY - Game.dragState.clone.offsetHeight / 2}px`;
}

// --- FUNÇÃO CORRIGIDA ---
function soltarElemento(evento){
    if (!Game.dragState.active) return;
    
    // Restaura a aparência da carta original
    if (Game.dragState.el) Game.dragState.el.style.opacity = '1';
    
    // Encontra a zona de destino
    const elPorBaixo = document.elementFromPoint(evento.clientX, evento.clientY);
    const zonaAlvo = elPorBaixo ? elPorBaixo.closest('.zona.valida') : null;
    
    // Se o destino for válido, envia a ação de jogar a carta
    if (Game.dragState.mode === 'play' && zonaAlvo) {
        Game.jogarCarta(Game.dragState.data.cartaObj, zonaAlvo.id);
    }
    
    // Limpa os elementos visuais do "arrastar"
    if (Game.dragState.clone) document.body.removeChild(Game.dragState.clone);
    document.removeEventListener('mousemove', moverElemento);
    document.removeEventListener('mouseup', soltarElemento);
    limparDestaques();
    
    // Finaliza o estado de "arrastar"
    Game.dragState = { active: false };
    
    // A chamada para renderizarTudo() foi REMOVIDA daqui para evitar a "race condition".
    // A renderização agora acontece apenas depois de a ação ser processada pelo Game.js.
}

function destacarAlvosValidos() {
    const jogador = Game.jogadores[Game.controleAtivo]; // O jogador local
    const prefixo = `jogador-`;
    if (Game.dragState.mode === 'play') {
        const carta = Game.dragState.data.cartaObj;
        let slotsValidos = [];
        if (carta.tipo === 'Unidade') slotsValidos = ['u1', 'u2', 'u3'];
        if (carta.tipo === 'Suporte') slotsValidos = ['s1', 's2'];
        slotsValidos.forEach(slot => {
            if (!jogador.campo[slot]) {
                const zonaEl = document.getElementById(prefixo + slot);
                if (zonaEl) zonaEl.classList.add('valida');
            }
        });
    }
}


function limparDestaques() {
    document.querySelectorAll('.valida').forEach(el => el.classList.remove('valida'));
}

export function mudarFaseManualmente(targetIndex) {
    Game.mudarFaseManualmente(targetIndex);
}

export function admitirDerrota() {
    if (confirm('Tem a certeza que quer admitir a derrota nesta ronda?')) {
        Game.admitirDerrota();
    }
}