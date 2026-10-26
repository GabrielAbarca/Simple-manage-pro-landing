// Mobile/tablet menu panel. Open: scroll locked on <html>, focus moved into
// the panel and kept there, Escape and the scrim close it. Closed: inert, so
// the off-screen links never take focus.

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];
}

function trapTab(event: KeyboardEvent, root: HTMLElement): void {
  const items = focusableIn(root);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setOpen(root: HTMLElement, openButton: HTMLElement, open: boolean): void {
  root.toggleAttribute("data-open", open);
  root.toggleAttribute("inert", !open);
  root.setAttribute("aria-hidden", String(!open));
  openButton.setAttribute("aria-expanded", String(open));
  document.documentElement.style.overflow = open ? "hidden" : "";
}

export function initMenu(): void {
  const root = document.querySelector<HTMLElement>("[data-menu]");
  const openButton = document.querySelector<HTMLElement>("[data-menu-open]");
  if (!root || !openButton) return;
  const isOpen = () => root.hasAttribute("data-open");
  const close = () => {
    if (!isOpen()) return;
    setOpen(root, openButton, false);
    openButton.focus();
  };
  openButton.addEventListener("click", () => {
    setOpen(root, openButton, true);
    root.querySelector<HTMLElement>("[data-menu-close]:not(.scrim)")?.focus();
  });
  root.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", close));
  addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") close();
    if (event.key === "Tab") trapTab(event, root);
  });
  // A rotation or resize to desktop width removes the menu; don't leave the page locked.
  matchMedia("(min-width: 1200px)").addEventListener("change", (event) => {
    if (event.matches && isOpen()) setOpen(root, openButton, false);
  });
}
