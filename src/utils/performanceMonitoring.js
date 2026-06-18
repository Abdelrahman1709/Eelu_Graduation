/**
 * Performance monitoring utility
 * Tracks and logs Web Vitals and other performance metrics
 */

export const trackPerformanceMetrics = () => {
  if (!window.performance) return;

  // Navigation Timing
  const navigationTiming = performance.getEntriesByType('navigation')[0];
  if (navigationTiming) {
    const metrics = {
      'DNS Lookup': navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
      'TCP Connection': navigationTiming.connectEnd - navigationTiming.connectStart,
      'TTFB': navigationTiming.responseStart - navigationTiming.requestStart,
      'DOM Interactive': navigationTiming.domInteractive - navigationTiming.fetchStart,
      'DOM Complete': navigationTiming.domComplete - navigationTiming.fetchStart,
      'Page Load': navigationTiming.loadEventEnd - navigationTiming.fetchStart,
    };

    console.table(metrics);
  }

  // Paint Timing (FCP, FP)
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach((entry) => {
    console.log(`[Perf] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
  });
};

export const trackLargestContentfulPaint = () => {
  if (!window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[Perf] LCP:', lastEntry.renderTime || lastEntry.loadTime, 'ms');
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.log('[Perf] LCP observer not supported');
  }
};

export const trackCumulativeLayoutShift = () => {
  if (!window.PerformanceObserver) return;

  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log('[Perf] CLS:', clsValue.toFixed(4));
        }
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.log('[Perf] CLS observer not supported');
  }
};

export const trackFirstInputDelay = () => {
  if (!window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('[Perf] FID:', entry.processingDuration, 'ms');
      });
    });
    observer.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.log('[Perf] FID observer not supported');
  }
};

export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  trackPerformanceMetrics();
  trackLargestContentfulPaint();
  trackCumulativeLayoutShift();
  trackFirstInputDelay();

  // Measure and log resource timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const resources = performance.getEntriesByType('resource');
      const largeResources = resources
        .filter((r) => r.duration > 1000)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);

      if (largeResources.length > 0) {
        console.group('[Perf] Top 5 Slowest Resources');
        largeResources.forEach((r) => {
          console.log(`${r.name.split('/').pop()}: ${r.duration.toFixed(2)}ms`);
        });
        console.groupEnd();
      }
    }, 100);
  });
};
