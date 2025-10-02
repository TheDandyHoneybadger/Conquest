// js/ui/context-menu.js

import { Game } from '../game/game.js';

const contextMenu = document.getElementById('context-menu');
let menuTimer = null;
let targetCard = null;
let targetSlot = null;
let targetZoneType = null;
let isMenuVisible = false;

const baseOptions = {
    attack: { label: 'Atacar com', action: 'attackWith', requires: { phase: 3 } },
    transform: { label: 'Transformar', action: 'transformGeneral' },
    play: { label: 'Jogar Carta', action: 'playCard' },
    activate: { label: 'Ativar Habilidade', action: 'activateAbility'},
    statsAtk: { type: 'row', items: [
        { label: '+1 ATK', action: 'statChange', details: { stat: 'ataque', amount: 1 } },
        { label: '-1 ATK', action: 'statChange', details: { stat: 'ataque', amount: -1 } },
    ]},
    statsVida: { type: 'row', items: [
        { label: '+1 Vida', action: 'statChange', details: { stat: 'vida', amount: 1 } },
        { label: '-1 Vida', action: 'statChange', details: { stat: 'vida', amount: -1 } },
    ]}
};

function createMenuItem(option) {
    if (option.type === 'row') {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'context-menu-row';
        option.items.forEach(itemOption => {
            rowContainer.appendChild(createMenuItem(itemOption));
        });
        return rowContainer;
    }

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
    
    if (option.submenu && option.submenu.length > 0) {
        item.classList.add('submenu-parent');
        const submenuEl = document.createElement('div');
        submenuEl.className = 'context-menu submenu';
        option.submenu.forEach(subOption => {
            submenuEl.appendChild(createMenuItem(subOption));
        });
        item.appendChild(submenuEl);
    } else {
         item.addEventListener('click', () => {
            const details = Object.assign({ destination: option.destination }, option.details);
            handleAction(option.action, details);
        });
    }

    return item;
}

async function handleAction(action, details = {}) {
    // Ações que não têm uma carta alvo (como clicar no deck)
    if (!targetCard && ['openDeck', 'shuffleDeck', 'millTopCard'].includes(action)) {
        const playerPrefix = targetSlot; // Neste caso, targetSlot foi usado para passar 'jogador' ou 'oponente'
        
        switch (action) {
            case 'openDeck': {
                const player = playerPrefix === 'jogador' ? Game.jogadores[Game.controleAtivo] : Game.jogadores[(Game.controleAtivo + 1) % 2];
                if (player) {
                    const { showZonePopup } = await import('../game/game-renderer.js');
                    showZonePopup(`${player.nome} - Deck`, player.deck, 'deck');
                }
                break;
            }
            case 'shuffleDeck':
                Game.enviarAcao('MANUAL_SHUFFLE_DECK', {});
                break;
            case 'millTopCard':
                Game.enviarAcao('MANUAL_MILL_TOP_CARD', {});
                break;
        }
        hideContextMenu(true);
        return;
    }


    if (!targetCard) return;

    let payload = {
        cardUID: targetCard.uid,
        cardName: targetCard.nome,
        fromZone: targetZoneType, // 'mao', 'campo', 'cemiterio', 'deck', etc.
        fromSlot: targetSlot,
        ...details
    };
    
    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
            delete payload[key];
        }
    });

    switch (action) {
        case 'playCard':
            payload.destination = 'conflito';
            Game.enviarAcao('MANUAL_MOVE_CARD', payload);
            break;
        case 'moveTo':
            Game.enviarAcao('MANUAL_MOVE_CARD', payload);
            break;
        case 'transformGeneral':
            Game.enviarAcao('MANUAL_TRANSFORM_GENERAL', payload);
            break;
        case 'activateAbility':
            Game.enviarAcao('MANUAL_ACTIVATE_ABILITY', payload);
            break;
        case 'statChange':
            payload.atk = targetCard.ataqueAtual;
            payload.vida = targetCard.vidaAtual;
            if (details.stat === 'ataque') {
                payload.atk += details.amount;
            } else if (details.stat === 'vida') {
                payload.vida += details.amount;
            }
            Game.enviarAcao('MANUAL_CHANGE_STATS', payload);
            break;
        case 'attackWith':
            Game.iniciarAtaqueComCarta(targetCard);
            break;
    }
    hideContextMenu(true);
}

export function showContextMenu(event, card, slot, zoneType) {
    clearTimeout(menuTimer);
    
    targetCard = card;
    targetSlot = slot;
    targetZoneType = zoneType;

    const localPlayer = Game.jogadores[Game.controleAtivo];
    if (card && card.owner !== localPlayer) return;

    contextMenu.innerHTML = '';
    
    const options = [];
    const moveSubmenu = [];
    const localPlayerField = localPlayer.campo;
    
    if (zoneType === 'campo') {
        options.push(baseOptions.attack);
        if (card.tipo === 'General') options.push(baseOptions.transform);
        options.push(baseOptions.activate);
        options.push(baseOptions.statsAtk, baseOptions.statsVida);
        
        moveSubmenu.push({ label: 'Conflito', action: 'moveTo', destination: 'conflito' });
        moveSubmenu.push({ label: 'Mão', action: 'moveTo', destination: 'mao' });
        moveSubmenu.push({ label: 'Cemitério', action: 'moveTo', destination: 'cemiterio' });
    } 
    else if (zoneType === 'mao') {
        options.push(baseOptions.play);
        moveSubmenu.push({ label: 'Cemitério', action: 'moveTo', destination: 'cemiterio' });
    }
    else if (zoneType === 'conflito') {
        options.push(baseOptions.statsAtk, baseOptions.statsVida);
        
        const slots = card.tipo === 'Unidade' ? ['u1', 'u2', 'u3'] : ['s1', 's2'];
        slots.forEach(s => {
            if (!localPlayerField[s]) {
                moveSubmenu.push({ label: `Campo (${s.toUpperCase()})`, action: 'moveTo', destination: 'campo', details: { destinationSlot: s } });
            }
        });
        moveSubmenu.push({ label: 'Mão', action: 'moveTo', destination: 'mao' });
        moveSubmenu.push({ label: 'Cemitério', action: 'moveTo', destination: 'cemiterio' });
    }
    else if (zoneType === 'cemiterio' || (zoneType === 'deck' && card)) {
        moveSubmenu.push({ label: 'Mão', action: 'moveTo', destination: 'mao' });
        const slots = card.tipo === 'Unidade' ? ['u1', 'u2', 'u3'] : ['s1', 's2'];
        slots.forEach(s => {
             if (!localPlayerField[s]) {
                moveSubmenu.push({ label: `Campo (${s.toUpperCase()})`, action: 'moveTo', destination: 'campo', details: { destinationSlot: s } });
            }
        });
        if(zoneType === 'deck') moveSubmenu.push({ label: 'Cemitério', action: 'moveTo', destination: 'cemiterio' });
        if(zoneType === 'cemiterio') moveSubmenu.push({ label: 'Deck (Topo)', action: 'moveTo', destination: 'deck' });
    }
    else if (slot === 'deck' && !card) {
        const playerPrefix = zoneType; // 'jogador' ou 'oponente'
        if (playerPrefix === 'jogador') {
            options.push({ label: 'Abrir Deck', action: 'openDeck'});
            options.push({ label: 'Embaralhar', action: 'shuffleDeck'});
            options.push({ label: 'Enviar carta do topo para o descarte', action: 'millTopCard'});
        }
        targetSlot = playerPrefix;
    }

    if (moveSubmenu.length > 0 && card?.tipo !== 'General') {
        options.push({ label: 'Mover Para', action: 'submenu', submenu: moveSubmenu });
    }

    if(options.length === 0) return;

    options.forEach(option => {
        contextMenu.appendChild(createMenuItem(option));
    });

    contextMenu.style.display = 'block';
    
    const targetRect = event.currentTarget.getBoundingClientRect();
    const menuHeight = contextMenu.offsetHeight;
    const menuWidth = contextMenu.offsetWidth;

    let top = targetRect.top - menuHeight - 5;
    if (top < 0) top = targetRect.bottom + 5;

    let left = targetRect.left + (targetRect.width / 2) - (menuWidth / 2);
    if (left < 0) left = 5;
    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 5;

    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
    
    requestAnimationFrame(() => {
        contextMenu.style.opacity = '1';
        contextMenu.style.transform = 'translateY(0)';
        isMenuVisible = true;
    });
}

export function hideContextMenu(immediate = false) {
    clearTimeout(menuTimer);
    if (immediate) {
        contextMenu.style.display = 'none';
        contextMenu.style.opacity = '0';
        contextMenu.style.transform = 'translateY(10px)';
        isMenuVisible = false;
    } else {
        menuTimer = setTimeout(() => {
            if (!isMenuVisible) return;
            
            contextMenu.style.opacity = '0';
            contextMenu.style.transform = 'translateY(10px)';

            const onTransitionEnd = () => {
                if (!isMenuVisible) {
                    contextMenu.style.display = 'none';
                }
                contextMenu.removeEventListener('transitionend', onTransitionEnd);
            };
            
            contextMenu.addEventListener('transitionend', onTransitionEnd);
            isMenuVisible = false;

        }, 300);
    }
}

contextMenu.addEventListener('mouseenter', () => clearTimeout(menuTimer));
contextMenu.addEventListener('mouseleave', () => hideContextMenu());