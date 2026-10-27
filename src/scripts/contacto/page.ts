// Contacto orchestration. The reveal runs from the layout (profile
// "contacto"); the only page behaviour is the copy buttons.

import { copyFeedback } from "../../data/contacto";
import { initCopyButtons } from "./copy-buttons";

export function initContactoPage(): void {
  initCopyButtons(document, copyFeedback);
}
