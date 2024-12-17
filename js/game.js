import MainMenuView from '../views/MainMenuView.js';
import PreGameView from '../views/PreGameView.js';
import GameView from '../views/GameView.js';
import { CreditView } from '../views/CreditView.js';
import { getCSSVariables } from './config.js';

class Game {
    constructor() {
        this.score = 0;
        this.highScore = 0;
        this.gameRunning = false;
        this.difficulty = 1000;
        
        // Initialize theme
        this.initializeTheme();
        
        // Initialize views
        this.mainMenuView = new MainMenuView();
        this.preGameView = new PreGameView();
        this.gameView = new GameView();
        this.creditView = new CreditView(this);
        
        // Add views to the document
        document.body.appendChild(this.mainMenuView.element);
        document.body.appendChild(this.preGameView.element);
        document.body.appendChild(this.gameView.element);
        document.body.appendChild(this.creditView.element);
        
        // Setup event listeners
        this.setupEventListeners();

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (this.gameRunning && document.hidden) {
                this.pauseGame();
            }
        });

        // Handle Cordova app pause/resume events
        document.addEventListener('pause', () => {
            if (this.gameRunning) {
                this.pauseGame();
            }
        }, false);
    }

    initializeTheme() {
        // Inject CSS variables
        const themeStyles = document.getElementById('themeStyles');
        if (themeStyles) {
            themeStyles.innerHTML = `
                <style>
                    ${getCSSVariables()}
                </style>
            `
        }
    }

    setupEventListeners() {
        // Main Menu
        this.mainMenuView.onPlayClick(() => this.showPreGame());
        this.mainMenuView.onLeaderboardClick(() => this.showLeaderboard());
        this.mainMenuView.onSettingsClick(() => this.showSettings());
        this.mainMenuView.onCreditsClick(() => this.showCredits());

        // Pre-Game
        this.preGameView.onBackClick(() => this.showMainMenu());
        this.preGameView.onStartClick(() => this.startGame());

        // Game View
        this.gameView.onResume(() => this.resumeGame());
        this.gameView.onRestart(() => this.restartGame());
        this.gameView.onQuit(() => this.quitToMenu());
        this.gameView.onPlayAgain(() => this.restartGame());

        // Window focus handling
        window.addEventListener('blur', () => {
            if (this.gameRunning && !this.gameView.isPaused) {
                this.gameView.togglePause();
            }
        });

        // Back button handling
        document.addEventListener('backbutton', (e) => {
            if (this.gameRunning) {
                e.preventDefault();
                this.gameView.togglePause();
            } else {
                navigator.app.exitApp();
            }
        }, false);
    }

    showMainMenu() {
        this.mainMenuView.show();
        this.preGameView.hide();
        this.gameView.hide();
        this.creditView.hide();
    }

    showPreGame() {
        this.mainMenuView.hide();
        this.preGameView.show();
        this.gameView.hide();
        this.creditView.hide();
    }

    startGame() {
        const settings = this.preGameView.getSettings();
        this.mainMenuView.hide();
        this.preGameView.hide();
        this.gameView.show();
        this.creditView.hide();
        
        this.score = 0;
        this.gameRunning = true;
        this.difficulty = settings.timeLimit;
        
        this.gameView.initialize(settings);
        this.gameView.updateScore(this.score);
        this.gameView.updateHighScore(this.highScore);
        this.gameView.setTimerCompleteCallback(() => this.endGame());
        this.gameView.setTargetClickCallback(() => {
            if (!this.gameRunning) return;
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.gameView.updateHighScore(this.highScore);
            }
            
            if (settings.speedIncrease && this.score % 5 === 0 && this.difficulty > 400) {
                this.difficulty *= 0.9;
            }

            setTimeout(() => this.spawnTarget(), 100);
        });
        
        this.spawnTarget();
    }

    spawnTarget() {
        if (!this.gameRunning) return;

        this.gameView.clearTarget();
        
        const points = Math.floor(Math.random() * 5) + 1;
        const settings = this.preGameView.getSettings();
        
        const target = this.gameView.spawnTarget(points, () => {
            if (!this.gameRunning) return;
            
            this.score += points;
            this.gameView.updateScore(this.score);
        });

        this.gameView.startTimer(this.difficulty);
    }

    resumeGame() {
        if (!this.gameView.currentTarget) {
            this.spawnTarget();
        }
        this.gameRunning = true;
    }

    restartGame() {
        this.hideAllViews();
        this.gameView.initialize(this.preGameView.getSettings());
        this.showView(this.gameView);
        this.startGame();
    }

    quitToMenu() {
        this.gameRunning = false;
        this.gameView.clearTarget();
        this.showMainMenu();
    }

    endGame() {
        this.gameRunning = false;
        this.handleGameOver();
    }

    pauseGame() {
        if (!this.gameView.isPaused) {
            this.gameView.togglePause();
        }
    }

    handleGameOver() {
        const currentScore = this.gameView.score;
        const highScore = localStorage.getItem('highScore') || 0;
        
        // Update high score if current score is higher
        if (currentScore > highScore) {
            localStorage.setItem('highScore', currentScore);
        }
        
        this.gameView.handleGameOver();
    }

    // Additional menu functions
    showLeaderboard() {
        // Implement leaderboard functionality
        console.log('Leaderboard - Coming Soon');
    }

    showSettings() {
        // Implement settings functionality
        console.log('Settings - Coming Soon');
    }

    showCredits() {
        this.mainMenuView.hide();
        this.preGameView.hide();
        this.gameView.hide();
        this.creditView.show();
    }

    hideAllViews() {
        this.mainMenuView.hide();
        this.preGameView.hide();
        this.gameView.hide();
        this.creditView.hide();
    }

    showView(view) {
        view.show();
    }
}

// Initialize game instance
let gameInstance = null;

// Initialize game when device is ready
document.addEventListener('deviceready', () => {
    gameInstance = new Game();
    gameInstance.showMainMenu();
}, false);

// Fallback for browser testing
if (!window.cordova) {
    document.addEventListener('DOMContentLoaded', () => {
        if (!gameInstance) {
            gameInstance = new Game();
            gameInstance.showMainMenu();
        }
    });
}
