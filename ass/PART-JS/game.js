// Evento que espera o HTML ser carregado
document.addEventListener('DOMContentLoaded', () => {

    // --- Estado Global do Jogo (A "Memória" do Jogo) ---
    // Um objeto 'state' guarda todas as informações que mudam durante o jogo.
    const state = {
        playerNames: { X: "Jogador Verde", O: "Jogador Rosa" }, // Nomes padrão
        scores: { X: 0, O: 0 }, // Pontuação de "X-Bolas" (quadrantes)
        currentPlayer: 'X', // Quem começa
        gameTimerInterval: null, // Variável para guardar o temporizador
        timeRemaining: 0, // Tempo em segundos
        nextBigGrid: 'any', // Qual o próximo quadrante (0-8) ou 'any' (qualquer)
        
        // Array com 9 posições para o tabuleiro grande:
        // '' (ativo), 'X' (X ganhou), 'O' (O ganhou), 'D' (Empate)
        bigBoardState: Array(9).fill(''),
        
        // Um array de 9 arrays (um para cada quadrante).
        // Cada um desses 9 arrays tem 9 posições ('', 'X', 'O')
        smallBoards: Array(9).fill(null).map(() => Array(9).fill('')),
        
        isActive: false, // O jogo está rodando? (Impede cliques após o fim)
        
        // Array com todas as combinações de vitória (linhas, colunas, diagonais)
        winConditions: [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
            [0, 4, 8], [2, 4, 6]  // Diagonais
        ]
    };

    // --- Elementos DOM (Página do Jogo) ---
    // Guarda os elementos do HTML em variáveis para acesso rápido
    const buttons = {
        newGame: document.getElementById('btn-new-game'), // Botão de "Novo Jogo"
        playAgain: document.getElementById('btn-play-again') // Botão "Jogar Novamente" (no modal)
    };

    const ui = {
        player1ScoreName: document.getElementById('player1-score-name'),
        player1Score: document.getElementById('player1-score'),
        player2ScoreName: document.getElementById('player2-score-name'),
        player2Score: document.getElementById('player2-score'),
        timerDisplay: document.getElementById('timer-display'),
        turnInfo: document.getElementById('turn-info'),
        gameBoard: document.getElementById('game-board'),
        messageModal: document.getElementById('message-modal'),
        messageText: document.getElementById('message-text')
    };

    // --- Funções de Inicialização ---
    
    // Função principal que começa ou reinicia o jogo
    function startGame() {
        // Limpa o timer anterior, se existir
        if (state.gameTimerInterval) {
            clearInterval(state.gameTimerInterval);
        }

        // --- LER DADOS DO LOCALSTORAGE ---
        // Pega os dados que 'login.js' salvou
        const p1Name = localStorage.getItem('player1Name') || 'Jogador Verde';
        const p2Name = localStorage.getItem('player2Name') || 'Jogador Rosa';
        const timerSetting = parseInt(localStorage.getItem('gameTimer') || '0');
        
        // Atualiza o 'state' com os dados salvos
        state.playerNames.X = p1Name;
        state.playerNames.O = p2Name;
        state.timeRemaining = timerSetting;

        // Reseta o 'state' para um novo jogo
        state.scores = { X: 0, O: 0 };
        state.currentPlayer = 'X';
        state.nextBigGrid = 'any'; // Primeiro jogador joga em qualquer lugar
        state.bigBoardState = Array(9).fill('');
        state.smallBoards = Array(9).fill(null).map(() => Array(9).fill(''));
        state.isActive = true;
        
        // Cria o tabuleiro HTML dinamicamente
        createBoard();
        
        // Atualiza a interface (UI)
        updateScoreboard();
        updateTurnInfo();
        updateActiveBoardUI();
        ui.messageModal.classList.add('hidden'); // Esconde o modal
        ui.gameBoard.classList.remove('game-over'); // Ativa cliques no tabuleiro
        
        // Inicia o timer
        if (state.timeRemaining > 0) {
            startTimer();
        } else {
            ui.timerDisplay.textContent = "--:--";
        }
    }

    // Função que cria o HTML do tabuleiro (9 quadrantes * 9 células)
    function createBoard() {
        ui.gameBoard.innerHTML = ''; // Limpa o tabuleiro antigo
        
        // Loop de 0 a 8 (para os 9 quadrantes grandes)
        for (let i = 0; i < 9; i++) {
            const bigCell = document.createElement('div');
            bigCell.className = 'big-cell';
            bigCell.dataset.bigIndex = i; // Guarda o índice (0-8) no elemento

            const smallBoard = document.createElement('div');
            smallBoard.className = 'small-board';

            // Loop de 0 a 8 (para as 9 células pequenas dentro do quadrante)
            for (let j = 0; j < 9; j++) {
                const smallCell = document.createElement('div');
                smallCell.className = 'small-cell';
                smallCell.dataset.bigIndex = i; // Guarda o índice do quadrante
                smallCell.dataset.smallIndex = j; // Guarda o índice da célula
                
                // Adiciona o "ouvinte" de clique em cada célula pequena
                smallCell.addEventListener('click', handleCellClick);
                
                smallBoard.appendChild(smallCell);
            }
            bigCell.appendChild(smallBoard);
            ui.gameBoard.appendChild(bigCell);
        }
    }

    // --- Funções de UI Update (Atualização da Interface) ---
    
    // Atualiza o placar com os nomes e pontos
    function updateScoreboard() {
        ui.player1ScoreName.textContent = state.playerNames.X;
        ui.player2ScoreName.textContent = state.playerNames.O;
        ui.player1Score.textContent = state.scores.X;
        ui.player2Score.textContent = state.scores.O;
    }

    // Mostra de quem é a vez
    function updateTurnInfo() {
        const playerName = state.playerNames[state.currentPlayer]; // Pega o nome (X ou O)
        ui.turnInfo.textContent = `Vez de: ${playerName}`;
        
        // Muda a cor do texto de acordo com o jogador
        if (state.currentPlayer === 'X') {
            ui.turnInfo.style.color = '#15803d'; // Verde
        } else {
            ui.turnInfo.style.color = '#be123c'; // Rosa
        }
    }

    // Atualiza o destaque visual de qual(is) quadrante(s) estão ativos
    function updateActiveBoardUI() {
        const bigCells = document.querySelectorAll('.big-cell');
        
        bigCells.forEach((cell, index) => {
            // Remove destaques antigos
            cell.classList.remove('active-board', 'free-play');
            
            if (state.isActive) {
                if (state.nextBigGrid === 'any') {
                    // Se for 'any', destaca todos os quadrantes *jogáveis*
                    if (state.bigBoardState[index] === '') { // '' significa jogável
                        cell.classList.add('free-play'); // Destaque amarelo
                    }
                } else if (index === state.nextBigGrid) {
                    // Se for um quadrante específico, destaca ele
                    cell.classList.add('active-board'); // Destaque verde
                }
            }
        });
    }
    
    // --- Funções do Temporizador ---
    function startTimer() {
        updateTimerDisplay(); // Mostra o tempo inicial
        // 'setInterval' executa uma função a cada X milissegundos (1000ms = 1s)
        state.gameTimerInterval = setInterval(() => {
            state.timeRemaining--; // Reduz 1 segundo
            updateTimerDisplay(); // Atualiza o mostrador

            // Se o tempo acabar
            if (state.timeRemaining <= 0) {
                clearInterval(state.gameTimerInterval); // Para o temporizador
                endGameByTime(); // Chama a função de fim de jogo por tempo
            }
        }, 1000);
    }

    // Formata os segundos (ex: 300) para "05:00"
    function updateTimerDisplay() {
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        ui.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // --- LÓGICA PRINCIPAL DO JOGO (A mais importante) ---
    
    // Função chamada QUANDO uma célula pequena é clicada
    function handleCellClick(event) {
        // 'event.target' é o elemento HTML que foi clicado (a .small-cell)
        if (!state.isActive) return; // Ignora o clique se o jogo acabou

        const cell = event.target;
        const bigIndex = parseInt(cell.dataset.bigIndex); // Quadrante (0-8)
        const smallIndex = parseInt(cell.dataset.smallIndex); // Célula (0-8)

        // --- 1. Verifica se a jogada é VÁLIDA ---
        const isValidMove = 
            state.smallBoards[bigIndex][smallIndex] === '' && // Célula está vazia?
            state.bigBoardState[bigIndex] === '' && // Quadrante não foi ganho?
            (state.nextBigGrid === 'any' || state.nextBigGrid === bigIndex); // É o quadrante correto?
        
        if (!isValidMove) {
            return; // Se não for válida, para a função aqui
        }

        // --- 2. Realiza a Jogada ---
        // Atualiza o 'state' (memória)
        state.smallBoards[bigIndex][smallIndex] = state.currentPlayer;
        // Atualiza a UI (tela)
        cell.textContent = state.currentPlayer;
        cell.classList.add(state.currentPlayer === 'X' ? 'text-x' : 'text-o');
        cell.style.cursor = 'default'; // Tira o cursor de "mãozinha"

        // --- 3. Verifica Vitória no Quadrante Pequeno ---
        const smallBoardArray = state.smallBoards[bigIndex];
        if (checkWin(smallBoardArray, state.currentPlayer)) {
            // Se ganhou o quadrante:
            state.bigBoardState[bigIndex] = state.currentPlayer; // Marca no 'state' grande
            state.scores[state.currentPlayer]++; // Incrementa pontuação (Regra 4)
            document.querySelector(`.big-cell[data-big-index="${bigIndex}"]`).classList.add(state.currentPlayer === 'X' ? 'won-x' : 'won-o'); // Adiciona classe (X ou O gigante)
            updateScoreboard(); // Atualiza o placar
            
            // 3a. Verifica se essa jogada ganhou o JOGO INTEIRO
            if (checkWin(state.bigBoardState, state.currentPlayer)) {
                endGame(false); // Chama o fim de jogo (não foi empate)
                return; // Para a função
            }

        } else if (checkDraw(smallBoardArray)) {
            // 3b. Verifica se o quadrante pequeno EMPATOU
            state.bigBoardState[bigIndex] = 'D'; // 'D' de Draw (Empate)
            document.querySelector(`.big-cell[data-big-index="${bigIndex}"]`).classList.add('draw');
        }

        // --- 4. Verifica se o JOGO INTEIRO Empatou ---
        // (Se todos os quadrantes grandes estão preenchidos/ganhos)
        if (checkDraw(state.bigBoardState)) {
            endGame(true); // Fim de jogo (foi empate de tabuleiro)
            return;
        }

        // --- 5. Determina o Próximo Quadrante (REGRA PRINCIPAL) ---
        // O 'smallIndex' (0-8) da jogada atual vira o 'bigIndex' (0-8) da próxima
        if (state.bigBoardState[smallIndex] !== '') {
            // Se o quadrante de destino já foi ganho ('X', 'O') ou empatado ('D')
            state.nextBigGrid = 'any'; // Próximo jogador pode jogar em qualquer lugar
        } else {
            // Caso contrário, define o próximo quadrante
            state.nextBigGrid = smallIndex;
        }

        // --- 6. Passa o Turno ---
        switchPlayer();
    }

    // Alterna entre 'X' e 'O'
    function switchPlayer() {
        state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        updateTurnInfo(); // Atualiza "Vez de:"
        updateActiveBoardUI(); // Atualiza o destaque do tabuleiro
    }

    // Função genérica para checar vitória (usada para tabuleiros pequenos E grande)
    function checkWin(board, player) {
        // 'board' é um array de 9 posições
        // 'player' é 'X' ou 'O'
        // Itera por todas as 'winConditions' definidas no 'state'
        for (const combination of state.winConditions) {
            const [a, b, c] = combination; // ex: [0, 1, 2]
            if (
                board[a] === player && // Posição 0 é do jogador?
                board[b] === player && // Posição 1 é do jogador?
                board[c] === player   // Posição 2 é do jogador?
            ) {
                return true; // Se sim, venceu
            }
        }
        return false; // Se não encontrou nenhuma, não venceu
    }

    // Função genérica para checar empate (tabuleiro cheio)
    function checkDraw(board) {
        // 'board' é um array de 9 posições
        // '.every' checa se TODAS as posições satisfazem a condição
        // A condição é: célula NÃO ESTÁ vazia ('')
        return board.every(cell => cell !== '');
    }

    // --- Funções de Fim de Jogo ---
    
    // Chamada quando há 3 quadrantes em linha (isBoardDraw = false)
    // ou quando o tabuleiro grande enche (isBoardDraw = true)
    function endGame(isBoardDraw) {
        state.isActive = false; // Desativa o jogo
        if (state.gameTimerInterval) {
            clearInterval(state.gameTimerInterval); // Para o timer
        }
        ui.gameBoard.classList.add('game-over'); // Classe CSS para bloquear cliques
        
        let message = '';
        if (isBoardDraw) {
            // Se o tabuleiro grande empatou, decide pela pontuação (Regra 4)
            message = getWinnerByScore();
        } else {
            // Se foi vitória por 3 em linha
            const winnerName = state.playerNames[state.currentPlayer];
            message = `${winnerName} venceu o jogo!`;
        }

        ui.messageText.textContent = message; // Define a mensagem no modal
        ui.messageModal.classList.remove('hidden'); // Mostra o modal
    }
    
    // Chamada quando o tempo acaba
    function endGameByTime() {
        state.isActive = false;
        if (state.gameTimerInterval) {
            clearInterval(state.gameTimerInterval);
        }
        ui.gameBoard.classList.add('game-over');
        
        // Decide pela pontuação (Regra 4)
        const message = getWinnerByScore();
        
        ui.messageText.textContent = `Tempo esgotado! ${message}`;
        ui.messageModal.classList.remove('hidden');
    }
    
    function getWinnerByScore() {
        if (state.scores.X > state.scores.O) {
            return `${state.playerNames.X} venceu por pontos (${state.scores.X} a ${state.scores.O})!`;
        } else if (state.scores.O > state.scores.X) {
            return `${state.playerNames.O} venceu por pontos (${state.scores.O} a ${state.scores.X})!`;
        } else {
            return `O jogo empatou por pontos (${state.scores.X} a ${state.scores.X})!`;
        }
    }

    buttons.newGame.addEventListener('click', () => {
        window.location.href = 'login.html'; 
    });
    
    buttons.playAgain.addEventListener('click', startGame);

   
    startGame();
});