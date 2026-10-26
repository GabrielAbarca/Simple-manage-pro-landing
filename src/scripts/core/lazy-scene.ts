// Load a WebGL scene module only when its stage comes within one viewport of
// the screen. This decides when three.js is downloaded, never whether content
// is visible, so an IntersectionObserver is safe here: a missed callback costs
// a late scene, not a hidden section.

export function whenNear(stage: Element, load: () => void): void {
  if (!("IntersectionObserver" in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      load();
    },
    { rootMargin: "100% 0px" },
  );
  observer.observe(stage);
}

/** Logs a scene failure without breaking the rest of the page. */
export function reportSceneError(sceneName: string, error: unknown): void {
  console.error(`[${sceneName}] 3D scene failed to start`, error);
}
