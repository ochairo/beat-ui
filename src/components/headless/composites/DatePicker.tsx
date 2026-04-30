import { For, component } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
} from "../../../foundations";

export interface DatePickerStyles {
  readonly root?: string;
  readonly header?: string;
  readonly title?: string;
  readonly navButton?: string;
  readonly grid?: string;
  readonly weekday?: string;
  readonly day?: (
    selected: boolean,
    today: boolean,
    outside: boolean,
  ) => string;
}

export interface DatePickerProps
  extends BeatUiAccessibilityProps, BeatUiControlledValueProps<string> {
  readonly styles?: DatePickerStyles;
}

const WEEKDAYS = pulse(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);

interface DayCell {
  readonly date: Date;
  readonly day: number;
  readonly outside: boolean;
}

function getCalendarDays(year: number, month: number): readonly DayCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: DayCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ date: new Date(year, month - 1, day), day, outside: true });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), day, outside: false });
  }

  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    cells.push({ date: new Date(year, month + 1, day), day, outside: true });
  }

  return cells;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(value: string): Date | undefined {
  const parts = value.split("-");
  if (parts.length !== 3) return undefined;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return undefined;
  return new Date(y, m, d);
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const DatePicker = component<DatePickerProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const initial = parseDate(state.state.get());
  const now = new Date();
  const viewYear = pulse(initial?.getFullYear() ?? now.getFullYear());
  const viewMonth = pulse(initial?.getMonth() ?? now.getMonth());

  const title = pulse(`${MONTH_NAMES[viewMonth.get()]} ${viewYear.get()}`);
  const days = pulse(getCalendarDays(viewYear.get(), viewMonth.get()));

  function updateView(): void {
    title.set(`${MONTH_NAMES[viewMonth.get()]} ${viewYear.get()}`);
    days.set(getCalendarDays(viewYear.get(), viewMonth.get()));
  }

  const todayStr = formatDate(now);

  function prevMonth(): void {
    const m = viewMonth.get();
    if (m === 0) {
      viewMonth.set(11);
      viewYear.set(viewYear.get() - 1);
    } else {
      viewMonth.set(m - 1);
    }
    updateView();
  }

  function nextMonth(): void {
    const m = viewMonth.get();
    if (m === 11) {
      viewMonth.set(0);
      viewYear.set(viewYear.get() + 1);
    } else {
      viewMonth.set(m + 1);
    }
    updateView();
  }

  function selectDay(cell: DayCell): void {
    if (cell.outside) {
      viewYear.set(cell.date.getFullYear());
      viewMonth.set(cell.date.getMonth());
      updateView();
    }
    state.setValue(formatDate(cell.date));
  }

  return (
    <div
      id={props.id}
      class={props.class}
      role="group"
      aria-label={props.ariaLabel ?? "Calendar"}
      style={props.styles?.root}
    >
      <div data-part="header" style={props.styles?.header}>
        <button
          type="button"
          data-part="nav-button"
          aria-label="Previous month"
          style={props.styles?.navButton}
          onClick={prevMonth}
        >
          ‹
        </button>
        <span data-part="title" style={props.styles?.title}>
          {title}
        </span>
        <button
          type="button"
          data-part="nav-button"
          aria-label="Next month"
          style={props.styles?.navButton}
          onClick={nextMonth}
        >
          ›
        </button>
      </div>
      <div data-part="grid" role="grid" style={props.styles?.grid}>
        <For each={WEEKDAYS}>
          {(day) => (
            <span
              data-part="weekday"
              role="columnheader"
              style={props.styles?.weekday}
            >
              {day}
            </span>
          )}
        </For>
        <For each={days}>
          {(cellPulse) => {
            const cell = cellPulse.get();
            const dateStr = formatDate(cell.date);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === state.state.get();
            return (
              <button
                type="button"
                data-part="day"
                data-outside={cell.outside}
                role="gridcell"
                aria-selected={isSelected ? "true" : "false"}
                aria-current={isToday ? "date" : undefined}
                style={props.styles?.day?.(isSelected, isToday, cell.outside)}
                ref={(el) => {
                  state.state.on(() => {
                    const sel = formatDate(cell.date) === state.state.get();
                    (el as HTMLButtonElement).setAttribute(
                      "aria-selected",
                      String(sel),
                    );
                    if (props.styles?.day) {
                      (el as HTMLElement).style.cssText = props.styles.day(
                        sel,
                        isToday,
                        cell.outside,
                      );
                    }
                  });
                }}
                onClick={() => selectDay(cell)}
              >
                {cell.day}
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
});
