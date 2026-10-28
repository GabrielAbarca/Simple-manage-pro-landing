import { adminConsoleCopy, savedToast } from "../../data/producto";
import { setBadge, setButtonLabel, setButtonVariant } from "../ui/ds-runtime";
import { showToast } from "../ui/toast";

export function initAdminConsole(root: ParentNode): void {
  const badge = root.querySelector<HTMLElement>("[data-admin-badge]");
  const toggle = root.querySelector<HTMLElement>("[data-admin-toggle]");
  if (!badge || !toggle) return;
  let periodTwoActive = false;
  toggle.addEventListener("click", () => {
    periodTwoActive = !periodTwoActive;
    const period = periodTwoActive ? adminConsoleCopy.periodTwo : adminConsoleCopy.periodOne;
    setBadge(badge, period.tone, period.badge);
    setButtonVariant(toggle, period.variant);
    setButtonLabel(toggle, period.cta);
    showToast(savedToast);
  });
}
