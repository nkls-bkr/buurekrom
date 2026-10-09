import { useEffect } from "react";

// Safari keeps its layout viewport tall while the keyboard reduces the visible area.
export function useVisualViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const style = document.documentElement.style;
    const update = () => {
      // Preserve normal browser zoom rather than resizing the UI while pinching.
      if (viewport.scale !== 1) return;
      style.setProperty("--visual-viewport-height", `${viewport.height}px`);
      style.setProperty("--visual-viewport-top", `${viewport.offsetTop}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      style.removeProperty("--visual-viewport-height");
      style.removeProperty("--visual-viewport-top");
    };
  }, []);
}
