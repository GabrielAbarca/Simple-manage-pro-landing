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
  matchMedia("(min-width: 1200px)").addEventListener("change", (event) => {
    if (event.matches && isOpen()) setOpen(root, openButton, false);
  });
}
