
// Sound notification utilities
const notificationSound = new Audio('/notification.mp3');

// This function is kept for backward compatibility but won't be used
export const playNotificationSound = (volume = 0.5) => {
  try {
    notificationSound.volume = volume;
    notificationSound.play().catch(err => {
      // Browser might block autoplay without user interaction
      console.log("Could not play notification sound:", err);
    });
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};

// Utility to determine if we should scroll to bottom automatically
export const shouldAutoScroll = (container: HTMLElement | null): boolean => {
  if (!container) return true;
  
  // Determine if user is already at bottom (or very close)
  const tolerance = 50; // pixels
  const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  return scrollBottom <= tolerance;
};
