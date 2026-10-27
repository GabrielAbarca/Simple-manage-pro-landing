// Nosotros orchestration. The standard reveal runs from the layout; this
// wires the two behaviours the page adds: the Misión / Visión tabs and the
// history timeline that plays once.

import { initHistoryTimeline } from "./history-timeline";
import { initMissionTabs } from "./mission-tabs";

export function initNosotrosPage(): void {
  const missionVisionCard = document.querySelector<HTMLElement>("[data-mv]");
  if (missionVisionCard) initMissionTabs(missionVisionCard);
  const historyTimeline = document.querySelector<HTMLElement>("[data-history-timeline]");
  if (historyTimeline) initHistoryTimeline(historyTimeline);
}
