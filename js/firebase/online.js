// js/firebase/online.js

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, setDoc, getDocs, addDoc, collection, serverTimestamp, query, where, onSnapshot, updateDoc, deleteDoc, orderBy, runTransaction, increment, limit } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { Game } from '../game/game.js';
import { setupPlayers } from '../game/game-logic.js';

let showScreenFunc;
let updateRoomAndWaitScreenFunc;
let populateRoomListFunc;
let unsubscribeFromRoom = null;
let unsubscribeFromActions = null;
let unsubscribeFromQueue = null;
let currentRoomId = null;

// CORREÇÃO: Função auxiliar para embaralhar arrays adicionada ao escopo do módulo
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export function listenToGameActions(roomId) {
    if (unsubscribeFromActions) unsubscribeFromActions();
    
    const actionsRef = collection(db, 'matches', roomId, 'game_actions');
    const q = query(actionsRef, orderBy("timestamp"));

    unsubscribeFromActions = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const action = change.doc.data();
                 if (action.senderUid !== auth.currentUser.uid) {
                    Game.handleIncomingAction(action);
                }
            }
        });
    }, (error) => {
        console.error("Erro ao escutar ações do jogo:", error);
    });
}

export function setOnlineSystemCallbacks(callbacks) {
    showScreenFunc = callbacks.showScreen;
    updateRoomAndWaitScreenFunc = callbacks.updateRoomAndWaitScreen;
    populateRoomListFunc = callbacks.populateRoomList;
}

export async function signUpUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.email.split('@')[0],
            createdAt: serverTimestamp(),
            stats: { wins: 0, losses: 0, xp: 0 } 
        });
    } catch (error) {
        alert("Erro ao cadastrar: " + error.message);
    }
}

export async function signInUser(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Erro ao entrar: " + error.message);
    }
}

export async function signOutUser() {
    try {
        await cancelFindRankedMatch();
        await signOut(auth);
    } catch (error) {
        alert("Erro ao sair: " + error.message);
    }
}

export async function getOpenRooms() {
    const roomsRef = collection(db, 'matches');
    const q = query(roomsRef, where("status", "==", "waiting"), where("type", "==", "custom"));
    const querySnapshot = await getDocs(q);
    
    const rooms = [];
    querySnapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() });
    });
    return rooms;
}

export async function createRoom(roomName, type = 'custom') {
    const user = auth.currentUser;
    if (!user) return alert("Precisa de estar logado.");

    const deckData = await getPrincipalDeck(user);
    if (!deckData) return null;

    const newRoomData = {
        roomName: roomName,
        type: type,
        players: {
            [user.uid]: { uid: user.uid, displayName: user.email.split('@')[0], deck: deckData }
        },
        playerOrder: [user.uid],
        status: 'waiting',
        createdAt: serverTimestamp(),
        scores: { [user.uid]: 0 },
        gameState: null,
    };
    
    try {
        const docRef = await addDoc(collection(db, 'matches'), newRoomData);
        currentRoomId = docRef.id;
        listenToRoomUpdates(docRef.id);
        if (showScreenFunc) showScreenFunc('roomWait');
        return docRef;
    } catch (error) {
        console.error("Erro ao criar a sala:", error);
        return null;
    }
}

export async function joinRoom(roomId) {
    const user = auth.currentUser;
    if (!user) return alert("Precisa de estar logado.");

    const deckData = await getPrincipalDeck(user);
    if (!deckData) return;

    const roomRef = doc(db, 'matches', roomId);
    
    try {
       await runTransaction(db, async (transaction) => {
            const roomSnap = await transaction.get(roomRef);
            if (!roomSnap.exists() || roomSnap.data().status !== 'waiting' || roomSnap.data().playerOrder.length >= 2) {
                throw new Error("Sala não disponível ou já está cheia.");
            }

            const hostUID = roomSnap.data().playerOrder[0];
            const hostDeck = roomSnap.data().players[hostUID].deck;
            
            transaction.update(roomRef, {
                [`players.${user.uid}`]: { uid: user.uid, displayName: user.email.split('@')[0], deck: { ...deckData, cards: shuffleArray(deckData.cards) } },
                [`players.${hostUID}.deck.cards`]: shuffleArray(hostDeck.cards),
                playerOrder: [...roomSnap.data().playerOrder, user.uid],
                scores: { ...roomSnap.data().scores, [user.uid]: 0 },
                status: 'ongoing',
                gameState: {
                    turn: 1,
                    phase: 0,
                    currentPlayerUid: hostUID
                }
            });
            currentRoomId = roomId;
        });
        
        listenToRoomUpdates(roomId);

    } catch (error) {
        console.error("Erro ao entrar na sala:", error.message);
        alert(error.message);
        if (populateRoomListFunc) populateRoomListFunc();
    }
}

export async function leaveRoom() {
    if (unsubscribeFromRoom) unsubscribeFromRoom();
    if (unsubscribeFromActions) unsubscribeFromActions();
    
    if (currentRoomId) {
        const roomRef = doc(db, 'matches', currentRoomId);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
            const roomData = roomSnap.data();
            const user = auth.currentUser;
            if (roomData.status !== 'finished' && roomData.playerOrder.includes(user.uid)) {
                const opponentUid = roomData.playerOrder.find(uid => uid !== user.uid);
                if (roomData.playerOrder.length === 1 && roomData.playerOrder[0] === user.uid) {
                    await deleteDoc(roomRef);
                } else if (opponentUid) {
                     await updateDoc(roomRef, { status: 'finished', winner: opponentUid });
                     if (roomData.type === 'ranked') {
                        await updatePlayerStats(opponentUid, user.uid);
                     }
                }
            }
        }
    }
    
    currentRoomId = null;
    unsubscribeFromRoom = null;
    unsubscribeFromActions = null;
    if(Game.isGameRunning) Game.resetGame();
    showScreenFunc('mainMenu');
}


async function getPrincipalDeck(user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || !userSnap.data().principalDeckName) {
        alert("Defina um deck como 'Principal' no Editor de Decks antes de jogar.");
        return null;
    }
    const principalDeckName = userSnap.data().principalDeckName;
    const deckRef = doc(db, 'users', user.uid, 'decks', principalDeckName);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists()) {
        alert(`O seu deck principal "${principalDeckName}" não foi encontrado.`);
        return null;
    }

    return deckSnap.data();
}

export function updateGameState(newGameState) {
    if (!currentRoomId || !newGameState) return;
    const roomRef = doc(db, 'matches', currentRoomId);
    updateDoc(roomRef, { gameState: newGameState });
}

export async function updateScoreAndStartNewGame(winnerUid) {
    if (!currentRoomId) return;
    const roomRef = doc(db, 'matches', currentRoomId);

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) return;

        const roomData = roomSnap.data();
        const loserUid = roomData.playerOrder.find(uid => uid !== winnerUid);
        const newScores = { ...roomData.scores };
        newScores[winnerUid] = (newScores[winnerUid] || 0) + 1;

        if (newScores[winnerUid] >= 2) {
            transaction.update(roomRef, {
                scores: newScores,
                status: 'finished',
                winner: winnerUid
            });
            if (roomData.type === 'ranked') {
                await updatePlayerStats(winnerUid, loserUid);
            }
        } else {
            Game.initOnline(roomData);
            const newGameState = Game.getCurrentGameState(); 
            newGameState.turn = 1;
            newGameState.phase = 0;
            newGameState.currentPlayerUid = loserUid;

            transaction.update(roomRef, {
                scores: newScores,
                gameState: newGameState
            });
        }
    });
}


export async function sendGameAction(action) {
    if (!currentRoomId) return;
    const actionData = { ...action, senderUid: auth.currentUser.uid, timestamp: serverTimestamp() };
    const actionsRef = collection(db, 'matches', currentRoomId, 'game_actions');
    await addDoc(actionsRef, actionData);
}

function listenToRoomUpdates(roomId) {
    if (unsubscribeFromRoom) unsubscribeFromRoom();
    currentRoomId = roomId;

    const roomRef = doc(db, 'matches', roomId);
    unsubscribeFromRoom = onSnapshot(roomRef, async (docSnapshot) => {
        if (!docSnapshot.exists()) {
            if (Game.isGameRunning) alert("A sala foi fechada ou não existe mais.");
            leaveRoom();
            return;
        }

        const roomData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        if (roomData.status === 'ongoing') {
            if (!Game.isGameRunning) {
                Game.startMatch(roomData);
            } else {
                if (roomData.gameState && (roomData.gameState.turn === 1 && Game.turno > 1)) {
                    Game.initOnline(roomData);
                } else {
                    Game.syncGameState(roomData.gameState, roomData.scores);
                }
            }
        } else if (roomData.status === 'finished' && Game.isGameRunning) {
            Game.endMatch(roomData.winner);
        } else if (roomData.status === 'waiting') {
             if (showScreenFunc) showScreenFunc('roomWait');
             if(updateRoomAndWaitScreenFunc) updateRoomAndWaitScreenFunc(roomData);
        }
    });
}

export async function getUserStats(userId) {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().stats) {
        return userSnap.data().stats;
    } else {
        return { wins: 0, losses: 0, xp: 0 };
    }
}


async function updatePlayerStats(winnerUid, loserUid) {
    if (!winnerUid || !loserUid) return;
    
    const winnerRef = doc(db, 'users', winnerUid);
    const loserRef = doc(db, 'users', loserUid);
    
    const xpChange = 25; 

    try {
        await updateDoc(winnerRef, {
            "stats.wins": increment(1),
            "stats.xp": increment(xpChange)
        });
        await updateDoc(loserRef, {
            "stats.losses": increment(1),
            "stats.xp": increment(-xpChange)
        });
    } catch (error) {
        console.error("Erro ao atualizar estatísticas:", error);
    }
}

export async function updateUserXP(userId, amount) {
    if (!userId || !amount) return;
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, {
            "stats.xp": increment(amount)
        });
    } catch (error) {
        console.error(`Erro ao atualizar XP para o utilizador ${userId}:`, error);
    }
}


// --- MATCHMAKING RANQUEADO ---

async function createAndJoinRankedMatch(user, opponent) {
    const userDataSnap = await getDoc(doc(db, 'users', user.uid));
    const opponentDataSnap = await getDoc(doc(db, 'users', opponent.id));
    if (!userDataSnap.exists() || !opponentDataSnap.exists()) throw new Error("Dados de um dos jogadores não encontrados.");

    const userData = userDataSnap.data();
    const opponentData = opponentDataSnap.data();
    
    const userDisplayName = userData.displayName || (userData.email ? userData.email.split('@')[0] : 'Jogador 1');
    const opponentDisplayName = opponentData.displayName || (opponentData.email ? opponentData.email.split('@')[0] : 'Jogador 2');

    const userDeck = await getPrincipalDeck(user);
    const opponentDeck = await getPrincipalDeck({ uid: opponent.id });
    if (!userDeck || !opponentDeck) throw new Error("Deck principal não encontrado para um dos jogadores.");

    let playerOrder = [user.uid, opponent.id];
    if (Math.random() < 0.5) playerOrder.reverse();
    const startingPlayerUid = playerOrder[0];

    const tempGame = Object.assign({}, Game);
    tempGame.jogadores = setupPlayers({
        [user.uid]: { uid: user.uid, displayName: userDisplayName, deck: userDeck },
        [opponent.id]: { uid: opponent.id, displayName: opponentDisplayName, deck: opponentDeck }
    }, playerOrder);
    tempGame.jogadorAtual = tempGame.jogadores.findIndex(p => p.uid === startingPlayerUid);
    const initialState = tempGame.getCurrentGameState();

    const roomDocRef = await addDoc(collection(db, 'matches'), {
        roomName: "Partida Ranqueada",
        type: 'ranked',
        players: {
            [user.uid]: { uid: user.uid, displayName: userDisplayName, deck: { ...userDeck, cards: shuffleArray(userDeck.cards) } },
            [opponent.id]: { uid: opponent.id, displayName: opponentDisplayName, deck: { ...opponentDeck, cards: shuffleArray(opponentDeck.cards) } }
        },
        playerOrder,
        status: 'ongoing',
        createdAt: serverTimestamp(),
        scores: { [user.uid]: 0, [opponent.id]: 0 },
        gameState: initialState
    });

    return roomDocRef;
}

export async function findRankedMatch() {
    const user = auth.currentUser;
    if (!user) return;

    if (!await getPrincipalDeck(user)) {
        document.getElementById('ranked-status').textContent = 'Defina um deck principal primeiro!';
        document.getElementById('find-ranked-match-btn').classList.remove('hidden');
        document.getElementById('cancel-find-ranked-match-btn').classList.add('hidden');
        return;
    }
    
    const userStats = await getUserStats(user.uid);
    const userXP = userStats ? userStats.xp : 0;
    
    const queueRef = collection(db, "matchmakingQueue");
    
    const preferredQuery = query(queueRef, where("xp", ">=", userXP - 200), where("xp", "<=", userXP + 200), orderBy("xp"), orderBy("timestamp"), limit(1));
    let querySnapshot = await getDocs(preferredQuery);
    let opponentDoc = querySnapshot.docs.find(doc => doc.id !== user.uid);

    if (!opponentDoc) {
        const anyOpponentQuery = query(queueRef, orderBy("timestamp"), limit(1));
        querySnapshot = await getDocs(anyOpponentQuery);
        opponentDoc = querySnapshot.docs.find(doc => doc.id !== user.uid);
    }

    if (opponentDoc) {
        try {
            let roomDocRef;
            await runTransaction(db, async (transaction) => {
                const opponentRef = opponentDoc.ref;
                const docInTransaction = await transaction.get(opponentRef);
                if (!docInTransaction.exists()) throw "Oponente já não está na fila.";
                
                roomDocRef = await createAndJoinRankedMatch(user, { id: opponentDoc.id });
                if (!roomDocRef) throw "Falha ao criar a sala da partida.";
                
                transaction.delete(opponentRef);
            });
            listenToRoomUpdates(roomDocRef.id);
        } catch (error) {
            console.error("Matchmaking falhou, a tentar novamente:", error);
            setTimeout(findRankedMatch, 2000);
        }
    } else {
        const queueDoc = doc(db, "matchmakingQueue", user.uid);
        await setDoc(queueDoc, { xp: userXP, timestamp: serverTimestamp() });

        unsubscribeFromQueue = onSnapshot(queueDoc, async (docSnap) => {
            if (!docSnap.exists()) { 
                if (unsubscribeFromQueue) unsubscribeFromQueue();
                unsubscribeFromQueue = null;
                
                const matchesRef = collection(db, "matches");
                const q = query(matchesRef, 
                    where("playerOrder", "array-contains", user.uid), 
                    where("status", "==", "ongoing"), 
                    orderBy("createdAt", "desc"), 
                    limit(1));
                
                const matchSnapshot = await getDocs(q);
                if (!matchSnapshot.empty) {
                    const matchDoc = matchSnapshot.docs[0];
                    listenToRoomUpdates(matchDoc.id);
                }
            }
        });
    }
}

export async function cancelFindRankedMatch() {
    if (unsubscribeFromQueue) {
        unsubscribeFromQueue();
        unsubscribeFromQueue = null;
    }
    const user = auth.currentUser;
    if (!user) return;
    const queueDoc = doc(db, "matchmakingQueue", user.uid);
    try {
        const docSnap = await getDoc(queueDoc);
        if (docSnap.exists()) {
            await deleteDoc(queueDoc);
        }
    } catch(e) {
        console.error("Erro ao cancelar busca:", e);
    }
}