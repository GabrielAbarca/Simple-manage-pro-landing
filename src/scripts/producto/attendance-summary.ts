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
