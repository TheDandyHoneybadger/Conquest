// js/game/game.js

import { auth } from '../firebase/firebase-config.js';
import { sendGameAction, updateGameState, updateScoreAndStartNewGame } from '../firebase/online.js';
import { PHASES, STATES } from './game-constants.js';
import { setupUI, renderizarTudo, showDiceRollResult, hideDiceRoll, updateScoreDisplay } from './game-renderer.js';
import { executarLogicaDeFase, proximoTurnoSetup, setupPlayers, adicionarNaPilha, resolverPilha } from './game-logic.js';

// Variável para guardar a função de callback da UI
let showScreenCallback = null;

export const Game = {
    jogadores: [],
    pilhaDeEfeitos: [],
    jogadorAtual: 0,
    controleAtivo: 0,
    jogadorComPrioridade: 0,
    estado: 'LIVRE',
    turno: 1,
    fase: 0,
    dragState: { active: false, mode: null, el: null, data: null },
    proximoUID: 0,
    atacanteSelecionado: null,
    combateAtual: null,
    isGameRunning: false,
    onlineState: {
        matchId: null,
        localPlayerUid: null,
        opponentPlayerUid: null,
        scores: {}
    },
    
    renderizarTudo,
    resolverPilha,
    adicionarNaPilha,
    
    // CORREÇÃO: Função para receber o callback da UI
    setScreenChanger(callback) {
        showScreenCallback = callback;
    },

    initOnline(matchData) {
        this.resetGame();
        this.isGameRunning = true;
        
        const localUserId = auth.currentUser.uid;
        this.onlineState.matchId = matchData.id;
        this.onlineState.localPlayerUid = localUserId;
        this.onlineState.opponentPlayerUid = matchData.playerOrder.find(id => id !== localUserId);
        this.onlineState.scores = matchData.scores;

        this.controleAtivo = matchData.playerOrder.indexOf(localUserId);
        
        this.jogadores = setupPlayers(matchData.players, matchData.playerOrder);
        
        setupUI();
        
        if(matchData.gameState) {
            this.syncGameState(matchData.gameState, matchData.scores);
        }
    },
    
    syncGameState(gameState, scores) {
        if (this.estado === STATES.GAME_OVER) return;

        this.onlineState.scores = scores;
        updateScoreDisplay(scores, this.onlineState.localPlayerUid, this.jogadores);

        const newPlayerIndex = this.jogadores.findIndex(p => p.uid === gameState.currentPlayerUid);

        if (this.jogadorAtual !== newPlayerIndex) {
            proximoTurnoSetup(this.jogadores[this.jogadorAtual]);
            this.jogadorAtual = newPlayerIndex;
            this.log("Sistema", `Turno de ${this.jogadores[this.jogadorAtual].nome}.`);
        }
        
        this.turno = gameState.turn;
        this.fase = gameState.phase;
        this.jogadorComPrioridade = this.jogadores.findIndex(p => p.uid === gameState.priorityPlayerUid);

        executarLogicaDeFase();
        this.renderizarTudo();
    },

    handleIncomingAction(action) {
        console.log("Recebendo ação:", action);
        this.log("Oponente", `Ação recebida: ${action.type}`);
        switch(action.type) {
            case 'PLAY_CARD':
                this.executarJogarCarta(action.payload, action.senderUid);
                break;
            case 'DECLARE_ATTACK':
                this.executarDeclararAtaque(action.payload);
                break;
        }
    },

    handleDiceRoll(roomData) {
        showDiceRollResult(roomData, this.onlineState.localPlayerUid);
    },

    startMatch(roomData) {
        hideDiceRoll();
        // Usa o callback para mudar a tela
        if (showScreenCallback) {
            showScreenCallback('game');
        }
        this.initOnline(roomData);
    },

    endMatch(winnerUid) {
        this.estado = STATES.GAME_OVER;
        const winner = this.jogadores.find(j => j.uid === winnerUid);
        alert(`Fim da partida! O vencedor é ${winner.nome}!`);
    },
    
    resetGame() {
        this.jogadores = [];
        this.pilhaDeEfeitos = [];
        this.jogadorAtual = 0;
        this.estado = 'LIVRE';
        this.turno = 1;
        this.fase = 0;
        this.proximoUID = 0;
        this.atacanteSelecionado = null;
        this.combateAtual = null;
        this.isGameRunning = false;
        
        const log = document.getElementById('game-log');
        if (log) log.innerHTML = '';
    },

    log(autor, mensagem) {
        const logEl = document.getElementById('game-log');
        if(!logEl) return;
        const p = document.createElement('p');
        p.innerHTML = `<strong>${autor}:</strong> ${mensagem}`;
        logEl.appendChild(p);
        logEl.scrollTop = logEl.scrollHeight;
    },

    passarPrioridade() {
        // Lógica para passar prioridade, enviar ação online
    },

    mudarFaseManualmente(targetIndex) {
        if(this.jogadores[this.jogadorAtual].uid !== this.onlineState.localPlayerUid || this.estado !== STATES.FREE || this.pilhaDeEfeitos.length > 0) return;
        if(targetIndex <= this.fase) return;
        
        let newPhase = this.fase;
        let newTurn = this.turno;
        let newPlayerIndex = this.jogadorAtual;

        while (newPhase < targetIndex) {
            newPhase++;
        }

        if (newPhase >= PHASES.length -1) {
            newPhase = 0;
            newPlayerIndex = (this.jogadorAtual + 1) % 2;
            if (newPlayerIndex === 0) newTurn++;
        }

        const newGameState = {
            turn: newTurn,
            phase: newPhase,
            currentPlayerUid: this.jogadores[newPlayerIndex].uid,
            priorityPlayerUid: this.jogadores[newPlayerIndex].uid
        };
        updateGameState(newGameState);
    },

    jogarCarta(carta, zonaId) {
        const jogador = carta.owner;
        if (jogador.uid !== this.onlineState.localPlayerUid) return;
        if (jogador.experiencia < carta.custo) {
            this.log('Sistema', 'Experiência insuficiente.');
            return;
        }
        
        const payload = {
            cardUid: carta.uid,
            targetSlot: zonaId.substring(zonaId.indexOf('-') + 1)
        };
        sendGameAction({ type: 'PLAY_CARD', payload: payload });
        this.executarJogarCarta(payload, this.onlineState.localPlayerUid);
    },

    executarJogarCarta(payload, senderUid) {
        const playerIndex = this.jogadores.findIndex(p => p.uid === senderUid);
        if (playerIndex === -1) return;

        const jogador = this.jogadores[playerIndex];
        const cardIndex = jogador.mao.findIndex(c => c.uid === payload.cardUid);
        if (cardIndex === -1) return;

        const carta = jogador.mao.splice(cardIndex, 1)[0];
        jogador.experiencia -= carta.custo;
        
        this.adicionarNaPilha({ tipo: 'jogarCarta', carta: carta, zonaId: `${playerIndex === this.controleAtivo ? 'jogador' : 'oponente'}-${payload.targetSlot}`, dono: jogador });
        this.renderizarTudo();
    },

    declararAtaque(atacante, defensor) {
        atacante.carta.podeAtacar = false; 
        
        const payload = {
            attackerUid: atacante.carta.uid,
            defenderUid: defensor.carta.uid
        };

        sendGameAction({ type: 'DECLARE_ATTACK', payload: payload });
        this.executarDeclararAtaque(payload);
    },
    
    executarDeclararAtaque(payload) {
        const atacanteInfo = this.findCardOnBoardByUid(payload.attackerUid);
        const defensorInfo = this.findCardOnBoardByUid(payload.defenderUid);

        if (!atacanteInfo || !defensorInfo) return;

        this.estado = STATES.WAITING_FOR_BLOCK;
        this.combateAtual = { atacante: atacanteInfo, defensor: defensorInfo, bloqueador: null };
        this.atacanteSelecionado = null;
        
        this.jogadorComPrioridade = (this.jogadorAtual + 1) % 2;
        this.log('Sistema', `${atacanteInfo.carta.nome} ataca ${defensorInfo.carta.nome}.`);
        this.renderizarTudo();
    },

    findCardOnBoardByUid(uid) {
        for (const jogador of this.jogadores) {
            if (jogador.general.uid === uid) {
                return { carta: jogador.general, slot: 'g', dono: jogador };
            }
            for (const slot in jogador.campo) {
                const carta = jogador.campo[slot];
                if (carta && carta.uid === uid) {
                    return { carta: carta, slot: slot, dono: jogador };
                }
            }
        }
        return null;
    },

    resolverCombateFinal() {
        const { atacante, defensor, bloqueador } = this.combateAtual;
        const alvoFinal = bloqueador || defensor;
        
        this.adicionarNaPilha({
            tipo: 'combate',
            carta: atacante.carta,
            dono: atacante.dono,
            contexto: { atacante, defensor: alvoFinal }
        });

        this.combateAtual = null;
        this.estado = STATES.WAITING_FOR_RESPONSE;
        this.jogadorComPrioridade = this.jogadorAtual;
        this.resolverPilha();
    },

    admitirDerrota() {
        if (!this.isGameRunning || !this.onlineState.opponentPlayerUid) return;
        updateScoreAndStartNewGame(this.onlineState.opponentPlayerUid);
    },
};

