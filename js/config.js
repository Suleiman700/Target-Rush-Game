export const config = {
    theme: {
        // Primary colors
        primary: '#E94560',      // Main accent color (pink/red)
        secondary: '#16213E',    // Dark blue
        background: '#1A1A2E',   // Dark background
        
        // Text colors
        textPrimary: '#FFFFFF',  // Main text color
        textSecondary: '#E94560', // Secondary text color
        
        // Button colors
        buttonBackground: 'rgba(233, 69, 96, 0.2)',
        buttonText: '#FFFFFF',
        buttonHoverBackground: 'rgba(233, 69, 96, 0.5)',
        
        // Game specific colors
        targetColor: '#E94560',
        scoreColor: '#FFFFFF',
        
        // Credit view specific
        creditBackground: '#1A1A2E',  // Using same as main background
        creditText: '#FFFFFF',        // White for better readability
        creditTitle: '#E94560'        // Using primary color for titles
    }
};

// CSS variable string for easy injection into style tags
export const getCSSVariables = () => `
    :root {
        --primary: ${config.theme.primary};
        --primary-rgb: 233, 69, 96;  /* RGB values for #E94560 */
        --secondary: ${config.theme.secondary};
        --background: ${config.theme.background};
        --background-rgb: 26, 26, 46;  /* RGB values for #1A1A2E */
        --text-primary: ${config.theme.textPrimary};
        --text-secondary: ${config.theme.textSecondary};
        --button-bg: ${config.theme.buttonBackground};
        --button-text: ${config.theme.buttonText};
        --button-hover: ${config.theme.buttonHoverBackground};
        --target-color: ${config.theme.targetColor};
        --score-color: ${config.theme.scoreColor};
        --credit-bg: ${config.theme.creditBackground};
        --credit-text: ${config.theme.creditText};
        --credit-title: ${config.theme.creditTitle};
    }
`;


export const ADS = {
    ADMOB: {
        BANNER: '',
        INTERSTITIAL: '',
    },
};