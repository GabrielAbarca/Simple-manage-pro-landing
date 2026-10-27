// Live UI 02: a pill sets that student's status, the pressed state moves
// with it and the header summary recounts; "Guardar asistencia" confirms with
// the toast. From Producto.dc.html renderVals (attRows, attSummary, saveAtt).

import { attendanceStatuses, savedToast, teacherConsoleCopy, type AttendanceStatus } from "../../data/producto";
import { showToast } from "../ui/toast";
import { summariseAttendance } from "./attendance-summary";

function isAttendanceStatus(value: string | undefined): value is AttendanceStatus {
  return attendanceStatuses.includes(value as AttendanceStatus);
}

function pressPill(row: HTMLElement, status: AttendanceStatus): void {
  row.querySelectorAll<HTMLButtonElement>("button[data-status]").forEach((pill) => {
    pill.setAttribute("aria-pressed", pill.dataset.status === status ? "true" : "false");
  });
}

export function initAttendanceConsole(root: ParentNode): void {
  const card = root.querySelector<HTMLElement>("[data-attendance]");
  if (!card) return;
  const summary = card.querySelector<HTMLElement>("[data-attendance-summary]");
  const statuses: AttendanceStatus[] = teacherConsoleCopy.students.map((student) => student.status);
  card.querySelectorAll<HTMLElement>("[data-attendance-row]").forEach((row, i) => {
    row.addEventListener("click", (event) => {
      const pill = (event.target as Element).closest<HTMLButtonElement>("button[data-status]");
      const status = pill?.dataset.status;
      if (!isAttendanceStatus(status)) return;
      statuses[i] = status;
      pressPill(row, status);
      if (summary) summary.textContent = summariseAttendance(statuses);
    });
  });
  card.querySelector("[data-attendance-save]")?.addEventListener("click", () => showToast(savedToast));
}
