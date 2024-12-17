import audioManager from '../js/AudioManager.js';
import {config, getCSSVariables, ADS} from '../js/config.js';

class MainMenuView {
    constructor() {
        this.element = this.createElement();
        // Ensure audio buttons are updated after a short delay to allow AudioManager to initialize
        setTimeout(() => this.updateAudioButtons(), 500);
        this.updateHighScore();
    }

    createElement() {
        const view = document.createElement('div');
        view.className = 'view main-menu-view';
        
        view.innerHTML = `
            <div class="menu-background"></div>
            <div class="menu-container">
                <div class="game-logo">
                    <i class="fas fa-bullseye"></i>
                    <h1>Target Rush</h1>
                </div>
                
                <div class="menu-buttons">
                    <button class="menu-btn play-btn">
                        <i class="fas fa-play"></i>
                        Play Game
                    </button>
                    <button class="menu-btn credits-btn">
                        <i class="fas fa-star"></i>
                        Credits
                    </button>
                </div>

                <div class="audio-controls">
                    <button class="audio-btn music-btn" aria-label="Toggle Music">
                        <i class="fas fa-music"></i>
                    </button>
                    <button class="audio-btn sound-btn" aria-label="Toggle Sound">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>

                <div class="high-score-display">
                    <i class="fas fa-trophy"></i>
                    <span>Best Score: </span>
                    <span class="score-value">0</span>
                </div>
            </div>
        `;
        
        // Add Font Awesome for icons
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }

        this.setupEventListeners(view);
        this.startBackgroundAnimation(view);


        document.addEventListener('deviceready', function () {
            admob.banner.prepare();
            admob.banner.show({
                id: ADS.ADMOB.BANNER,
                autoShow: true,
            });

            admob.interstitial.config({
                id: ADS.ADMOB.INTERSTITIAL,
            })
            admob.interstitial.prepare()
            admob.interstitial.show()
        });

        return view;
    }

    setupEventListeners(view) {
        // Audio control buttons
        const musicBtn = view.querySelector('.music-btn');
        const soundBtn = view.querySelector('.sound-btn');
        const creditsBtn = view.querySelector('.credits-btn');

        musicBtn.addEventListener('click', () => {
            const isEnabled = audioManager.toggleMusic();
            if (audioManager.isSoundEnabled()) {
                audioManager.playClickSound();
            }
            this.updateAudioButtons();
        });

        soundBtn.addEventListener('click', () => {
            const wasEnabled = audioManager.isSoundEnabled();
            const isEnabled = audioManager.toggleSound();
            if (wasEnabled) {
                audioManager.playClickSound();
            }
            this.updateAudioButtons();
        });

        creditsBtn.addEventListener('click', () => {
            if (audioManager.isSoundEnabled()) {
                audioManager.playClickSound();
            }
            if (window.gameInstance) {
                window.gameInstance.showCredits();
            }
        });

        // Add click sound to all menu buttons except audio controls
        view.querySelectorAll('.menu-btn').forEach(btn => {
            const originalClick = btn.onclick;
            btn.onclick = (e) => {
                if (audioManager.isSoundEnabled() && !btn.classList.contains('audio-btn')) {
                    audioManager.playClickSound();
                }
                if (originalClick) originalClick(e);
            };
        });
    }

    startBackgroundAnimation(view) {
        const background = view.querySelector('.menu-background');
        const maxTargets = 5;
        const targetLifetime = 5000; // 5 seconds

        const createTarget = () => {
            const target = document.createElement('div');
            target.className = 'background-target';
            
            // Random starting position
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            
            // Random ending position
            const endX = Math.random() * window.innerWidth;
            const endY = Math.random() * window.innerHeight;
            
            // Set initial position and opacity
            target.style.left = `${startX}px`;
            target.style.top = `${startY}px`;
            target.style.opacity = '0';
            
            // Add to DOM
            background.appendChild(target);
            
            // Start animation
            setTimeout(() => {
                target.style.opacity = '1';
                target.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
            }, 50);
            
            // Start fade out
            setTimeout(() => {
                target.style.opacity = '0';
            }, targetLifetime - 1000);
            
            // Remove after animation
            setTimeout(() => {
                target.remove();
                createTarget(); // Create a new target
            }, targetLifetime);
        };

        // Create initial targets
        for (let i = 0; i < maxTargets; i++) {
            setTimeout(() => createTarget(), i * (targetLifetime / maxTargets));
        }
    }

    updateAudioButtons() {
        const musicBtn = this.element.querySelector('.music-btn i');
        const soundBtn = this.element.querySelector('.sound-btn i');
        const musicBtnContainer = this.element.querySelector('.music-btn');
        const soundBtnContainer = this.element.querySelector('.sound-btn');

        // Force a check of audio states
        const isMusicOn = audioManager.isMusicEnabled();
        const isSoundOn = audioManager.isSoundEnabled();

        // Update music button
        if (isMusicOn) {
            musicBtn.className = 'fas fa-music';
            musicBtnContainer.classList.add('active');
        } else {
            musicBtn.className = 'fas fa-music-slash';
            musicBtnContainer.classList.remove('active');
        }

        // Update sound button
        if (isSoundOn) {
            soundBtn.className = 'fas fa-volume-up';
            soundBtnContainer.classList.add('active');
        } else {
            soundBtn.className = 'fas fa-volume-mute';
            soundBtnContainer.classList.remove('active');
        }

        // Start playing music if enabled
        if (isMusicOn) {
            audioManager.playMusic();
        }
    }

    updateHighScore() {
        const highScore = parseInt(localStorage.getItem('tapGame_highScore')) || 0;
        const scoreElement = this.element.querySelector('.high-score-display .score-value');
        if (scoreElement) {
            scoreElement.textContent = highScore;
        }
    }

    show() {
        this.element.style.display = 'flex';
        // Update buttons when showing the view
        setTimeout(() => this.updateAudioButtons(), 500);
        // Update high score when showing the view
        this.updateHighScore();
        // Ensure menu volume and play music if enabled
        audioManager.setMenuVolume();
        if (audioManager.isMusicEnabled()) {
            audioManager.playMusic();
        }
    }

    hide() {
        this.element.style.display = 'none';
        audioManager.pauseMusic();
    }

    onPlayClick(callback) {
        this.element.querySelector('.play-btn').addEventListener('click', callback);
    }

    onLeaderboardClick(callback) {
        // Removed leaderboard button
    }

    onSettingsClick(callback) {
        // Removed settings button
    }

    onCreditsClick(callback) {
        this.element.querySelector('.credits-btn').addEventListener('click', callback);
    }
}

export default MainMenuView;
