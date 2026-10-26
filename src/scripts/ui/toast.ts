// Drives the page's single <Toast> (src/components/ui/Toast.astro). The
// timing is the prototypes': a 250ms fade and rise, then 2200ms on screen.
// A second call while one is showing replaces the text and restarts the
// clock rather than queueing.

export type ToastTone = "success" | "danger";

export interface ShowToastOptions {
  tone?: ToastTone;
  durationMs?: number;
}

const DEFAULT_TOAST_DURATION_MS = 2200;

// Keyed by element so a page that swaps its toast out (or a test that mounts
// several) never shares one timer between them.
const hideTimerByToast = new WeakMap<HTMLElement, number>();

function findPageToast(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-toast]");
}

function restartHideTimer(toastElement: HTMLElement, durationMs: number): void {
  window.clearTimeout(hideTimerByToast.get(toastElement));
  const hideTimer = window.setTimeout(() => {
    toastElement.dataset.visible = "false";
  }, durationMs);
  hideTimerByToast.set(toastElement, hideTimer);
}

function announceMessage(messageElement: HTMLElement, message: string): void {
  // Clearing first and writing on the next frame makes a live region repeat
  // a message identical to the last one ("Copiado." twice in a row).
  messageElement.textContent = "";
  window.requestAnimationFrame(() => {
    messageElement.textContent = message;
  });
}

export function showToast(message: string, options: ShowToastOptions = {}): void {
  const { tone = "success", durationMs = DEFAULT_TOAST_DURATION_MS } = options;
  const toastElement = findPageToast();
  const messageElement = toastElement?.querySelector<HTMLElement>("[data-toast-message]");
  if (!toastElement || !messageElement) return;
  toastElement.dataset.tone = tone;
  announceMessage(messageElement, message);
  toastElement.dataset.visible = "true";
  restartHideTimer(toastElement, Math.max(0, durationMs));
}

export function hideToast(): void {
  const toastElement = findPageToast();
  if (!toastElement) return;
  window.clearTimeout(hideTimerByToast.get(toastElement));
  toastElement.dataset.visible = "false";
}
