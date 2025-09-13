// js/game/game-logic.js

import { databaseCartas } from '../../data/database.js';
import { Game } from './game.js';
import { Carta, Jogador, EffectEngine } from './game-engine.js';
import { STATES } from './game-constants.js';
import { updateScoreAndStartNewGame } from '../firebase/online.js';

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
    if (!playerData || !playerData.deck) {
        console.error("Dados de jogador inválidos: o objeto 'deck' está em falta.", playerData);
        return null;
    }
    const generalTemplate = databaseCartas.find(c => c.id === playerData.deck.general);
    if (!generalTemplate) {
        console.error(`General com ID "${playerData.deck.general}" não foi encontrado na base de dados.`);
        return null;
    }
    const jogador = new Jogador(id, uid, JSON.parse(JSON.stringify(generalTemplate)));
    jogador.nome = playerData.displayName;
    playerData.deck.cards.forEach(cardId => {
        const template = databaseCartas.find(c => c.id === cardId);
        if(template) {
            const novaCarta = new Carta(JSON.parse(JSON.stringify(template)), Game.proximoUID++, jogador);
            jogador.deck.push(novaCarta);
        }
    });
    embaralhar(jogador.deck);
    for(let i = 0; i < 5; i++) { jogador.comprarCarta(); }
    return jogador;
}

export function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function executarLogicaDeFase(){
    const jogador = Game.jogadores[Game.jogadorAtual];
    if(!jogador) return;
    if(Game.fase === 0) { 
       if (Game.turno > 1 || Game.jogadores.findIndex(p => p.uid === jogador.uid) === 1) { 
           jogador.experiencia++;
           // EffectEngine.trigger('onGainExp', { player: jogador, amount: 1, sourceCard: jogador.general });
           Game.log('Sistema', `${jogador.nome} ganhou 1 EXP.`);
       }
   }
   else if(Game.fase === 1) { 
       if (!(Game.turno === 1 && Game.jogadores.findIndex(p => p.uid === jogador.uid) === 0)) { 
           jogador.comprarCarta();
           Game.log('Sistema', `${jogador.nome} comprou uma carta.`);
       }
        // EffectEngine.trigger('onTurnStart', { player: jogador, sourceCard: jogador.general });
   }
}

export function proximoTurnoSetup(jogadorQueTerminou){
    if(!jogadorQueTerminou) return;
    Object.values(jogadorQueTerminou.campo).forEach(c => {
        if (c && c.tempBuffs.length > 0) {
            c.tempBuffs.forEach(buff => {
                c.ataqueAtual -= buff.atk;
                c.vidaAtual -= buff.vida;
            });
            c.tempBuffs = [];
        }
    });
    
    Object.values(Game.jogadores[Game.jogadorAtual].campo).forEach(c => {
        if (c && c.tipo === 'Unidade') {
            c.podeAtacar = true;
            c.isFrozen = false;
        }
    });
}

export function adicionarNaPilha(acao) {
    Game.pilhaDeEfeitos.push(acao);
    Game.estado = STATES.WAITING_FOR_RESPONSE;
    Game.jogadorComPrioridade = (Game.jogadorAtual + 1) % 2;
}

export function resolverPilha() {
    if (Game.estado === STATES.GAME_OVER) return;
    Game.estado = STATES.RESOLVING_STACK;
    Game.renderizarTudo();

    const resolverAcao = () => {
        if (Game.pilhaDeEfeitos.length === 0 || Game.estado === STATES.GAME_OVER) {
            Game.estado = STATES.FREE;
            Game.jogadorComPrioridade = Game.jogadorAtual;
            Game.log('Sistema', 'Pilha resolvida.');
            Game.renderizarTudo();
            return;
        }

        const acao = Game.pilhaDeEfeitos.pop();
        Game.log('Sistema', `Resolvendo: ${acao.tipo} de ${acao.carta.nome}`);

        if (acao.tipo === 'jogarCarta') executarJogarCarta(acao);
        else if (acao.tipo === 'combate') executarCombate(acao.contexto);
        // else if (acao.tipo === 'efeito') EffectEngine.execute(acao.contexto.action, acao.contexto);

        Game.renderizarTudo();

        setTimeout(resolverAcao, 600);
    };
    resolverAcao();
}

function executarJogarCarta(acao) {
    if (!acao || !acao.carta || !acao.zonaId || !acao.dono) {
        console.error("Ação 'jogarCarta' está incompleta ou corrompida!", acao);
        return;
    }

    const { carta, zonaId, dono } = acao;
    const slotId = zonaId.substring(zonaId.indexOf('-') + 1);

    if (!dono.campo.hasOwnProperty(slotId)) {
        console.error(`O jogador ${dono.id} não possui um slot de campo chamado '${slotId}'!`);
        return;
    }
    
    dono.campo[slotId] = carta;
    carta.slot = slotId;

    if (carta.activeKeywords.has('Ímpeto')) {
        carta.podeAtacar = true;
    }

    Game.log('Sistema', `${carta.nome} entra no campo.`);
    // EffectEngine.trigger('onPlay', { sourceCard: carta, player: dono });
    // EffectEngine.trigger('onFriendlyUnitPlay', { sourceCard: carta, player: dono });
}

function executarCombate(contexto) {
    if (Game.estado === STATES.GAME_OVER) return;
    const { atacante, defensor } = contexto;
    if (!atacante || !defensor || !atacante.carta || !defensor.carta) return;

    Game.log('Sistema', `Combate: ${atacante.carta.nome} (${atacante.carta.ataqueAtual}/${atacante.carta.vidaAtual}) vs ${defensor.carta.nome} (${defensor.carta.ataqueAtual}/${defensor.carta.vidaAtual}).`);
    
    const danoNoDefensor = atacante.carta.ataqueAtual;
    if (danoNoDefensor > 0) {
        defensor.carta.vidaAtual -= danoNoDefensor;
    }
    
    if (defensor.carta.tipo === 'Unidade' || (defensor.carta.tipo === 'General' && defensor.carta.ataqueAtual > 0)) {
        const danoNoAtacante = defensor.carta.ataqueAtual;
         if (danoNoAtacante > 0) {
            atacante.carta.vidaAtual -= danoNoAtacante;
        }
    }
    
    checarMortes([atacante, defensor]);
}

function checarMortes(unidades) {
    unidades.forEach(unidade => {
        if (!unidade || !unidade.carta) return;
        if (unidade.carta.vidaAtual <= 0) {
            if (unidade.carta.tipo === 'General') {
                terminarJogo(unidade.dono); 
                return; 
            }
            
            Game.log('Sistema', `${unidade.carta.nome} foi destruído.`);
            unidade.dono.cemiterio.push(unidade.carta);
            if (unidade.slot && unidade.dono.campo[unidade.slot] && unidade.dono.campo[unidade.slot].uid === unidade.carta.uid) {
                unidade.dono.campo[unidade.slot] = null;
            }
            unidade.dono.stats.aliadosMortos++;

            // EffectEngine.trigger('onDeath', { sourceCard: unidade.carta, player: unidade.dono });
            // EffectEngine.trigger('onFriendlyUnitDeath', { sourceCard: unidade.carta, player: unidade.dono });
        }
    });
}

function terminarJogo(jogadorDerrotado) {
    if (Game.estado === STATES.GAME_OVER) return; 

    Game.estado = STATES.GAME_OVER;
    const vencedor = Game.jogadores.find(j => j !== jogadorDerrotado);
    Game.log('Sistema', `Fim da Ronda! O General de ${jogadorDerrotado.nome} foi derrotado!`);
    
    updateScoreAndStartNewGame(vencedor.uid);
}

// CORREÇÃO: Função renomeada para corresponder à importação
export function parseEffectString(effectString) {
    if (!effectString || !effectString.includes(':')) return null;
    const [condition, actionsPart] = effectString.split(':', 2);
    const actions = actionsPart.split(',').map(actionStr => {
        const match = actionStr.match(/(\w+)\((.*?)\)/);
        if (!match) return null;
        const [, name, paramsStr] = match;
        const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];
        return { name, params };
    }).filter(a => a);
    return { condition, actions };
}

export function resetRonda() {
    Game.pilhaDeEfeitos = [];
    Game.estado = STATES.FREE;
    Game.proximoUID = 0;
    Game.atacanteSelecionado = null;
    Game.combateAtual = null;
    document.getElementById('game-log').innerHTML = '';

    const novosJogadores = setupPlayers(Game.onlineState.players, Game.onlineState.playerOrder);
    Game.jogadores = novosJogadores;
}

