/**
 * useYandexMetrica Hook
 * Automatic SPA navigation tracking for React Router v6
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/yandex-metrica';

/**
 * Hook to track route changes in React Router
 * Place in App.jsx or root component
 */
export const useYandexMetrica = () => {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
};

export default useYandexMetrica;
