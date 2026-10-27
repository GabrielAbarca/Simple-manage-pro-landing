import { setButtonVariant } from "../ui/ds-runtime";

interface MissionTabsElements {
  card: HTMLElement;
  tabs: HTMLButtonElement[];
  panels: HTMLElement[];
  count: HTMLElement | null;
  previousButton: HTMLButtonElement | null;
  nextButton: HTMLButtonElement | null;
}

function queryElements(card: HTMLElement): MissionTabsElements {
  return {
    card,
    tabs: [...card.querySelectorAll<HTMLButtonElement>("[data-mv-tab]")],
    panels: [...card.querySelectorAll<HTMLElement>("[data-mv-panel]")],
    count: card.querySelector<HTMLElement>("[data-mv-count]"),
    previousButton: card.querySelector<HTMLButtonElement>('[data-mv-step="-1"]'),
    nextButton: card.querySelector<HTMLButtonElement>('[data-mv-step="1"]'),
  };
}

function syncStepButton(button: HTMLButtonElement | null, isAtLimit: boolean): void {
  if (!button) return;
  button.disabled = isAtLimit;
  setButtonVariant(button, isAtLimit ? "ghost" : "primary");
}

function syncAriaState(elements: MissionTabsElements, activeIndex: number): void {
  elements.tabs.forEach((tab, index) => tab.setAttribute("aria-selected", String(index === activeIndex)));
  elements.panels.forEach((panel, index) => panel.setAttribute("aria-hidden", String(index !== activeIndex)));
}

function keepPagerFocus(elements: MissionTabsElements, focusedBefore: Element | null): void {
  const { previousButton, nextButton } = elements;
  if (focusedBefore === previousButton && previousButton?.disabled) nextButton?.focus();
  if (focusedBefore === nextButton && nextButton?.disabled) previousButton?.focus();
}

function applyIndex(elements: MissionTabsElements, activeIndex: number): void {
  const focusedBefore = document.activeElement;
  const lastIndex = elements.panels.length - 1;
  // CSS reads data-mv-index (indicator, track slide, tab
  // colour); nothing in TS does. Do not remove.
  elements.card.dataset.mvIndex = String(activeIndex);
  syncAriaState(elements, activeIndex);
  if (elements.count) elements.count.textContent = elements.panels[activeIndex]?.dataset.mvNumber ?? "";
  syncStepButton(elements.previousButton, activeIndex === 0);
  syncStepButton(elements.nextButton, activeIndex === lastIndex);
  keepPagerFocus(elements, focusedBefore);
}

function handleArrowKeys(event: KeyboardEvent, currentIndex: number, goTo: (index: number) => void): void {
  if (event.key === "ArrowRight") goTo(currentIndex + 1);
  else if (event.key === "ArrowLeft") goTo(currentIndex - 1);
}

export function initMissionTabs(card: HTMLElement): void {
  const elements = queryElements(card);
  const lastIndex = elements.panels.length - 1;
  if (lastIndex < 1) return;
  let activeIndex = 0;
  const goTo = (requestedIndex: number) => {
    activeIndex = Math.max(0, Math.min(lastIndex, requestedIndex));
    const tabHadFocus = elements.tabs.some((tab) => tab === document.activeElement);
    applyIndex(elements, activeIndex);
    if (tabHadFocus) elements.tabs[activeIndex]?.focus();
  };
  elements.tabs.forEach((tab, index) => tab.addEventListener("click", () => goTo(index)));
  elements.previousButton?.addEventListener("click", () => goTo(activeIndex - 1));
  elements.nextButton?.addEventListener("click", () => goTo(activeIndex + 1));
  card.addEventListener("keydown", (event) => handleArrowKeys(event, activeIndex, goTo));
  applyIndex(elements, activeIndex);
}
