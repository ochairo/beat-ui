import { For, component, onCleanup } from "@ochairo/beat";
import { derived, pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
} from "../../../foundations";
import { HlSelect, type SelectOption, type SelectStyles } from "./Select";

export interface DatePickerStyles {
  readonly root?: string;
  readonly header?: string;
  readonly title?: string;
  readonly titleMonth?: string;
  readonly monthSelect?: SelectStyles;
  readonly yearSelect?: SelectStyles;
  readonly navButton?: string;
  readonly grid?: string;
  readonly weekday?: string;
  readonly day?: (
    selected: boolean,
    today: boolean,
    outside: boolean,
  ) => string;
}

export interface DatePickerYearSelectRange {
  readonly previous?: number;
  readonly next?: number;
}

export interface DatePickerProps
  extends BeatUiAccessibilityProps, BeatUiControlledValueProps<string> {
  readonly styles?: DatePickerStyles;
  readonly yearSelectRange?: DatePickerYearSelectRange;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

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

function getYearOptions(
  selectedYear: number,
  range: DatePickerYearSelectRange | undefined,
): readonly number[] {
  const previous = Math.max(0, range?.previous ?? 5);
  const next = Math.max(0, range?.next ?? 5);
  const years: number[] = [];

  for (
    let year = selectedYear - previous;
    year <= selectedYear + next;
    year += 1
  ) {
    years.push(year);
  }

  return years;
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

const MONTH_MENU_MIN_WIDTH = "7.2rem";
const YEAR_MENU_MIN_WIDTH = "5.4rem";

const HEADER_SELECT_ITEM_STYLE = (active: boolean, disabled: boolean): string =>
  `display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.45rem 0.65rem;border:none;border-radius:0.5rem;background:${active ? "var(--beat-ui-color-background-accent-soft)" : "transparent"};color:${disabled ? "var(--beat-ui-color-text-muted)" : "var(--beat-ui-color-text)"};font:inherit;font-size:0.85rem;text-align:left;cursor:${disabled ? "not-allowed" : "pointer"};`;

const MONTH_OPTIONS: readonly SelectOption[] = MONTH_NAMES.map(
  (monthName, monthIndex) => ({
    label: monthName,
    value: String(monthIndex),
  }),
);

function joinStyles(...styles: Array<string | undefined>): string | undefined {
  const resolved = styles.filter(
    (style): style is string => style !== undefined && style !== "",
  );

  return resolved.length > 0 ? resolved.join("") : undefined;
}

function createYearOptions(years: readonly number[]): readonly SelectOption[] {
  return years.map((year) => ({
    label: String(year),
    value: String(year),
  }));
}

function createHeaderSelectStyles(menuWidth: string): SelectStyles {
  return {
    trigger:
      "width:auto;min-width:0;min-height:1.9rem;padding:0.1rem 0.2rem;border:none;border-radius:0.4rem;background:transparent;color:var(--beat-ui-color-text);font:inherit;font-size:0.92rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;cursor:pointer;white-space:nowrap;",
    triggerLabel:
      "display:block;width:auto;min-width:0;text-align:center;white-space:nowrap;",
    chevron: "display:none;",
    menu: `position:absolute;top:calc(100% + 0.25rem);left:50%;transform:translateX(-50%);width:max-content;min-width:${menuWidth};max-width:min(12rem, calc(100vw - 1rem));max-height:14rem;overflow:auto;z-index:var(--beat-ui-z-index-popover);background:var(--beat-ui-color-background-elevated);border-radius:0.75rem;box-shadow:0 8px 24px rgba(0, 0, 0, 0.35);padding:0.25rem;outline:none;`,
    item: HEADER_SELECT_ITEM_STYLE,
  };
}

function mergeSelectStyles(
  defaults: SelectStyles,
  overrides: SelectStyles | undefined,
): SelectStyles {
  return {
    ...defaults,
    ...overrides,
    item: overrides?.item ?? defaults.item,
  };
}

const DEFAULT_MONTH_SELECT_STYLES =
  createHeaderSelectStyles(MONTH_MENU_MIN_WIDTH);

const DEFAULT_YEAR_SELECT_STYLES =
  createHeaderSelectStyles(YEAR_MENU_MIN_WIDTH);

export const HlDatePicker = component<DatePickerProps>((props) => {
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

  const monthValue = pulse(String(viewMonth.get()));
  const yearValue = pulse(String(viewYear.get()));
  const yearOptions = pulse(
    createYearOptions(getYearOptions(viewYear.get(), props.yearSelectRange)),
  );
  const days = pulse(getCalendarDays(viewYear.get(), viewMonth.get()));

  function updateView(): void {
    monthValue.set(String(viewMonth.get()));
    yearValue.set(String(viewYear.get()));
    yearOptions.set(
      createYearOptions(getYearOptions(viewYear.get(), props.yearSelectRange)),
    );
    days.set(getCalendarDays(viewYear.get(), viewMonth.get()));
  }

  onCleanup(
    state.state.on(({ currentValue }) => {
      const parsed = parseDate(currentValue);
      if (parsed) {
        viewYear.set(parsed.getFullYear());
        viewMonth.set(parsed.getMonth());
        updateView();
      }
    }),
  );

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

  function handleYearChange(value: string): void {
    const nextYear = Number(value);

    if (Number.isNaN(nextYear)) {
      return;
    }

    viewYear.set(nextYear);
    updateView();
  }

  function handleMonthChange(value: string): void {
    const nextMonth = Number(value);

    if (Number.isNaN(nextMonth) || nextMonth < 0 || nextMonth > 11) {
      return;
    }

    viewMonth.set(nextMonth);
    updateView();
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
          <span data-part="title-content">
            <span
              data-part="title-month"
              style={joinStyles(
                "display:inline-flex;justify-content:center;",
                props.styles?.titleMonth,
              )}
            >
              <HlSelect
                ariaLabel="Choose month"
                value={monthValue}
                options={MONTH_OPTIONS}
                useFloatingLayer={false}
                styles={mergeSelectStyles(
                  DEFAULT_MONTH_SELECT_STYLES,
                  props.styles?.monthSelect,
                )}
                onValueChange={(value) => handleMonthChange(value)}
              />
            </span>
            <span
              data-part="title-year"
              style="display:inline-flex;justify-content:center;"
            >
              <HlSelect
                ariaLabel="Choose year"
                value={yearValue}
                options={yearOptions}
                useFloatingLayer={false}
                styles={mergeSelectStyles(
                  DEFAULT_YEAR_SELECT_STYLES,
                  props.styles?.yearSelect,
                )}
                onValueChange={(value) => handleYearChange(value)}
              />
            </span>
          </span>
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
        {WEEKDAYS.map((day) => (
          <span
            data-part="weekday"
            role="columnheader"
            style={props.styles?.weekday}
          >
            {day}
          </span>
        ))}
        <For each={days}>
          {(cellPulse) => {
            const cell = cellPulse.get();
            const dateStr = formatDate(cell.date);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === state.state.get();
            const dayNumber = derived(cellPulse, (c) => c.day);
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
                  function update(): void {
                    const c = cellPulse.get();
                    const sel = formatDate(c.date) === state.state.get();
                    const today = formatDate(c.date) === todayStr;
                    (el as HTMLButtonElement).setAttribute(
                      "aria-selected",
                      String(sel),
                    );
                    (el as HTMLButtonElement).setAttribute(
                      "data-outside",
                      String(c.outside),
                    );
                    if (today) {
                      (el as HTMLButtonElement).setAttribute(
                        "aria-current",
                        "date",
                      );
                    } else {
                      (el as HTMLButtonElement).removeAttribute("aria-current");
                    }
                    if (props.styles?.day) {
                      (el as HTMLElement).style.cssText = props.styles.day(
                        sel,
                        today,
                        c.outside,
                      );
                    }
                  }
                  state.state.on(update);
                  cellPulse.on(update);
                }}
                onClick={() => selectDay(cellPulse.get())}
              >
                {dayNumber}
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
});
