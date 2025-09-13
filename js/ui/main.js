// js/ui/main.js

import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { signUpUser, signInUser, signOutUser, getOpenRooms, createRoom, joinRoom, leaveRoom, setOnlineSystemCallbacks } from '../firebase/online.js';
import { DeckBuilder } from './deckbuilder.js';
import { Game } from '../game/game.js';

let isWaitingInRoom = false;
const screens = {};

function showScreen(screenName) {
    if (screenName === 'roomWait') {
        isWaitingInRoom = true;
        window.addEventListener('beforeunload', leaveRoom);
    } else {
        isWaitingInRoom = false;
        window.removeEventListener('beforeunload', leaveRoom);
    }

    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.add('hidden');
    });

    const targetScreen = screens[screenName];
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    } else {
        console.error(`Tela não encontrada: ${screenName}`);
    }
}

async function populateRoomList() {
    const roomListContainer = document.getElementById('room-list-container');
    if (!roomListContainer) return;
    roomListContainer.innerHTML = '<p>A carregar salas...</p>';
    try {
        const rooms = await getOpenRooms();
        if (rooms.length === 0) {
            roomListContainer.innerHTML = '<p>Nenhuma sala aberta. Crie uma!</p>';
            return;
        }
        roomListContainer.innerHTML = '';
        rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            const playerHost = room.players[room.playerOrder[0]].displayName;
            roomElement.innerHTML = `<span>${room.roomName} (Host: ${playerHost})</span>`;
            const joinBtn = document.createElement('button');
            joinBtn.textContent = 'Entrar';
            joinBtn.onclick = () => joinRoom(room.id);
            roomElement.appendChild(joinBtn);
            roomListContainer.appendChild(roomElement);
        });
    } catch (error) {
        console.error("Erro ao carregar salas:", error);
        roomListContainer.innerHTML = '<p>Erro ao carregar salas. Tente novamente.</p>';
    }
}

function updateRoomAndWaitScreen(roomData) {
    document.getElementById('room-wait-title').textContent = `Sala: ${roomData.roomName}`;
    const p1Slot = document.getElementById('player1-name-slot');
    const p2Slot = document.getElementById('player2-name-slot');
    
    const player1UID = roomData.playerOrder[0];
    const player1Name = roomData.players[player1UID]?.displayName || 'Aguardando...';
    p1Slot.textContent = `Jogador 1: ${player1Name}`;

    if (roomData.playerOrder.length > 1) {
        const player2UID = roomData.playerOrder[1];
        const player2Name = roomData.players[player2UID]?.displayName || 'Aguardando...';
        p2Slot.textContent = `Jogador 2: ${player2Name}`;
    } else {
        p2Slot.textContent = 'Jogador 2: Aguardando...';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    screens.auth = document.getElementById('auth-screen');
    screens.mainMenu = document.getElementById('main-menu-screen');
    screens.lobbyList = document.getElementById('lobby-list-screen');
    screens.roomWait = document.getElementById('room-wait-screen');
    screens.deckBuilder = document.getElementById('deck-builder-screen');
    screens.game = document.getElementById('game-screen');

    // CORREÇÃO: Passa a função showScreen para o Game module
    Game.setScreenChanger(showScreen);
    
    setOnlineSystemCallbacks({
        showScreen: showScreen,
        updateRoomAndWaitScreen: updateRoomAndWaitScreen,
        populateRoomList: populateRoomList
    });

    const buttons = {
        loginBtn: document.getElementById('login-btn'),
        signupBtn: document.getElementById('signup-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        goToLobbyBtn: document.getElementById('goto-lobby-btn'),
        goToDeckbuilder: document.getElementById('goto-deckbuilder-btn'),
        lobbyBackToMenuBtn: document.getElementById('lobby-back-to-menu-btn'),
        createRoomBtn: document.getElementById('create-room-btn'),
        refreshRoomsBtn: document.getElementById('refresh-rooms-btn'),
        leaveRoomBtn: document.getElementById('leave-room-btn'),
        backToMenu: document.getElementById('back-to-menu-btn'),
    };
    const inputs = {
        email: document.getElementById('email-input'),
        password: document.getElementById('password-input')
    };
    const welcomeMessage = document.getElementById('welcome-message');

    onAuthStateChanged(auth, user => {
        if (user) {
            welcomeMessage.textContent = `Bem-vindo, ${user.email.split('@')[0]}!`;
            showScreen('mainMenu');
        } else {
            showScreen('auth');
        }
    });

    buttons.loginBtn.addEventListener('click', () => {
        const email = inputs.email.value;
        const password = inputs.password.value;
        if (email && password) signInUser(email, password);
    });
    buttons.signupBtn.addEventListener('click', () => {
        const email = inputs.email.value;
        const password = inputs.password.value;
        if (email && password) signUpUser(email, password);
    });
    buttons.logoutBtn.addEventListener('click', signOutUser);
    buttons.goToLobbyBtn.addEventListener('click', () => {
        showScreen('lobbyList');
        populateRoomList();
    });
    buttons.createRoomBtn.addEventListener('click', () => {
        const roomName = prompt("Digite o nome da sua sala:", `Sala de ${auth.currentUser.email.split('@')[0]}`);
        if (roomName && roomName.trim() !== '') {
            createRoom(roomName.trim());
        }
    });
    buttons.refreshRoomsBtn.addEventListener('click', populateRoomList);
    buttons.leaveRoomBtn.addEventListener('click', leaveRoom);
    buttons.lobbyBackToMenuBtn.addEventListener('click', () => showScreen('mainMenu'));
    buttons.goToDeckbuilder.addEventListener('click', async () => {
        showScreen('deckBuilder');
        await DeckBuilder.init();
    });
    buttons.backToMenu.addEventListener('click', () => {
        showScreen('mainMenu');
    });
});

