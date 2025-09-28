// js/game/game.js

import { auth } from '../firebase/firebase-config.js';
import { sendGameAction, updateGameState, listenToGameActions, updateScoreAndStartNewGame } from '../firebase/online.js';
import { PHASES } from './game-constants.js';
import { setupUI, renderizarTudo, animateCardMove, updateScoreDisplay } from './game-renderer.js';
import { setupPlayers, executarLogicaDeFase } from './game-logic.js';

let showScreenCallback = null;

export const Game = {
    jogadores: [],
    jogadorAtual: 0,
    controleAtivo: 0,
    turno: 1,
    fase: 0,
    zonaDeConflito: [],
    estado: 'LIVRE', // 'LIVRE' ou 'ATACANDO'
    atacanteSelecionado: null,
    isGameRunning: false,
    onlineState: {
        matchId: null,
        localPlayerUid: null,
        opponentPlayerUid: null,
        scores: {}
    },
    
    renderizarTudo,
    
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
        } else {
             this.renderizarTudo();
        }
    },
    
    syncGameState(gameState, scores) {
        if (!this.isGameRunning) return;

        this.onlineState.scores = scores;
        updateScoreDisplay(scores, this.onlineState.localPlayerUid, this.jogadores);

        const newPlayerIndex = this.jogadores.findIndex(p => p.uid === gameState.currentPlayerUid);

        if (this.jogadorAtual !== newPlayerIndex || this.turno !== gameState.turn) {
            this.jogadorAtual = newPlayerIndex;
            this.turno = gameState.turn;
            this.log("Sistema", `Começou o Turno ${this.turno} de ${this.jogadores[this.jogadorAtual].nome}.`);
            
            if (this.jogadores[this.jogadorAtual].uid === this.onlineState.localPlayerUid) {
                executarLogicaDeFase(this.jogadores[this.jogadorAtual], 0, this.turno);
            }
        }
        
        if (this.fase !== gameState.phase) {
            this.fase = gameState.phase;
            if (this.fase === 1 && this.jogadores[this.jogadorAtual].uid === this.onlineState.localPlayerUid) {
                executarLogicaDeFase(this.jogadores[this.jogadorAtual], 1, this.turno);
            }
        }
        this.renderizarTudo();
    },

    handleIncomingAction(action) {
        if (!this.isGameRunning) return;
        const sender = this.jogadores.find(j => j.uid === action.senderUid);
        const senderName = sender ? sender.nome : 'Oponente';
        
        if (action.type === 'CHAT_MESSAGE') {
             this.log(senderName, action.payload.message);
             return;
        }

        if (action.type === 'MANUAL_ATTACK') {
            this.log(senderName, `declarou um ataque de ${action.payload.attackerName} a ${action.payload.defenderName}.`);
            return;
        }

        const targetCard = this.findCardByUid(action.payload.cardUID);
        if (!targetCard) return;

        switch(action.type) {
            case 'MANUAL_FLIP_CARD':
                targetCard.faceDown = !targetCard.faceDown;
                this.log(senderName, `Virou ${action.payload.cardName} para ${targetCard.faceDown ? 'baixo' : 'cima'}.`);
                this.renderizarTudo();
                break;
            case 'MANUAL_CHANGE_STATS':
                targetCard.ataqueAtual = action.payload.atk;
                targetCard.vidaAtual = action.payload.vida;
                this.log(senderName, `Alterou os status de ${action.payload.cardName} para ${targetCard.ataqueAtual}/${targetCard.vidaAtual}.`);
                this.renderizarTudo();
                break;
            case 'MANUAL_MOVE_CARD':
                 this.executarMoverCarta(targetCard, action.payload);
                 this.log(senderName, `Moveu ${action.payload.cardName} para ${action.payload.destination}.`);
                 break;
        }
    },
    
    getCurrentGameState() {
        return {
            turn: this.turno,
            phase: this.fase,
            currentPlayerUid: this.jogadores[this.jogadorAtual].uid,
        };
    },
    
    startMatch(roomData) {
        if (showScreenCallback) showScreenCallback('game');
        this.initOnline(roomData);
        listenToGameActions(roomData.id); 
    },

    endMatch(winnerUid) {
        this.isGameRunning = false;
        const winner = this.jogadores.find(j => j.uid === winnerUid);
        alert(`Fim da partida! O vencedor é ${winner.nome}!`);
        // Idealmente, adicionar um botão para voltar ao lobby
    },

    passarTurno() {
        if (this.jogadores[this.jogadorAtual].uid !== this.onlineState.localPlayerUid) return;

        let newPlayerIndex = (this.jogadorAtual + 1) % 2;
        let newTurn = this.turno;
        if (newPlayerIndex === 0) newTurn++;

        const newGameState = { turn: newTurn, phase: 0, currentPlayerUid: this.jogadores[newPlayerIndex].uid };
        updateGameState(newGameState);
    },
    
    mudarFaseManualmente(targetIndex) {
        if (this.jogadores[this.jogadorAtual].uid !== this.onlineState.localPlayerUid) return;
        const newGameState = this.getCurrentGameState();
        newGameState.phase = targetIndex % PHASES.length;
        updateGameState(newGameState);
    },

    enviarAcao(type, payload) {
        sendGameAction({ type, payload });
    },

    executarMoverCarta(carta, payload) {
        const jogador = this.jogadores.find(p => p.uid === carta.owner.uid);
        if (!jogador) return;

        const fromRect = document.querySelector(`[data-uid="${carta.uid}"]`)?.getBoundingClientRect();
        
        if (payload.fromZone === 'mao') {
            const index = jogador.mao.findIndex(c => c.uid === carta.uid);
            if (index > -1) jogador.mao.splice(index, 1);
        } else if (payload.fromZone === 'campo') {
            jogador.campo[payload.fromSlot] = null;
        } else if (payload.fromZone === 'conflito') {
            const index = this.zonaDeConflito.findIndex(c => c.uid === carta.uid);
            if (index > -1) this.zonaDeConflito.splice(index, 1);
        }

        if (payload.destination === 'campo') {
            jogador.campo[payload.destinationSlot] = carta;
            carta.zona = 'campo';
            carta.slot = payload.destinationSlot;
        } else if (payload.destination === 'mao') {
            jogador.mao.push(carta);
            carta.zona = 'mao';
        } else if (payload.destination === 'cemiterio') {
            jogador.cemiterio.push(carta);
            carta.zona = 'cemiterio';
        } else if (payload.destination === 'conflito') {
            this.zonaDeConflito.push(carta);
            carta.zona = 'conflito';
        }

        if (fromRect) {
            animateCardMove(fromRect, carta);
        } else {
            this.renderizarTudo();
        }
    },
    
    iniciarAtaqueComCarta(carta) {
        this.estado = 'ATACANDO';
        this.atacanteSelecionado = carta;
        this.log('Sistema', `Você selecionou ${carta.nome} para atacar. Selecione um alvo.`);
        this.renderizarTudo();
    },

    selecionarAlvo(alvo) {
        if (this.estado !== 'ATACANDO' || !this.atacanteSelecionado) return;
        
        this.enviarAcao('MANUAL_ATTACK', {
            attackerName: this.atacanteSelecionado.nome,
            defenderName: alvo.nome,
        });
        
        this.log('Você', `declarou um ataque de ${this.atacanteSelecionado.nome} a ${alvo.nome}.`);

        this.atacanteSelecionado = null;
        this.estado = 'LIVRE';
        this.renderizarTudo();
    },

    cancelarAtaque() {
        if (this.estado === 'ATACANDO') {
            this.estado = 'LIVRE';
            this.atacanteSelecionado = null;
            this.log('Sistema', 'Ataque cancelado.');
            this.renderizarTudo();
        }
    },
    
    findCardByUid(uid) {
        for (const jogador of this.jogadores) {
            const card = jogador.findCardByUid(uid);
            if (card) return card;
        }
        const cardInConflict = this.zonaDeConflito.find(c => c.uid === uid);
        if (cardInConflict) return cardInConflict;
        return null;
    },

    admitirDerrota() {
        if (!this.isGameRunning || !this.onlineState.opponentPlayerUid) return;
        updateScoreAndStartNewGame(this.onlineState.opponentPlayerUid);
    },

    enviarMensagemChat(mensagem) {
        this.enviarAcao('CHAT_MESSAGE', { message: mensagem });
    },

    resetGame() {
        this.jogadores = [];
        this.jogadorAtual = 0;
        this.turno = 1;
        this.fase = 0;
        this.zonaDeConflito = [];
        this.estado = 'LIVRE';
        this.atacanteSelecionado = null;
        this.isGameRunning = false;
        const log = document.getElementById('game-log');
        if (log) log.innerHTML = '';
    }
};

