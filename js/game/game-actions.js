// js/game/game-actions.js

import { Game } from './game.js';

export function iniciarArrasto(evento, carta, slotId, mode){
    evento.preventDefault();
    
    // Simplificado: qualquer carta que pertença ao jogador local pode ser arrastada
    const localPlayer = Game.jogadores[Game.controleAtivo];
    if (carta.owner.uid !== localPlayer.uid) {
        return;
    }

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
    Game.dragState.clone.style.left = `${evento.clientX - Game.dragState.clone.offsetWidth / 2}px`;
    Game.dragState.clone.style.top = `${evento.clientY - Game.dragState.clone.offsetHeight / 2}px`;
}

function soltarElemento(evento){
    if (!Game.dragState.active) return;
    
    if (Game.dragState.el) Game.dragState.el.style.opacity = '1';
    
    const elPorBaixo = document.elementFromPoint(evento.clientX, evento.clientY);
    const zonaAlvo = elPorBaixo ? elPorBaixo.closest('.zona.valida') : null;
    
    if (Game.dragState.mode === 'play' && zonaAlvo) {
        Game.jogarCarta(Game.dragState.data.cartaObj, zonaAlvo.id);
    }
    
    if (Game.dragState.clone) document.body.removeChild(Game.dragState.clone);
    document.removeEventListener('mousemove', moverElemento);
    document.removeEventListener('mouseup', soltarElemento);
    limparDestaques();
    
    Game.dragState = { active: false };
}

function destacarAlvosValidos() {
    const jogador = Game.jogadores[Game.controleAtivo];
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

