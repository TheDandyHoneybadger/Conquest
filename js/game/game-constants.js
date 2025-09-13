// js/game/game-constants.js

export const PHASES = ["XP", "Compra", "Principal 1", "Combate", "Principal 2", "Final"];
export const PHASES_ABBR = ["XP", "DF", "M1", "CP", "M2", "EP"];

export const STATES = {
    FREE: 'LIVRE',
    DECLARING_ATTACK: 'DECLARANDO_ATAQUE',
    WAITING_FOR_BLOCK: 'ESPERANDO_BLOQUEIO',
    CHOOSING_BLOCKER: 'ESCOLHENDO_BLOQUEADOR',
    RESOLVING_STACK: 'RESOLVENDO_PILHA',
    GAME_OVER: 'FIM_DE_JOGO',
    WAITING_FOR_RESPONSE: 'ESPERANDO_RESPOSTA' // Adicionado
};

