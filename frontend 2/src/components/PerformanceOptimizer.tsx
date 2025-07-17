import { useEffect, useState } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload critical resources
    const preloadResources = () => {
      // Preload logo
      const logoLink = document.createElement('link');
      logoLink.rel = 'preload';
      logoLink.as = 'image';
      logoLink.href = '/logo-ms.svg';
      document.head.appendChild(logoLink);

      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.crossOrigin = 'anonymous';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap';
      document.head.appendChild(fontLink);
    };

    // Optimize images
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        // Add loading="lazy" to non-critical images
        if (!img.classList.contains('critical')) {
          img.loading = 'lazy';
        }
        
        // Add decoding="async" for better performance
        img.decoding = 'async';
        
        // Add error handling
        img.onerror = () => {
          img.src = '/placeholder.svg';
        };
      });
    };

    // Intersection Observer for lazy loading
    const setupIntersectionObserver = () => {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach((img) => imageObserver.observe(img));
    };

    // Service Worker registration for caching
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    // Initialize optimizations
    preloadResources();
    optimizeImages();
    setupIntersectionObserver();
    registerServiceWorker();

    // Mark as loaded
    setIsLoaded(true);

    // Cleanup
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Add performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming;
            console.log('FID:', firstInputEntry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as any;
            console.log('CLS:', layoutShiftEntry.value);
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      return () => observer.disconnect();
    }
  }, []);

  return <>{children}</>;
};

export default PerformanceOptimizer; 
