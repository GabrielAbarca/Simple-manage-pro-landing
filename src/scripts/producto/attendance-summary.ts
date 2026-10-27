// The attendance card's live summary ("2 presentes · 1 ausente · 1 tardía").
// Pure, so the build renders the first state with the same words the page
// script writes afterwards. Present always shows, even at zero; absent and
// late only when someone has them, as in Producto.dc.html renderVals.

import { teacherConsoleCopy, type AttendanceStatus } from "../../data/producto";

function countWithNoun(count: number, [singular, plural]: readonly [string, string]): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function summariseAttendance(statuses: readonly AttendanceStatus[]): string {
  const words = teacherConsoleCopy.summaryWords;
  const count = (status: AttendanceStatus) => statuses.filter((s) => s === status).length;
  const absent = count("absent");
  const late = count("late");
  return [
    countWithNoun(count("present"), words.present),
    absent ? countWithNoun(absent, words.absent) : null,
    late ? countWithNoun(late, words.late) : null,
  ]
    .filter(Boolean)
    .join(teacherConsoleCopy.summarySeparator);
}
