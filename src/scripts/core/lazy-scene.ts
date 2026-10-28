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

export function reportSceneError(sceneName: string, error: unknown): void {
  console.error(`[${sceneName}] 3D scene failed to start`, error);
}
