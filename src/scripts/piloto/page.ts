// Piloto orchestration: the clipboard scene starts right after first paint
// (it is the hero), the calendar arms its play-once trigger, and the
// application form's controller takes over from the native form.

import { reportSceneError } from "../core/lazy-scene";
import { initCalendar } from "./calendar";
import { initApplicationForm } from "./form/controller";

function startClipboardAfterFirstPaint(): void {
  const stage = document.querySelector<HTMLElement>("[data-clipboard-stage]");
  if (!stage) return;
  requestAnimationFrame(() =>
    import("../three/scenes/piloto-clipboard")
      .then((scene) => scene.startPilotoClipboard(stage))
      .catch((error) => reportSceneError("piloto-clipboard", error)),
  );
}

export function initPilotoPage(): void {
  initCalendar(document.querySelector<HTMLElement>("[data-calendar]"));
  initApplicationForm(
    document.querySelector<HTMLFormElement>("[data-postulacion-form]"),
    document.querySelector<HTMLElement>("[data-confirmation]"),
  );
  startClipboardAfterFirstPaint();
}
