import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

export default function reportWebVitals(onReport = console.log) {
  const send = (metric) => {
    // default: log to console; replace with analytics endpoint if available
    try {
      onReport(metric);
    } catch (e) {
      console.log('Web Vitals metric:', metric);
    }
  };

  getCLS(send);
  getFID(send);
  getLCP(send);
  getFCP(send);
  getTTFB(send);
}
