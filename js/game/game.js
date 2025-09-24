// js/game/game.js

import { auth } from '../firebase/firebase-config.js';
import { sendGameAction, updateGameState, updateScoreAndStartNewGame, listenToGameActions } from '../firebase/online.js';
import { PHASES, STATES } from './game-constants.js';
import { setupUI, renderizarTudo, showDiceRollResult, hideDiceRoll, updateScoreDisplay } from './game-renderer.js';
import { executarLogicaDeFase, proximoTurnoSetup, setupPlayers, adicionarNaPilha, resolverPilha } from './game-logic.js';
import { databaseCartas } from '../../data/database.js';
import { Carta } from './game-engine.js';

let showScreenCallback = null;

export const Game = {
    jogadores: [],
    pilhaDeEfeitos: [],
    jogadorAtual: 0, // Este será o ÍNDICE (0 ou 1) do jogador atual na array `jogadores`
    controleAtivo: 0, // Este é o ÍNDICE (0 ou 1) do jogador local (o dono deste cliente)
    jogadorComPrioridade: 0,
    estado: 'LIVRE',
    turno: 1,
    fase: 0,
    consecutivePasses: 0,
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
        
        // A UI agora é configurada aqui, depois de os jogadores serem criados
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
        this.consecutivePasses = gameState.consecutivePasses || 0;

        if (this.consecutivePasses >= 2 && this.pilhaDeEfeitos.length > 0) {
            this.resolverPilha();
        }

        executarLogicaDeFase();
        this.renderizarTudo();
    },

    handleIncomingAction(action) {
        console.log("Recebendo ação do oponente:", action);
        const sender = this.jogadores.find(j => j.uid === action.senderUid);
        const senderName = sender ? sender.nome : 'Oponente';

        switch(action.type) {
            case 'PLAY_CARD':
                this.log(senderName, `jogou ${action.payload.cardName}.`);
                this.executarJogarCarta(action.payload, action.senderUid);
                break;
            case 'DECLARE_ATTACK':
                this.executarDeclararAtaque(action.payload, action.senderUid);
                break;
            case 'PASS_PRIORITY':
                this.log(senderName, `passou a prioridade.`);
                this.executarPassarPrioridade(action.senderUid);
                break;
        }
    },
    
    getCurrentGameState() {
        return {
            turn: this.turno,
            phase: this.fase,
            currentPlayerUid: this.jogadores[this.jogadorAtual].uid,
            priorityPlayerUid: this.jogadores[this.jogadorComPrioridade].uid,
            consecutivePasses: this.consecutivePasses,
            winner: null
        };
    },

    handleDiceRoll(roomData) {
        showDiceRollResult(roomData, this.onlineState.localPlayerUid);
    },

    startMatch(roomData) {
        hideDiceRoll();
        if (showScreenCallback) {
            showScreenCallback('game');
        }
        this.initOnline(roomData);
        // O listener de ações agora é iniciado DEPOIS da inicialização
        listenToGameActions(roomData.id); 
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
        this.consecutivePasses = 0;
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
        if(this.jogadores[this.jogadorComPrioridade].uid !== this.onlineState.localPlayerUid) {
            this.log('Sistema', 'Não é a sua vez de passar a prioridade.');
            return;
        }
        sendGameAction({ type: 'PASS_PRIORITY' });
        this.executarPassarPrioridade(this.onlineState.localPlayerUid);
    },

    jogarCarta(carta, zonaId) {
        const jogador = carta.owner;
        if (jogador.uid !== this.onlineState.localPlayerUid) return;
        if (this.jogadores[this.jogadorComPrioridade].uid !== this.onlineState.localPlayerUid) {
             this.log('Sistema', 'Aguarde a sua vez de jogar.');
             return;
        }
        if (jogador.experiencia < carta.custo) {
            this.log('Sistema', 'Experiência insuficiente.');
            return;
        }
        
        const payload = {
            cardUid: carta.uid,
            cardId: carta.id,
            cardName: carta.nome,
            targetSlot: zonaId.substring(zonaId.indexOf('-') + 1)
        };
        sendGameAction({ type: 'PLAY_CARD', payload: payload });
        this.executarJogarCarta(payload, this.onlineState.localPlayerUid);
    },

    declararAtaque(atacante, defensor) {
        const payload = {
            attackerUid: atacante.carta.uid,
            defenderUid: defensor.carta.uid
        };
        sendGameAction({ type: 'DECLARE_ATTACK', payload: payload });
        this.executarDeclararAtaque(payload);
    },

    executarPassarPrioridade(senderUid) {
        this.consecutivePasses++;
        this.jogadorComPrioridade = (this.jogadorComPrioridade + 1) % 2;

        if (auth.currentUser.uid === senderUid) {
             const newGameState = this.getCurrentGameState();
             updateGameState(newGameState);
        }
        
        if (this.consecutivePasses >= 2 && this.pilhaDeEfeitos.length > 0) {
            this.resolverPilha();
        } else {
            this.renderizarTudo();
        }
    },

    executarJogarCarta(payload, senderUid) {
        const playerIndex = this.jogadores.findIndex(p => p.uid === senderUid);
        if (playerIndex === -1) return;

        const jogador = this.jogadores[playerIndex];
        const cardIndex = jogador.mao.findIndex(c => c.uid === payload.cardUid);

        if (cardIndex === -1) {
            console.warn(`Carta ${payload.cardUid} não encontrada na mão de ${senderUid}. Ação ignorada.`);
            return;
        }

        const carta = jogador.mao.splice(cardIndex, 1)[0];
        jogador.experiencia -= carta.custo;
        this.adicionarNaPilha({ tipo: 'jogarCarta', carta: carta, zonaId: `${playerIndex === this.controleAtivo ? 'jogador' : 'oponente'}-${payload.targetSlot}`, dono: jogador });
        this.consecutivePasses = 0;

        // Atualiza o estado do jogo apenas se for o remetente original da ação
        if (auth.currentUser.uid === senderUid) {
            const newGameState = this.getCurrentGameState();
            updateGameState(newGameState);
        }
        
        this.renderizarTudo();
    },
    
    executarDeclararAtaque(payload) {
        const atacanteInfo = this.findCardOnBoardByUid(payload.attackerUid);
        const defensorInfo = this.findCardOnBoardByUid(payload.defenderUid);

        if (!atacanteInfo || !defensorInfo) return;
        
        atacanteInfo.carta.podeAtacar = false; 

        this.estado = STATES.WAITING_FOR_BLOCK;
        this.combateAtual = { atacante: atacanteInfo, defensor: defensorInfo, bloqueador: null };
        this.atacanteSelecionado = null;
        
        this.jogadorComPrioridade = (this.jogadorAtual + 1) % 2;
        this.log('Sistema', `${atacanteInfo.carta.nome} ataca ${defensorInfo.carta.nome}.`);
        this.renderizarTudo();
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
            priorityPlayerUid: this.jogadores[newPlayerIndex].uid,
            consecutivePasses: 0
        };
        updateGameState(newGameState);
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

    // Função para o chat
    enviarMensagemChat(mensagem) {
        console.log("Enviando mensagem de chat:", mensagem);
        // A lógica para enviar a mensagem para o Firebase viria aqui.
        // Exemplo: sendGameAction({ type: 'CHAT_MESSAGE', payload: { message: mensagem } });
        // Por enquanto, podemos simular a mensagem localmente para teste.
        this.log(auth.currentUser.email.split('@')[0], mensagem);
    },
};