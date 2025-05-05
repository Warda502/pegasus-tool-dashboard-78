
import { keyframes } from "tailwindcss/defaultTheme";

/**
 * Custom keyframes for animations
 * These are used in the tailwind.config.js
 */
export const customKeyframes = {
  'bounce-in': {
    '0%': { transform: 'scale(0.8)', opacity: '0' },
    '40%': { transform: 'scale(1.1)', opacity: '1' },
    '60%': { transform: 'scale(0.95)', opacity: '1' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  }
};

/**
 * Custom animations that use the keyframes above
 */
export const customAnimations = {
  'bounce-in': 'bounce-in 0.5s ease-out',
};
