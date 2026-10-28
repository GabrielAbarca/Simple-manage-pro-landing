import { currentLayout, type Layout } from "../core/breakpoints";
import { studentConsoleCopy, type StudentPeriod } from "../../data/producto";
import { setButtonVariant, setGradeBar, setProgressRing } from "../ui/ds-runtime";

const GRADE_BAR_WIDTH: Record<Layout, [number, number, number]> = {
  desktop: [60, 0.1, 220],
  tablet: [160, 0.42, 420],
  mobile: [80, 0.3, 180],
};

function gradeBarWidthPx(): number {
  const [floor, share, ceiling] = GRADE_BAR_WIDTH[currentLayout()];
  return Math.round(Math.max(floor, Math.min(ceiling, innerWidth * share)));
}

interface StudentDom {
  buttons: HTMLElement[];
  ring: HTMLElement | null;
  average: HTMLElement | null;
  attendance: HTMLElement | null;
  bars: HTMLElement[];
  grades: HTMLElement[];
}

function findStudentDom(card: HTMLElement): StudentDom {
  return {
    buttons: [...card.querySelectorAll<HTMLElement>("[data-period]")],
    ring: card.querySelector<HTMLElement>("[data-student-ring]"),
    average: card.querySelector<HTMLElement>("[data-student-average]"),
    attendance: card.querySelector<HTMLElement>("[data-student-attendance]"),
    bars: [...card.querySelectorAll<HTMLElement>("[data-student-bar]")],
    grades: [...card.querySelectorAll<HTMLElement>("[data-student-grade]")],
  };
}

function showPeriod(dom: StudentDom, period: StudentPeriod): void {
  const data = studentConsoleCopy.periods[period];
  dom.buttons.forEach((button) => {
    const active = button.dataset.period === period;
    setButtonVariant(button, active ? "primary" : "ghost");
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (dom.ring) setProgressRing(dom.ring, data.attendance);
  if (dom.average) dom.average.textContent = data.average;
  if (dom.attendance) dom.attendance.textContent = data.attendanceLine;
  dom.bars.forEach((bar, i) => setGradeBar(bar, data.grades[i]));
  dom.grades.forEach((grade, i) => { grade.textContent = String(data.grades[i]); });
}

function isStudentPeriod(value: string | undefined): value is StudentPeriod {
  return value === "I" || value === "II";
}

export function initStudentConsole(root: ParentNode): void {
  const card = root.querySelector<HTMLElement>("[data-student-console]");
  if (!card) return;
  const dom = findStudentDom(card);
  dom.buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const period = button.dataset.period;
      if (isStudentPeriod(period)) showPeriod(dom, period);
    });
  });
  const gradeList = card.querySelector<HTMLElement>("[data-student-grades]");
  if (!gradeList) return;
  const sizeBars = () => gradeList.style.setProperty("--grade-bar-w", `${gradeBarWidthPx()}px`);
  sizeBars();
  addEventListener("resize", sizeBars);
}
