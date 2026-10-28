import { showToast } from "../ui/toast";

export interface CopyFeedbackMessages {
  success: string;
  failure: string;
}

export function copyWithExecCommand(text: string): boolean {
  const scratchTextarea = document.createElement("textarea");
  try {
    scratchTextarea.value = text;
    scratchTextarea.setAttribute("readonly", "");
    scratchTextarea.style.cssText = "position:fixed;opacity:0;";
    document.body.appendChild(scratchTextarea);
    scratchTextarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    scratchTextarea.remove();
  }
}

export async function copyText(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return copyWithExecCommand(text);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyWithExecCommand(text);
  }
}

async function copyAndAnnounce(text: string, messages: CopyFeedbackMessages): Promise<void> {
  const copied = await copyText(text);
  showToast(copied ? messages.success : messages.failure);
}

export function initCopyButtons(root: ParentNode, messages: CopyFeedbackMessages): void {
  root.querySelectorAll<HTMLElement>("[data-copy-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const valueToCopy = button.dataset.copyValue;
      if (!valueToCopy) return;
      void copyAndAnnounce(valueToCopy, messages);
    });
  });
}
