import { initHistoryTimeline } from "./history-timeline";
import { initMissionTabs } from "./mission-tabs";

export function initNosotrosPage(): void {
  const missionVisionCard = document.querySelector<HTMLElement>("[data-mv]");
  if (missionVisionCard) initMissionTabs(missionVisionCard);
  const historyTimeline = document.querySelector<HTMLElement>("[data-history-timeline]");
  if (historyTimeline) initHistoryTimeline(historyTimeline);
}
