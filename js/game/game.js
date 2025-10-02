// js/game/game.js

import { auth } from '../firebase/firebase-config.js';
import { sendGameAction, updateGameState, listenToGameActions, updateScoreAndStartNewGame } from '../firebase/online.js';
import { PHASES } from './game-constants.js';
import { setupUI, renderizarTudo, animateCardMove, updateScoreDisplay, logMessage } from './game-renderer.js';
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
    
    log(sender, message, card = null) {
        logMessage(sender, message, card);
    },

    logChatMessage(sender, message) {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            const messageElement = document.createElement('p');
            messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    },
    
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
             this.logChatMessage(senderName, action.payload.message);
             return;
        }
        
        if (action.type === 'MANUAL_SHUFFLE_DECK') {
            sender.deck = sender.deck.sort(() => Math.random() - 0.5);
            this.renderizarTudo();
            this.log(senderName, `embaralhou o próprio deck.`);
            return;
        }

        if (action.type === 'MANUAL_MILL_TOP_CARD') {
            if(sender.deck.length > 0) {
                const milledCard = sender.deck.pop();
                sender.cemiterio.push(milledCard);
                this.renderizarTudo();
                this.log(senderName, `enviou ${milledCard.nome} do topo do deck para o cemitério.`, milledCard);
            }
            return;
        }

        const targetCard = this.findCardByUid(action.payload.cardUID);
        if (!targetCard && action.type !== 'MANUAL_ATTACK') return;


        switch(action.type) {
            case 'MANUAL_ATTACK':
                const attacker = this.findCardByUid(action.payload.attackerUID);
                const defender = this.findCardByUid(action.payload.defenderUID);
                this.log(senderName, `declarou um ataque de ${attacker.nome} a ${defender.nome}.`, attacker);
                break;
            case 'MANUAL_FLIP_CARD':
                targetCard.faceDown = !targetCard.faceDown;
                this.renderizarTudo();
                this.log(senderName, `Virou ${targetCard.nome} para ${targetCard.faceDown ? 'baixo' : 'cima'}.`, targetCard);
                break;
            case 'MANUAL_TRANSFORM_GENERAL':
                if (targetCard.tipo === 'General' && targetCard.segundaFace) {
                    if (!targetCard._primeiraFace) {
                        targetCard._primeiraFace = {
                            nome: targetCard.nome,
                            ataque: targetCard.ataque,
                            vida: targetCard.vida,
                            descricao: targetCard.descricao,
                            arte: targetCard.arte
                        };
                    }

                    if (targetCard.transformed) {
                        Object.assign(targetCard, targetCard._primeiraFace);
                        targetCard.transformed = false;
                        this.log(senderName, `reverteu ${targetCard.nome}.`, targetCard);
                    } else {
                        Object.assign(targetCard, targetCard.segundaFace);
                        targetCard.transformed = true;
                        this.log(senderName, `transformou o General em ${targetCard.nome}!`, targetCard);
                    }
                    targetCard.vidaAtual = targetCard.vida; 
                    targetCard.ataqueAtual = targetCard.ataque;
                }
                this.renderizarTudo();
                break;
            case 'MANUAL_ACTIVATE_ABILITY':
                const cardEl = document.querySelector(`[data-uid="${targetCard.uid}"]`);
                if (cardEl) {
                    cardEl.classList.add('ability-activated');
                    setTimeout(() => {
                        cardEl.classList.remove('ability-activated');
                    }, 1000);
                }
                this.log(senderName, `ativou a habilidade de ${targetCard.nome}.`, targetCard);
                break;
            case 'MANUAL_CHANGE_STATS':
                targetCard.ataqueAtual = action.payload.atk;
                targetCard.vidaAtual = action.payload.vida;
                this.renderizarTudo();
                this.log(senderName, `Alterou os status de ${targetCard.nome} para ${targetCard.ataqueAtual}/${targetCard.vidaAtual}.`, targetCard);
                break;
            case 'MANUAL_MOVE_CARD':
                 this.executarMoverCarta(targetCard, action.payload, action.senderUid);
                 this.log(senderName, `Moveu ${targetCard.nome} para ${action.payload.destination}.`, targetCard);
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

    executarMoverCarta(carta, payload, senderUid) {
        const jogador = carta.owner;
        if (!jogador) return;
    
        // CORREÇÃO: O seletor agora procura especificamente por um .card-container para a posição inicial
        const fromRect = document.querySelector(`.card-container[data-uid="${carta.uid}"]`)?.getBoundingClientRect();
    
        // Remove a carta de todas as zonas possíveis
        const maoIndex = jogador.mao.findIndex(c => c.uid === carta.uid);
        if (maoIndex > -1) jogador.mao.splice(maoIndex, 1);
    
        for (const slot in jogador.campo) {
            if (jogador.campo[slot] && jogador.campo[slot].uid === carta.uid) {
                jogador.campo[slot] = null;
            }
        }
    
        const conflitoIndex = this.zonaDeConflito.findIndex(c => c.uid === carta.uid);
        if (conflitoIndex > -1) this.zonaDeConflito.splice(conflitoIndex, 1);
    
        const cemiterioIndex = jogador.cemiterio.findIndex(c => c.uid === carta.uid);
        if (cemiterioIndex > -1) jogador.cemiterio.splice(cemiterioIndex, 1);
    
        const deckIndex = jogador.deck.findIndex(c => c.uid === carta.uid);
        if (deckIndex > -1) jogador.deck.splice(deckIndex, 1);
    
        // Adiciona a carta à nova zona
        if (payload.destination === 'campo') {
            jogador.campo[payload.destinationSlot] = carta;
            carta.zona = 'campo';
            carta.slot = payload.destinationSlot;
        } else if (payload.destination === 'mao') {
            jogador.mao.push(carta);
            carta.zona = 'mao';
            carta.slot = null;
        } else if (payload.destination === 'cemiterio') {
            jogador.cemiterio.push(carta);
            carta.zona = 'cemiterio';
            carta.slot = null;
        } else if (payload.destination === 'conflito') {
            this.zonaDeConflito.push(carta);
            carta.zona = 'conflito';
            carta.slot = null;
        } else if (payload.destination === 'deck') {
            jogador.deck.push(carta);
            carta.zona = 'deck';
            carta.slot = null;
        }
    
        if (fromRect && senderUid === this.onlineState.localPlayerUid) {
            animateCardMove(fromRect, carta);
        } else {
            this.renderizarTudo();
        }
    },
    
    iniciarAtaqueComCarta(carta) {
        this.estado = 'ATACANDO';
        this.atacanteSelecionado = carta;
        this.log('Sistema', `Você selecionou ${carta.nome} para atacar. Selecione um alvo.`, carta);
        this.renderizarTudo();
    },

    selecionarAlvo(alvo) {
        if (this.estado !== 'ATACANDO' || !this.atacanteSelecionado) return;
        
        this.enviarAcao('MANUAL_ATTACK', {
            attackerUID: this.atacanteSelecionado.uid,
            defenderUID: alvo.uid,
        });
        
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
        const chat = document.getElementById('chat-messages');
        if (chat) chat.innerHTML = '';
    }
};