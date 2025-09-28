// js/ui/context-menu.js

import { Game } from '../game/game.js';

const contextMenu = document.getElementById('context-menu');
let menuTimer = null;
let targetCard = null;
let targetSlot = null;

const menuOptions = {
    campo: [
        { label: 'Atacar com', action: 'attackWith', requires: { phase: 3 } }, // Fase de Combate
        { label: 'Mover para...', submenu: [
            { label: 'Zona de Conflito', action: 'moveTo', destination: 'conflito' },
            { label: 'Cemitério', action: 'moveTo', destination: 'cemiterio' },
            { label: 'Mão', action: 'moveTo', destination: 'mao' },
        ]},
        { label: 'Virar para Baixo/Cima', action: 'flipCard' },
        { label: 'Alterar Stats...', action: 'promptStats' },
    ],
    mao: [
        { label: 'Jogar Carta', action: 'playCard' },
        { label: 'Mover para...', submenu: [
            { label: 'Cemitério', action: 'moveTo', destination: 'cemiterio' },
        ]},
    ],
    conflito: [
        { label: 'Resolver para o Campo...', action: 'moveTo', destination: 'campo' },
        { label: 'Mover para...', submenu: [
            { label: 'Cemitério', action: 'moveTo', destination: 'cemiterio' },
            { label: 'Mão', action: 'moveTo', destination: 'mao' },
        ]},
        { label: 'Alterar Stats...', action: 'promptStats' },
    ]
};

function createMenuItem(option) {
    const item = document.createElement('div');
    item.className = 'context-menu-item';
    item.textContent = option.label;

    if (option.requires) {
        const { phase } = option.requires;
        const isMyTurn = Game.jogadores[Game.jogadorAtual]?.uid === Game.onlineState.localPlayerUid;
        if (Game.fase !== phase || !isMyTurn) {
            item.style.display = 'none';
        }
    }

    if (option.submenu) {
        item.classList.add('submenu-parent');
        const submenu = document.createElement('div');
        submenu.className = 'context-menu submenu';
        option.submenu.forEach(subOption => {
            submenu.appendChild(createMenuItem(subOption));
        });
        item.appendChild(submenu);
    } else {
        item.addEventListener('click', () => {
            handleAction(option.action, { destination: option.destination });
        });
    }

    return item;
}

function handleAction(action, details = {}) {
    if (!targetCard) return;

    let payload = {
        cardUID: targetCard.uid,
        cardName: targetCard.nome,
        fromZone: targetCard.zona,
        fromSlot: targetSlot,
        ...details
    };
    
    switch (action) {
        case 'playCard':
            payload.destination = 'conflito';
            Game.enviarAcao('MANUAL_MOVE_CARD', payload);
            break;
        case 'moveTo':
            if (details.destination === 'campo') {
                const slot = prompt('Para qual slot? (u1, u2, u3, s1, s2)');
                if (slot && ['u1', 'u2', 'u3', 's1', 's2'].includes(slot)) {
                    payload.destinationSlot = slot;
                    Game.enviarAcao('MANUAL_MOVE_CARD', payload);
                }
            } else {
                Game.enviarAcao('MANUAL_MOVE_CARD', payload);
            }
            break;
        case 'flipCard':
            Game.enviarAcao('MANUAL_FLIP_CARD', payload);
            break;
        case 'promptStats':
            const newAtk = prompt(`Novo ataque para ${targetCard.nome}:`, targetCard.ataqueAtual);
            const newVida = prompt(`Nova vida para ${targetCard.nome}:`, targetCard.vidaAtual);
            if (newAtk !== null && newVida !== null && !isNaN(newAtk) && !isNaN(newVida)) {
                payload.atk = parseInt(newAtk, 10);
                payload.vida = parseInt(newVida, 10);
                Game.enviarAcao('MANUAL_CHANGE_STATS', payload);
            }
            break;
        case 'attackWith':
            Game.iniciarAtaqueComCarta(targetCard);
            break;
    }
    hideContextMenu(true);
}

export function showContextMenu(event, card, slot) {
    clearTimeout(menuTimer);
    
    const localPlayer = Game.jogadores[Game.controleAtivo];
    if (card.owner !== localPlayer) return;

    targetCard = card;
    targetSlot = slot;

    contextMenu.innerHTML = '';
    const options = menuOptions[card.zona] || menuOptions.campo;
    options.forEach(option => {
        contextMenu.appendChild(createMenuItem(option));
    });

    contextMenu.style.display = 'block';
    const cardRect = event.currentTarget.getBoundingClientRect();
    
    const menuHeight = contextMenu.offsetHeight;
    const menuWidth = contextMenu.offsetWidth;

    let top = cardRect.top - menuHeight - 5;
    if (top < 0) { // Se o menu sair do ecrã por cima
        top = cardRect.bottom + 5;
    }

    let left = cardRect.left + (cardRect.width / 2) - (menuWidth / 2);
    if (left < 0) left = 5; // Evita sair pela esquerda
    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 5; // Evita sair pela direita


    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
}

export function hideContextMenu(immediate = false) {
    clearTimeout(menuTimer);
    if (immediate) {
        contextMenu.style.display = 'none';
    } else {
        menuTimer = setTimeout(() => {
            contextMenu.style.display = 'none';
        }, 300);
    }
}

contextMenu.addEventListener('mouseenter', () => clearTimeout(menuTimer));
contextMenu.addEventListener('mouseleave', () => hideContextMenu());

