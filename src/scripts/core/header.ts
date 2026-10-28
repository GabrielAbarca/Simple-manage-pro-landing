const SCROLL_THRESHOLD_PX = 40;
const HERO_CLEARANCE_PX = 90;

function isPastTop(heroAnchor: HTMLElement | null): boolean {
  if (heroAnchor) return heroAnchor.getBoundingClientRect().bottom <= HERO_CLEARANCE_PX;
  return window.scrollY > SCROLL_THRESHOLD_PX;
}

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return;
  const heroAnchor = document.querySelector<HTMLElement>("[data-header-anchor]");
  let scheduled = false;
  const update = () => {
    scheduled = false;
    header.toggleAttribute("data-scrolled", isPastTop(heroAnchor));
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  update();
}

export function setHeaderOnDark(onDark: boolean): void {
  document.querySelector("[data-site-header]")?.toggleAttribute("data-on-dark", onDark);
}
