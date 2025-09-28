// js/firebase/online.js

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, setDoc, getDocs, addDoc, collection, serverTimestamp, query, where, onSnapshot, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { Game } from '../game/game.js';

let showScreenFunc;
let updateRoomAndWaitScreenFunc;
let populateRoomListFunc;
let unsubscribeFromRoom = null;
let unsubscribeFromActions = null;
let currentRoomId = null;

export function listenToGameActions(roomId) {
    if (unsubscribeFromActions) unsubscribeFromActions();
    
    const actionsRef = collection(db, 'matches', roomId, 'game_actions');
    const q = query(actionsRef, orderBy("timestamp"));

    unsubscribeFromActions = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const action = change.doc.data();
                // Modelo Duelingbook: O servidor envia a ação para TODOS, incluindo o remetente.
                // O cliente processa todas as ações que vêm do servidor.
                Game.handleIncomingAction(action);
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
            stats: { wins: 0, losses: 0 }
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
        await signOut(auth);
    } catch (error) {
        alert("Erro ao sair: " + error.message);
    }
}

export async function getOpenRooms() {
    const roomsRef = collection(db, 'matches');
    const q = query(roomsRef, where("status", "==", "waiting"));
    const querySnapshot = await getDocs(q);
    
    const rooms = [];
    querySnapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() });
    });
    return rooms;
}

export async function createRoom(roomName) {
    const user = auth.currentUser;
    if (!user) return alert("Precisa de estar logado.");

    const deckData = await getPrincipalDeck(user);
    if (!deckData) return;

    const newRoomData = {
        roomName: roomName,
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
    } catch (error) {
        console.error("Erro ao criar a sala:", error);
    }
}

export async function joinRoom(roomId) {
    const user = auth.currentUser;
    if (!user) return alert("Precisa de estar logado.");

    const deckData = await getPrincipalDeck(user);
    if (!deckData) return;

    const roomRef = doc(db, 'matches', roomId);
    
    try {
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists() || roomSnap.data().status !== 'waiting' || roomSnap.data().playerOrder.length >= 2) {
            alert("Sala não disponível ou já está cheia.");
            if (populateRoomListFunc) populateRoomListFunc();
            return;
        }

        const hostUID = roomSnap.data().playerOrder[0];
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const hostDeck = roomSnap.data().players[hostUID].deck.cards;
        
        currentRoomId = roomId;

        await updateDoc(roomRef, {
            [`players.${user.uid}`]: { uid: user.uid, displayName: user.email.split('@')[0], deck: deckData },
            [`players.${hostUID}.deck.cards`]: shuffleArray([...hostDeck]),
            [`players.${user.uid}.deck.cards`]: shuffleArray([...deckData.cards]),
            playerOrder: [...roomSnap.data().playerOrder, user.uid],
            status: 'ongoing', // Jogo começa diretamente
            gameState: {
                turn: 1,
                phase: 0,
                currentPlayerUid: hostUID
            }
        });
        
        listenToRoomUpdates(roomId);

    } catch (error) {
        console.error("Erro ao entrar na sala:", error);
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
                if (opponentUid) {
                    await updateDoc(roomRef, {
                        status: 'finished',
                        winner: opponentUid
                    });
                } else {
                    await deleteDoc(roomRef);
                }
            }
        }
    }
    
    currentRoomId = null;
    unsubscribeFromRoom = null;
    unsubscribeFromActions = null;
    if (showScreenFunc) showScreenFunc('lobbyList');
    if (populateRoomListFunc) populateRoomListFunc();
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
    if (!currentRoomId) return;
    const roomRef = doc(db, 'matches', currentRoomId);
    updateDoc(roomRef, { gameState: newGameState });
}

// CORREÇÃO: Adicionada a palavra-chave "export" para tornar a função pública
export async function updateScoreAndStartNewGame(winnerUid) {
    if (!currentRoomId) return;
    const roomRef = doc(db, 'matches', currentRoomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;

    const roomData = roomSnap.data();
    const newScores = { ...roomData.scores };
    newScores[winnerUid] = (newScores[winnerUid] || 0) + 1;

    if (newScores[winnerUid] >= 2) {
        await updateDoc(roomRef, {
            scores: newScores,
            status: 'finished',
            winner: winnerUid
        });
    } else {
        const startingPlayerUid = roomData.playerOrder.find(uid => uid !== winnerUid);
        const newGameState = {
            turn: 1, phase: 0,
            currentPlayerUid: startingPlayerUid
        };
        // Reset dos decks e mãos seria necessário aqui numa implementação completa
        await updateDoc(roomRef, {
            scores: newScores,
            gameState: newGameState
        });
    }
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
            alert("A sala foi fechada.");
            leaveRoom();
            return;
        }

        const roomData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        if (roomData.status === 'ongoing') {
            if (!Game.isGameRunning) {
                Game.startMatch(roomData);
            } else if (roomData.gameState) {
                Game.syncGameState(roomData.gameState, roomData.scores);
            }
        } else if (roomData.status === 'finished' && Game.isGameRunning) {
            Game.endMatch(roomData.winner);
        } else if (updateRoomAndWaitScreenFunc) {
            updateRoomAndWaitScreenFunc(roomData);
        }
    });
}

