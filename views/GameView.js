import audioManager from '../js/AudioManager.js';
import {ADS} from '../js/config.js';

class GameView {
    constructor() {
        this.element = this.createElement();
        this.currentTarget = null;
        this.currentTimeout = null;
        this.globalTimer = null;
        this.isPaused = false;
        this.timerStartTime = null;
        this.timeRemaining = null;
        this.score = 0;
        this.currentPoints = 0;
        this.onPlayAgainCallback = null;
        this.onQuitCallback = null;
    }

    createElement() {
        const view = document.createElement('div');
        view.className = 'view game-view';
        
        // Create and append background
        const background = document.createElement('div');
        background.className = 'game-background';
        view.appendChild(background);
        
        view.innerHTML += `
            <div class="game-ui-container">
                <div id="timer-container">
                    <div class="timer-wrapper">
                        <div id="timer-bar"></div>
                    </div>
                </div>
                <div class="game-header">
                    <div class="header-left">
                        <div class="game-title">Target Rush</div>
                        <div class="score-container">
                            <div id="score">Score: <span class="score-value">0</span></div>
                            <div class="score-animation"></div>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="high-score">Best: <span class="high-score-value">0</span></div>
                        <button class="pause-btn" aria-label="Pause Game">
                            <i class="fas fa-pause"></i>
                        </button>
                    </div>
                </div>
                <div id="game-container"></div>
                <div class="game-overlay">
                    <div class="pause-menu">
                        <div class="menu-header">
                            <i class="fas fa-pause-circle"></i>
                            <h2>Paused</h2>
                        </div>
                        <div class="pause-menu-buttons">
                            <button class="menu-btn resume-btn">
                                <i class="fas fa-play"></i>
                                Resume
                            </button>
                            <button class="menu-btn restart-btn">
                                <i class="fas fa-redo"></i>
                                Restart
                            </button>
                            <button class="menu-btn quit-btn">
                                <i class="fas fa-home"></i>
                                Quit to Menu
                            </button>
                        </div>
                    </div>
                    <div class="game-over-menu">
                        <div class="menu-header">
                            <i class="fas fa-trophy"></i>
                            <h2>Game Over!</h2>
                        </div>
                        <div class="game-stats">
                            <div class="stat-item">
                                <i class="fas fa-star"></i>
                                Score: <span class="final-score">0</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-crown"></i>
                                Best Score: <span class="final-best-score">0</span>
                            </div>
                        </div>
                        <div class="pause-menu-buttons">
                            <button class="menu-btn play-again-btn">
                                <i class="fas fa-redo"></i>
                                Play Again
                            </button>
                            <button class="menu-btn quit-btn">
                                <i class="fas fa-home"></i>
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return view;
    }

    initialize(settings) {
        this.settings = settings;
        this.gameContainer = this.element.querySelector('#game-container');
        this.scoreElement = this.element.querySelector('#score');
        this.highScoreElement = this.element.querySelector('.high-score');
        this.timerBar = this.element.querySelector('#timer-bar');
        this.pauseMenu = this.element.querySelector('.pause-menu');
        this.gameOverMenu = this.element.querySelector('.game-over-menu');
        this.isPaused = false;
        this.timeRemaining = null;
        this.timerStartTime = null;
        this.score = 0;
        this.clearTimers();
        
        // Set game volume and ensure music is playing
        audioManager.setGameVolume();
        if (audioManager.isMusicEnabled()) {
            audioManager.playMusic();
        }
        
        // Reset timer bar
        this.updateTimer(settings.timeLimit, settings.timeLimit);
        
        // Initialize scores
        this.updateScore();
        this.updateHighScore(parseInt(localStorage.getItem('tapGame_highScore')) || 0);
        
        // Initialize pause button
        const pauseBtn = this.element.querySelector('.pause-btn');
        const overlay = this.element.querySelector('.game-overlay');
        
        // Remove old event listeners
        const newPauseBtn = pauseBtn.cloneNode(true);
        pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);
        
        // Add new event listener
        newPauseBtn.addEventListener('click', () => this.togglePause());
        overlay.style.display = 'none';
        this.gameOverMenu.style.display = 'none';
        this.pauseMenu.style.display = 'none';
    }

    show() {
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
        // Restore menu volume when leaving game view
        audioManager.setMenuVolume();
    }

    updateScore() {
        this.scoreElement.querySelector('.score-value').textContent = this.score;
        const currentBest = parseInt(localStorage.getItem('tapGame_highScore')) || 0;
        if (this.score > currentBest) {
            localStorage.setItem('tapGame_highScore', this.score);
            this.updateHighScore(this.score);
        }
    }

    updateHighScore(score) {
        const highScore = Math.max(score, parseInt(localStorage.getItem('tapGame_highScore')) || 0);
        localStorage.setItem('tapGame_highScore', highScore);
        this.highScoreElement.querySelector('.high-score-value').textContent = highScore;
    }

    updateTimer(timeLeft, totalTime) {
        const percentage = (timeLeft / totalTime) * 100;
        this.timerBar.style.width = Math.max(0, Math.min(100, percentage)) + '%';
    }

    clearTimers() {
        if (this.globalTimer) {
            clearInterval(this.globalTimer);
            this.globalTimer = null;
        }
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }

    spawnTarget(points) {
        this.clearTarget();
        
        const target = document.createElement('div');
        target.className = 'target';
        
        const size = this.settings.targetSize;
        const padding = 20;
        const maxX = this.gameContainer.clientWidth - size - (padding * 2);
        const maxY = this.gameContainer.clientHeight - size - (padding * 2);
        const x = Math.random() * maxX + padding;
        const y = Math.random() * maxY + padding;
        
        target.style.width = size + 'px';
        target.style.height = size + 'px';
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
        target.textContent = points;
        
        target.addEventListener('click', () => this.handleTargetClick(points));
        this.gameContainer.appendChild(target);
        this.currentTarget = target;
        
        return target;
    }

    clearTarget() {
        this.clearTimers();
        if (this.currentTarget && this.currentTarget.parentNode) {
            this.currentTarget.parentNode.removeChild(this.currentTarget);
        }
        this.currentTarget = null;
    }

    handleTargetClick(points) {
        if (this.isPaused) return;
        
        audioManager.playTargetHitSound();
        this.score += points;
        this.updateScore();
        this.clearTarget(); // Clear the current target
        if (this.onTargetClick) {
            this.onTargetClick(points); // Call the callback instead of spawning directly
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const overlay = this.element.querySelector('.game-overlay');
        const pauseMenu = this.element.querySelector('.pause-menu');
        const gameOverMenu = this.element.querySelector('.game-over-menu');
        
        overlay.style.display = this.isPaused ? 'flex' : 'none';
        pauseMenu.style.display = this.isPaused ? 'block' : 'none';
        gameOverMenu.style.display = 'none';
        
        if (this.isPaused) {
            // Pause timers
            this.clearTimers();
            // Disable target clicks
            if (this.currentTarget) {
                this.currentTarget.style.pointerEvents = 'none';
            }
        } else {
            // Resume with remaining time
            if (this.timeRemaining !== null && this.timeRemaining > 0) {
                this.startTimer(this.timeRemaining);
            }
            // Re-enable target clicks
            if (this.currentTarget) {
                this.currentTarget.style.pointerEvents = 'auto';
            }
        }
    }

    startTimer(duration) {
        this.clearTimers();
        
        // Set initial timer state
        const totalTime = duration || this.settings.timeLimit;
        this.timerStartTime = Date.now();
        this.timeRemaining = totalTime;
        
        // Update timer bar immediately
        this.updateTimer(totalTime, totalTime);
        
        this.globalTimer = setInterval(() => {
            if (this.isPaused) return;
            
            const elapsed = Date.now() - this.timerStartTime;
            this.timeRemaining = Math.max(0, totalTime - elapsed);
            
            // Update timer bar
            this.updateTimer(this.timeRemaining, totalTime);
            
            if (this.timeRemaining <= 0) {
                this.clearTimers();
                if (this.onTimerComplete) {
                    this.onTimerComplete();
                }
            }
        }, 16);

        // Backup timeout for timer completion
        this.currentTimeout = setTimeout(() => {
            if (!this.isPaused && this.onTimerComplete) {
                this.onTimerComplete();
            }
        }, totalTime);
    }

    setTimerCompleteCallback(callback) {
        this.onTimerComplete = callback;
    }

    setTargetClickCallback(callback) {
        this.onTargetClick = callback;
    }

    onPlayAgain(callback) {
        this.onPlayAgainCallback = callback;
    }

    onResume(callback) {
        this.element.querySelector('.resume-btn').addEventListener('click', () => {
            this.togglePause();
            callback();
        });
    }

    onRestart(callback) {
        this.element.querySelector('.restart-btn').addEventListener('click', callback);
    }

    onQuit(callback) {
        this.onQuitCallback = callback;
        // Add event listener for pause menu quit button
        const pauseQuitBtn = this.element.querySelector('.pause-menu .quit-btn');
        const newPauseQuitBtn = pauseQuitBtn.cloneNode(true);
        pauseQuitBtn.parentNode.replaceChild(newPauseQuitBtn, pauseQuitBtn);
        newPauseQuitBtn.addEventListener('click', () => {
            this.togglePause(); // Unpause the game
            if (this.onQuitCallback) {
                this.onQuitCallback();
            }
        });
    }

    showGameOver() {
        const overlay = this.element.querySelector('.game-overlay');
        const pauseMenu = this.element.querySelector('.pause-menu');
        const gameOverMenu = this.element.querySelector('.game-over-menu');
        const finalScore = this.element.querySelector('.final-score');
        const finalBestScore = this.element.querySelector('.final-best-score');
        
        // Update stats
        finalScore.textContent = this.score;
        finalBestScore.textContent = localStorage.getItem('tapGame_highScore') || 0;
        
        // Show game over menu
        overlay.style.display = 'flex';
        pauseMenu.style.display = 'none';
        gameOverMenu.style.display = 'block';
        
        // Add event listeners
        const playAgainBtn = gameOverMenu.querySelector('.play-again-btn');
        const quitBtn = gameOverMenu.querySelector('.quit-btn');
        
        // Remove old event listeners
        const newPlayAgainBtn = playAgainBtn.cloneNode(true);
        const newQuitBtn = quitBtn.cloneNode(true);
        playAgainBtn.parentNode.replaceChild(newPlayAgainBtn, playAgainBtn);
        quitBtn.parentNode.replaceChild(newQuitBtn, quitBtn);
        
        // Add new event listeners
        newPlayAgainBtn.addEventListener('click', () => {
            if (this.onPlayAgainCallback) {
                this.onPlayAgainCallback();
            }
        });
        
        newQuitBtn.addEventListener('click', () => {
            if (this.onQuitCallback) {
                this.onQuitCallback();
            }
        });

        document.addEventListener('deviceready', function () {
            admob.interstitial.config({
                id: ADS.ADMOB.INTERSTITIAL,
            })
            admob.interstitial.prepare()
            admob.interstitial.show()
        });
    }
    
    handleGameOver() {
        this.clearTimers();
        this.clearTarget();
        audioManager.playGameOverSound();
        audioManager.pauseMusic();
        this.showGameOver();
    }

    gameOver() {
        this.handleGameOver();
    }

    restartGame() {
        // Implement restart game logic here
    }

    quitGame() {
        // Implement quit game logic here
    }
}

export default GameView;
