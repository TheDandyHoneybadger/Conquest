// js/game/game-logic.js

import { databaseCartas } from '../../data/database.js';
import { Carta, Jogador } from './game-engine.js';
import { Game } from './game.js';
// ADIÇÃO: Importar a nova função
import { updateUserXP } from '../firebase/online.js';

export function setupPlayers(playersData, playerOrder) {
    const jogadores = [];
    let idCounter = 1;
    playerOrder.forEach(uid => {
        const novoJogador = criarJogador(idCounter++, uid, playersData[uid]);
        if (novoJogador) {
            jogadores.push(novoJogador);
        }
    });
    return jogadores;
}

export function criarJogador(id, uid, playerData) {
    if (!playerData || !playerData.deck) return null;
    
    const generalTemplate = databaseCartas.find(c => c.id === playerData.deck.general);
    if (!generalTemplate) return null;

    const jogador = new Jogador(id, uid, JSON.parse(JSON.stringify(generalTemplate)));
    jogador.nome = playerData.displayName;
    
    let cardCounter = 0; 
    playerData.deck.cards.forEach(cardId => {
        const template = databaseCartas.find(c => c.id === cardId);
        if(template) {
            const uniqueCardUID = `${uid}_${cardCounter++}`; 
            const novaCarta = new Carta(JSON.parse(JSON.stringify(template)), uniqueCardUID, jogador);
            jogador.deck.push(novaCarta);
            jogador.allCards.push(novaCarta);
        }
    });
    
    for(let i = 0; i < 5; i++) { jogador.comprarCarta(); }
    return jogador;
}

export function executarLogicaDeFase(jogador, fase, turno){
    if(!jogador) return;

    if(fase === 0) { // Fase de XP
       jogador.experiencia++;
       Game.log('Sistema', `${jogador.nome} ganhou 1 de Experiência.`);
       // ADIÇÃO: Atualiza o XP do perfil do utilizador no Firebase
       updateUserXP(jogador.uid, 1);
    }
    else if(fase === 1) { // Fase de Compra
       if (!(turno === 1 && Game.jogadores.indexOf(jogador) === 0)) { 
           jogador.comprarCarta();
           Game.log('Sistema', `${jogador.nome} comprou uma carta.`);
       }
   }
}