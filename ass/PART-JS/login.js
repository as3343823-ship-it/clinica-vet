document.addEventListener('DOMContentLoaded', () => {

    const screenRules = document.getElementById('screen-rules');
    const screenSetup = document.getElementById('screen-setup');
    
    const btnRulesNext = document.getElementById('btn-rules-next');
    const btnStartGame = document.getElementById('btn-start-game');

    btnRulesNext.addEventListener('click', () => {

        screenRules.classList.add('hidden');
        screenSetup.classList.remove('hidden');
    });

    btnStartGame.addEventListener('click', () => {
        
        const player1Name = document.getElementById('player1-name').value;
        const player2Name = document.getElementById('player2-name').value;
        const gameTimer = document.getElementById('game-timer').value;

        localStorage.setItem('player1Name', player1Name);
        localStorage.setItem('player2Name', player2Name);
        localStorage.setItem('gameTimer', gameTimer);

        window.location.href = 'game.html';
    });
});