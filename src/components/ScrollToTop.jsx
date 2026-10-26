import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// The app scrolls inside #main-content rather than the window, so route
// changes need to reset that container explicitly.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.getElementById("main-content")?.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
