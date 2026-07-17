import { useCallback } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router-dom';

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => unknown;
};

/**
 * Uses Chromium's view-transition snapshots for the app's shared zoom/fade
 * route language, with an immediate accessible fallback.
 */
export const useMotionNavigate = () => {
  const navigate = useNavigate();

  return useCallback((to: To | number, options?: NavigateOptions) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const documentWithTransitions = document as ViewTransitionDocument;
    const performNavigation = () => {
      if (typeof to === 'number') {
        navigate(to);
      } else {
        navigate(to, options);
      }
    };

    if (reduceMotion || !documentWithTransitions.startViewTransition) {
      performNavigation();
      return;
    }

    documentWithTransitions.startViewTransition(performNavigation);
  }, [navigate]);
};

export default useMotionNavigate;
