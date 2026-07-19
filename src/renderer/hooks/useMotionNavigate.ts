import { useCallback } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router-dom';

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => unknown;
};

interface MotionNavigateOptions extends NavigateOptions {
  /**
   * Skip the page-level view transition. Use for in-view navigation (e.g.
   * paging between photos inside the detail viewer) where the view itself does
   * not change and a full-page crossfade would be redundant and jarring —
   * the component handles its own intra-view animation instead.
   */
  instant?: boolean;
}

/**
 * Uses Chromium's view-transition snapshots for the app's shared zoom/fade
 * route language, with an immediate accessible fallback.
 */
export const useMotionNavigate = () => {
  const navigate = useNavigate();

  return useCallback(
    (to: To | number, options?: MotionNavigateOptions) => {
      const { instant, ...navigateOptions } = options ?? {};
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const documentWithTransitions = document as ViewTransitionDocument;
      const performNavigation = () => {
        if (typeof to === 'number') {
          navigate(to);
        } else {
          navigate(to, navigateOptions);
        }
      };

      if (instant || reduceMotion || !documentWithTransitions.startViewTransition) {
        performNavigation();
        return;
      }

      documentWithTransitions.startViewTransition(performNavigation);
    },
    [navigate]
  );
};

export default useMotionNavigate;
