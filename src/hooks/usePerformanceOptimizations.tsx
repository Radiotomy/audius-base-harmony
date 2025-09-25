import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const usePerformanceOptimizations = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // Enable hardware acceleration for smooth animations
      document.documentElement.style.setProperty('--hardware-acceleration', 'translateZ(0)');
      
      // Optimize audio context for mobile
      const optimizeAudioContext = () => {
        // Resume audio context on user interaction (required by mobile browsers)
        const resumeAudioContext = () => {
          const audioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
          }
        };
        
        document.addEventListener('touchstart', resumeAudioContext, { once: true, passive: true });
        document.addEventListener('click', resumeAudioContext, { once: true, passive: true });
      };
      
      optimizeAudioContext();
      
      // Optimize images for mobile
      const optimizeImages = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          // Add loading=lazy for better performance
          if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
          }
          
          // Add decoding=async for better performance
          if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
          }
        });
      };
      
      // Run on load and when new images are added
      optimizeImages();
      const observer = new MutationObserver(optimizeImages);
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Reduce memory usage by cleaning up unused resources
      const cleanupUnusedResources = () => {
        // Force garbage collection if available (Chrome DevTools)
        if ((window as any).gc) {
          (window as any).gc();
        }
      };
      
      // Cleanup on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cleanupUnusedResources();
        }
      });
      
      return () => {
        observer.disconnect();
      };
    }
  }, [isMobile]);
};

export default usePerformanceOptimizations;