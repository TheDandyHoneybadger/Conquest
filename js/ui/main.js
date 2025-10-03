// js/ui/main.js

import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { signUpUser, signInUser, signOutUser, getOpenRooms, createRoom, joinRoom, leaveRoom, setOnlineSystemCallbacks, findRankedMatch, cancelFindRankedMatch, getUserStats } from '../firebase/online.js';
import { DeckBuilder } from './deckbuilder.js';
import { Game } from '../game/game.js';

const screens = {};

function showScreen(screenName) {
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
    const roomWaitTitle = document.getElementById('room-wait-title');
    if (roomWaitTitle) roomWaitTitle.textContent = `Sala: ${roomData.roomName}`;
    
    const p1Slot = document.getElementById('player1-name-slot');
    const p2Slot = document.getElementById('player2-name-slot');
    
    const player1UID = roomData.playerOrder[0];
    const player1Name = roomData.players[player1UID]?.displayName || 'Aguardando...';
    if(p1Slot) p1Slot.textContent = `Jogador 1: ${player1Name}`;

    if (roomData.playerOrder.length > 1) {
        const player2UID = roomData.playerOrder[1];
        const player2Name = roomData.players[player2UID]?.displayName || 'Aguardando...';
        if (p2Slot) p2Slot.textContent = `Jogador 2: ${player2Name}`;
    } else {
        if (p2Slot) p2Slot.textContent = 'Jogador 2: Aguardando...';
    }
}

async function loadProfileStats() {
    const statsContainer = document.getElementById('profile-stats-container');
    if (!statsContainer) return;
    statsContainer.innerHTML = '<p>A carregar estatísticas...</p>';
    
    const user = auth.currentUser;
    if (user) {
        const stats = await getUserStats(user.uid);
        if (stats) {
            statsContainer.innerHTML = `
                <p><strong>Vitórias/Derrotas:</strong> ${stats.wins} / ${stats.losses}</p>
                <p><strong>Experiência (XP):</strong> ${stats.xp}</p>
            `;
        } else {
            statsContainer.innerHTML = '<p>Não foi possível carregar as estatísticas.</p>';
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    screens.auth = document.getElementById('auth-screen');
    screens.mainMenu = document.getElementById('main-menu-screen');
    screens.lobbyList = document.getElementById('lobby-list-screen');
    screens.roomWait = document.getElementById('room-wait-screen');
    screens.deckBuilder = document.getElementById('deck-builder-screen');
    screens.game = document.getElementById('game-screen');
    screens.profile = document.getElementById('profile-screen');


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
        goToDeckbuilderBtn: document.getElementById('goto-deckbuilder-btn'),
        goToProfileBtn: document.getElementById('goto-profile-btn'),
        goToRankingsBtn: document.getElementById('goto-rankings-btn'),
        lobbyBackToMenuBtn: document.getElementById('lobby-back-to-menu-btn'),
        profileBackToMenuBtn: document.getElementById('profile-back-to-menu-btn'),
        createRoomBtn: document.getElementById('create-room-btn'),
        refreshRoomsBtn: document.getElementById('refresh-rooms-btn'),
        leaveRoomBtn: document.getElementById('leave-room-btn'),
        backToMenu: document.getElementById('back-to-menu-btn'),
        findRankedMatchBtn: document.getElementById('find-ranked-match-btn'),
        cancelFindRankedMatchBtn: document.getElementById('cancel-find-ranked-match-btn'),
    };
    const inputs = {
        email: document.getElementById('email-input'),
        password: document.getElementById('password-input')
    };
    const welcomeMessage = document.getElementById('welcome-message');

    onAuthStateChanged(auth, user => {
        if (user) {
            if (welcomeMessage) {
                welcomeMessage.textContent = `Bem-vindo, ${user.email.split('@')[0]}!`;
            }
            showScreen('mainMenu');
        } else {
            showScreen('auth');
        }
    });

    if (buttons.loginBtn) {
        buttons.loginBtn.addEventListener('click', () => {
            const email = inputs.email.value;
            const password = inputs.password.value;
            if (email && password) signInUser(email, password);
        });
    }

    if (buttons.signupBtn) {
        buttons.signupBtn.addEventListener('click', () => {
            const email = inputs.email.value;
            const password = inputs.password.value;
            if (email && password) signUpUser(email, password);
        });
    }

    if (buttons.logoutBtn) buttons.logoutBtn.addEventListener('click', signOutUser);
    
    if (buttons.goToLobbyBtn) {
        buttons.goToLobbyBtn.addEventListener('click', () => {
            showScreen('lobbyList');
            populateRoomList();
        });
    }
    
    if (buttons.goToProfileBtn) {
        buttons.goToProfileBtn.addEventListener('click', () => {
            showScreen('profile');
            loadProfileStats();
        });
    }
    
    if (buttons.goToRankingsBtn) {
        buttons.goToRankingsBtn.addEventListener('click', () => {
            alert('Tela de Rankings em construção!');
        });
    }

    if (buttons.createRoomBtn) {
        buttons.createRoomBtn.addEventListener('click', () => {
            const roomName = prompt("Digite o nome da sua sala:", `Sala de ${auth.currentUser.email.split('@')[0]}`);
            if (roomName && roomName.trim() !== '') {
                createRoom(roomName.trim());
            }
        });
    }
    
    if (buttons.refreshRoomsBtn) buttons.refreshRoomsBtn.addEventListener('click', populateRoomList);
    if (buttons.leaveRoomBtn) buttons.leaveRoomBtn.addEventListener('click', leaveRoom);
    if (buttons.lobbyBackToMenuBtn) {
        buttons.lobbyBackToMenuBtn.addEventListener('click', () => {
            cancelFindRankedMatch(); // Garante que sai da fila se voltar ao menu
            showScreen('mainMenu');
        });
    }
    if (buttons.profileBackToMenuBtn) buttons.profileBackToMenuBtn.addEventListener('click', () => showScreen('mainMenu'));
    
    if (buttons.goToDeckbuilderBtn) {
        buttons.goToDeckbuilderBtn.addEventListener('click', async () => {
            showScreen('deckBuilder');
            await DeckBuilder.init();
        });
    }
    
    if (buttons.backToMenu) buttons.backToMenu.addEventListener('click', () => showScreen('mainMenu'));

    if (buttons.findRankedMatchBtn) {
        buttons.findRankedMatchBtn.addEventListener('click', () => {
            document.getElementById('ranked-status').textContent = 'A procurar oponente...';
            buttons.findRankedMatchBtn.classList.add('hidden');
            buttons.cancelFindRankedMatchBtn.classList.remove('hidden');
            findRankedMatch();
        });
    }
    
    if (buttons.cancelFindRankedMatchBtn) {
        buttons.cancelFindRankedMatchBtn.addEventListener('click', () => {
            document.getElementById('ranked-status').textContent = '';
            buttons.findRankedMatchBtn.classList.remove('hidden');
            buttons.cancelFindRankedMatchBtn.classList.add('hidden');
            cancelFindRankedMatch();
        });
    }
});