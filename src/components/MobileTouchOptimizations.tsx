import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileTouchOptimizations: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // Prevent zoom on double tap
      let lastTouchEnd = 0;
      const preventZoom = (e: TouchEvent) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };
      
      document.addEventListener('touchend', preventZoom, { passive: false });
      
      // Disable pull-to-refresh on mobile
      let touchStartY = 0;
      const preventPullToRefresh = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        if (e.type === 'touchstart') {
          touchStartY = touch.clientY;
        } else if (e.type === 'touchmove') {
          const deltaY = touch.clientY - touchStartY;
          const element = e.target as HTMLElement;
          const isScrollable = element.scrollTop > 0 || element.scrollHeight > element.clientHeight;
          
          if (deltaY > 0 && !isScrollable && window.pageYOffset === 0) {
            e.preventDefault();
          }
        }
      };
      
      document.addEventListener('touchstart', preventPullToRefresh, { passive: false });
      document.addEventListener('touchmove', preventPullToRefresh, { passive: false });
      
      // Optimize scrolling performance
      const optimizeScrolling = () => {
        const scrollableElements = document.querySelectorAll('[data-scroll-optimized]');
        scrollableElements.forEach(element => {
          const htmlElement = element as HTMLElement;
          // Use CSS custom property instead of webkitOverflowScrolling
          htmlElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
        });
      };
      
      optimizeScrolling();
      
      // Add safe area CSS custom properties
      const updateSafeArea = () => {
        const safeAreaInsetTop = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px';
        const safeAreaInsetBottom = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0px';
        
        document.documentElement.style.setProperty('--safe-area-inset-top', safeAreaInsetTop);
        document.documentElement.style.setProperty('--safe-area-inset-bottom', safeAreaInsetBottom);
      };
      
      updateSafeArea();
      window.addEventListener('resize', updateSafeArea);
      window.addEventListener('orientationchange', updateSafeArea);
      
      return () => {
        document.removeEventListener('touchend', preventZoom);
        document.removeEventListener('touchstart', preventPullToRefresh);
        document.removeEventListener('touchmove', preventPullToRefresh);
        window.removeEventListener('resize', updateSafeArea);
        window.removeEventListener('orientationchange', updateSafeArea);
      };
    }
  }, [isMobile]);

  return (
    <div className={isMobile ? 'mobile-optimized' : ''}>
      {children}
    </div>
  );
};

export default MobileTouchOptimizations;