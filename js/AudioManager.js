class AudioManager {
    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }
        AudioManager.instance = this;
        
        this.audioLoaded = false;
        this.defaultMusicVolume = 0.3;
        this.gameMusicVolume = 0.15;  // Lower volume during gameplay
        
        // Initialize with default values first
        this.musicEnabled = true;
        this.soundEnabled = true;
        
        // Then load saved settings
        this.loadAudioSettings();
        // Setup audio after settings are loaded
        this.setupAudio();
        this.setupFocusHandlers();
    }

    loadAudioSettings() {
        try {
            const audioSettings = localStorage.getItem('targetRushAudio');
            if (audioSettings) {
                const { musicEnabled, soundEnabled } = JSON.parse(audioSettings);
                this.musicEnabled = musicEnabled;
                this.soundEnabled = soundEnabled;
            }
            // If no settings found, use the defaults and save them
            this.saveAudioSettings();
        } catch (error) {
            console.error('Error loading audio settings:', error);
            // If there's an error, use defaults and save them
            this.musicEnabled = true;
            this.soundEnabled = true;
            this.saveAudioSettings();
        }
    }

    setupAudio() {
        // Create audio elements
        this.bgMusic = new Audio();
        this.clickSound = new Audio();
        this.targetHitSound = new Audio();
        this.gameOverSound = new Audio();
        
        // Set default properties
        this.bgMusic.loop = true;
        this.bgMusic.volume = this.defaultMusicVolume;
        this.clickSound.volume = 0.2;
        this.targetHitSound.volume = 0.25;
        this.gameOverSound.volume = 0.3;

        // Load audio files
        this.loadAudio();
    }

    async loadAudio() {
        try {
            const audioFiles = {
                bgMusic: './audio/menu-music.mp3',
                clickSound: './audio/click.mp3',
                targetHitSound: './audio/target-hit.mp3',
                gameOverSound: './audio/game-over.mp3'
            };

            for (const [key, path] of Object.entries(audioFiles)) {
                try {
                    const audio = this[key];
                    audio.src = path;
                    console.log(`Loading audio: ${path}`);
                    
                    await new Promise((resolve, reject) => {
                        const onCanPlay = () => {
                            audio.removeEventListener('canplaythrough', onCanPlay);
                            audio.removeEventListener('error', onError);
                            resolve();
                        };
                        
                        const onError = (e) => {
                            audio.removeEventListener('canplaythrough', onCanPlay);
                            audio.removeEventListener('error', onError);
                            console.error(`Error loading ${key} from ${path}:`, e);
                            reject(e);
                        };

                        audio.addEventListener('canplaythrough', onCanPlay, { once: true });
                        audio.addEventListener('error', onError, { once: true });
                        
                        // Add timeout
                        setTimeout(() => {
                            audio.removeEventListener('canplaythrough', onCanPlay);
                            audio.removeEventListener('error', onError);
                            reject(new Error(`Timeout loading ${key}`));
                        }, 5000);
                    });
                    
                    console.log(`Successfully loaded: ${path}`);
                } catch (error) {
                    console.error(`Failed to load ${key}:`, error);
                    // Continue loading other sounds even if one fails
                }
            }

            this.audioLoaded = true;
            console.log('Audio system initialized');
            
            // Start playing music if enabled
            if (this.musicEnabled) {
                this.playMusic();
            }
        } catch (error) {
            console.error('Error initializing audio system:', error);
            this.audioLoaded = false;
            this.musicEnabled = false;
            this.soundEnabled = false;
        }
    }

    setupFocusHandlers() {
        // Handle app pause and resume for Cordova
        document.addEventListener('pause', () => this.handleFocusLost(), false);
        document.addEventListener('resume', () => this.handleFocusGained(), false);

        // Handle visibility change for browser testing
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleFocusLost();
            } else {
                this.handleFocusGained();
            }
        });
    }

    handleFocusLost() {
        // Store current music state before pausing
        this.wasMusicPlaying = !this.bgMusic.paused;
        this.pauseMusic();
    }

    handleFocusGained() {
        // Resume music only if it was playing before
        if (this.wasMusicPlaying && this.musicEnabled) {
            this.playMusic();
        }
    }

    saveAudioSettings() {
        localStorage.setItem('targetRushAudio', JSON.stringify({
            musicEnabled: this.musicEnabled,
            soundEnabled: this.soundEnabled
        }));
    }

    setGameVolume() {
        if (this.bgMusic) {
            this.bgMusic.volume = this.gameMusicVolume;
        }
    }

    setMenuVolume() {
        if (this.bgMusic) {
            this.bgMusic.volume = this.defaultMusicVolume;
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.playMusic();
        } else {
            this.stopMusic();
        }
        this.saveAudioSettings();
        return this.musicEnabled;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveAudioSettings();
        return this.soundEnabled;
    }

    playMusic() {
        if (!this.audioLoaded || !this.musicEnabled || !this.bgMusic.src) return;
        
        if (this.bgMusic.ended) {
            this.bgMusic.currentTime = 0;
        }

        const playPromise = this.bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Error playing music:', error);
            });
        }
    }

    stopMusic() {
        if (this.audioLoaded && this.bgMusic.src) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }

    pauseMusic() {
        if (this.audioLoaded && this.bgMusic.src) {
            this.bgMusic.pause();
        }
    }

    playClickSound() {
        this.playSound(this.clickSound);
    }

    playTargetHitSound() {
        this.playSound(this.targetHitSound);
    }

    playGameOverSound() {
        this.playSound(this.gameOverSound);
    }

    playSound(soundElement) {
        if (!this.audioLoaded || !this.soundEnabled || !soundElement.src) return;

        try {
            const sound = soundElement.cloneNode();
            sound.volume = soundElement.volume;
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing sound:', error);
                });
            }
        } catch (error) {
            console.error('Error creating sound:', error);
        }
    }

    isMusicEnabled() {
        return this.musicEnabled && this.audioLoaded;
    }

    isSoundEnabled() {
        return this.soundEnabled && this.audioLoaded;
    }
}

// Create and export a singleton instance
const audioManager = new AudioManager();
export default audioManager;
