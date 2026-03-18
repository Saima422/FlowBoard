import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './RouteTransitionLoader.scss';

export function RouteTransitionLoader() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setIsNavigating(true);
    const t = setTimeout(() => setIsNavigating(false), 400);
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!isNavigating) return null;

  return (
    <div className="route-transition-loader" aria-hidden>
      <div className="route-transition-loader-spinner" />
    </div>
  );
}
