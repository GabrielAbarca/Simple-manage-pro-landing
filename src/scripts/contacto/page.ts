import { copyFeedback } from "../../data/contacto";
import { initCopyButtons } from "./copy-buttons";

export function initContactoPage(): void {
  initCopyButtons(document, copyFeedback);
}
