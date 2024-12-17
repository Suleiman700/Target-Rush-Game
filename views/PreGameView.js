import { config, getCSSVariables } from '../js/config.js';
import audioManager from '../js/AudioManager.js';

class PreGameView {
    constructor() {
        this.element = this.createElement();
        this.settings = this.loadSettings() || {
            difficulty: 'normal',
            timeLimit: 2000,
            targetSize: 50,
            speedIncrease: true
        };
        this.applySettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('targetRushSettings');
        return savedSettings ? JSON.parse(savedSettings) : null;
    }

    saveSettings() {
        localStorage.setItem('targetRushSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        // Apply difficulty button state
        const diffButtons = this.element.querySelectorAll('.diff-btn');
        diffButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.settings.difficulty);
        });

        // Apply slider values
        const timeLimit = this.element.querySelector('#timeLimit');
        const timeDisplay = this.element.querySelector('.time-display');
        if (timeLimit) {
            timeLimit.value = this.settings.timeLimit;
            timeDisplay.textContent = (this.settings.timeLimit / 1000).toFixed(1) + 's';
        }

        const targetSize = this.element.querySelector('#targetSize');
        const sizeDisplay = this.element.querySelector('.size-display');
        if (targetSize) {
            targetSize.value = this.settings.targetSize;
            sizeDisplay.textContent = this.settings.targetSize + '%';
        }

        // Apply checkbox state
        const speedIncrease = this.element.querySelector('#speedIncrease');
        if (speedIncrease) {
            speedIncrease.checked = this.settings.speedIncrease;
        }
    }

    createElement() {
        const view = document.createElement('div');
        view.className = 'view pre-game-view';
        view.innerHTML = `
            <div class="menu-background"></div>
            <div class="settings-content">
                <h2 class="settings-title">Game Settings</h2>
                
                <div class="settings-group">
                    <label><i class="fas fa-gamepad"></i> Difficulty</label>
                    <div class="difficulty-buttons">
                        <button class="diff-btn" data-difficulty="easy">
                            <i class="fas fa-smile"></i> Easy
                        </button>
                        <button class="diff-btn" data-difficulty="normal">
                            <i class="fas fa-meh"></i> Normal
                        </button>
                        <button class="diff-btn" data-difficulty="hard">
                            <i class="fas fa-dizzy"></i> Hard
                        </button>
                    </div>
                </div>

                <div class="settings-group">
                    <label><i class="fas fa-clock"></i> Timer</label>
                    <input type="range" id="timeLimit" min="1000" max="3000" step="100" value="2000">
                    <span class="time-display">2.0s</span>
                </div>

                <div class="settings-group">
                    <label><i class="fas fa-bullseye"></i> Target Size</label>
                    <input type="range" id="targetSize" min="30" max="100" step="5" value="50">
                    <span class="size-display">50%</span>
                </div>

                <div class="settings-group checkbox-group" style="display: flex;">
                    <input type="checkbox" id="speedIncrease" checked>
                    <label for="speedIncrease">
                        <i class="fas fa-tachometer-alt"></i> Increase Speed Over Time
                    </label>
                </div>

                <div class="settings-buttons">
                    <button class="menu-btn back-btn">
                        <i class="fas fa-arrow-left"></i>
                        Back
                    </button>
                    <button class="menu-btn start-btn">
                        <i class="fas fa-play"></i>
                        Start Game
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners(view);
        return view;
    }

    setupEventListeners(view) {
        // Difficulty buttons
        const diffButtons = view.querySelectorAll('.diff-btn');
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (audioManager.isSoundEnabled()) {
                    audioManager.playClickSound();
                }
                diffButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.difficulty = btn.dataset.difficulty;
                
                // Adjust time limit based on difficulty
                switch(this.settings.difficulty) {
                    case 'easy':
                        this.settings.timeLimit = 2500;
                        this.settings.targetSize = 70;
                        break;
                    case 'normal':
                        this.settings.timeLimit = 2000;
                        this.settings.targetSize = 50;
                        break;
                    case 'hard':
                        this.settings.timeLimit = 1500
                        this.settings.targetSize = 30;
                        break;
                }
                
                this.applySettings();
                this.saveSettings();
            });
        });

        // Time limit slider
        const timeLimit = view.querySelector('#timeLimit');
        const timeDisplay = view.querySelector('.time-display');
        timeLimit.addEventListener('input', () => {
            const value = timeLimit.value;
            this.settings.timeLimit = parseInt(value);
            timeDisplay.textContent = (value / 1000).toFixed(1) + 's';
            this.saveSettings();
        });

        // Target size slider
        const targetSize = view.querySelector('#targetSize');
        const sizeDisplay = view.querySelector('.size-display');
        targetSize.addEventListener('input', () => {
            const value = targetSize.value;
            this.settings.targetSize = parseInt(value);
            sizeDisplay.textContent = value + '%';
            this.saveSettings();
        });

        // Speed increase checkbox
        const speedIncrease = view.querySelector('#speedIncrease');
        speedIncrease.addEventListener('change', () => {
            this.settings.speedIncrease = speedIncrease.checked;
            this.saveSettings();
        });

        // Back and Start buttons
        const backBtn = view.querySelector('.back-btn');
        const startBtn = view.querySelector('.start-btn');

        backBtn.addEventListener('click', () => {
            if (audioManager.isSoundEnabled()) {
                audioManager.playClickSound();
            }
            if (this.onBackClick) {
                this.onBackClick();
            }
        });

        startBtn.addEventListener('click', () => {
            if (audioManager.isSoundEnabled()) {
                audioManager.playClickSound();
            }
            if (this.onStartClick) {
                this.onStartClick(this.settings);
            }
        });
    }

    show() {
        this.element.style.display = 'block';
        // Ensure menu volume and play music if enabled
        audioManager.setMenuVolume();
        if (audioManager.isMusicEnabled()) {
            audioManager.playMusic();
        }
    }

    hide() {
        this.element.style.display = 'none';
    }

    getSettings() {
        return { ...this.settings };
    }

    onBackClick(callback) {
        this.element.querySelector('.back-btn').addEventListener('click', callback);
    }

    onStartClick(callback) {
        this.element.querySelector('.start-btn').addEventListener('click', callback);
    }
}

export default PreGameView;
