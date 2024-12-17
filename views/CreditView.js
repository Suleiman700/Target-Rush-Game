import { config } from '../js/config.js';
import audioManager from '../js/AudioManager.js';

export class CreditView {
    constructor(game) {
        this.game = game;
        this.element = this.createElement();
        this.backButton = this.element.querySelector('.back-btn');
        
        this.setupEventListeners();
        this.applyTheme();
        this.hide();
        
        // Append to document body
        document.body.appendChild(this.element);
    }

    createElement() {
        const view = document.createElement('div');
        view.className = 'view credits-view';
        
        view.innerHTML = `
            <div class="menu-background"></div>
            <div class="credits-container">
                <div class="credits-header">
                    <button class="back-btn" aria-label="Back to Menu">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>Credits</h1>
                </div>
                
                <div class="credits-content">
                    <div class="credit-section">
                        <h2><i class="fas fa-code"></i> Development</h2>
                        <p>Created with ❤️ by Suleiman</p>
                    </div>
                    
                    <div class="credit-section">
                        <h2><i class="fas fa-palette"></i> Design</h2>
                        <p>UI/UX Design by Your Suleiman</p>
                    </div>
                    
                    <div class="credit-section">
                        <h2><i class="fas fa-music"></i> Audio</h2>
                        <p>Sound Effects: pixabay.com</p>
                        <p>Background Music: pixabay.com</p>
                    </div>
                    
                    <div class="credit-section">
                        <h2><i class="fas fa-heart"></i> Special Thanks</h2>
                        <p>Thanks to all the beta testers and supporters!</p>
                    </div>
                </div>
                
                <div class="credits-footer">
                    <p>Version 1.0.0</p>
                    <p> 2024 SuleimanMedia</p>
                </div>
            </div>
        `;
        
        return view;
    }

    setupEventListeners() {
        this.backButton.addEventListener('click', () => {
            if (audioManager.isSoundEnabled()) {
                audioManager.playSound('click');
            }
            this.hide();
            this.game.showMainMenu();
        });
    }

    show() {
        this.element.style.display = 'flex';
        // Ensure menu volume and play music if enabled
        audioManager.setMenuVolume();
        if (audioManager.isMusicEnabled()) {
            audioManager.playMusic();
        }
    }

    hide() {
        this.element.style.display = 'none';
    }

    applyTheme() {
        // Apply theme colors from config
        const container = this.element.querySelector('.credits-container');
        container.style.backgroundColor = 'rgba(26, 26, 46, 0.95)';
        container.style.borderColor = 'rgba(233, 69, 96, 0.3)';

        const header = this.element.querySelector('.credits-header');
        header.style.borderBottomColor = 'rgba(233, 69, 96, 0.3)';

        const title = this.element.querySelector('.credits-header h1');
        title.style.color = '#ffffff';

        const sections = this.element.querySelectorAll('.credit-section h2');
        sections.forEach(section => {
            section.style.color = '#e94560';
        });

        const paragraphs = this.element.querySelectorAll('.credit-section p');
        paragraphs.forEach(p => {
            p.style.color = '#ffffff';
        });

        const footer = this.element.querySelector('.credits-footer');
        footer.style.borderTopColor = 'rgba(233, 69, 96, 0.3)';
        footer.style.color = 'rgba(255, 255, 255, 0.7)';
    }
}
