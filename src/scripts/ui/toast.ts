export type ToastTone = "success" | "danger";

export interface ShowToastOptions {
  tone?: ToastTone;
  durationMs?: number;
}

const DEFAULT_TOAST_DURATION_MS = 2200;

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
  // Clear first, write on the next frame: this makes a live region
  // repeat an identical message ("Copiado." twice in a row).
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
