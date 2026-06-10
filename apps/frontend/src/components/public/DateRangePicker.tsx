"use client";

// src/components/public/DateRangePicker.tsx

import { useState } from "react";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minRentalDays?: number;
};

function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(d: Date, a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  const s = a < b ? a : b;
  const e = a < b ? b : a;
  return d > s && d < e;
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function DateRangePicker({
  value,
  onChange,
  minRentalDays = 1,
}: Props) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const { startDate, endDate } = value;

  const navigate = (dir: number) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const handleClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: date, endDate: null });
    } else {
      if (sameDay(date, startDate)) {
        onChange({ startDate: null, endDate: null });
        return;
      }
      const s = date < startDate ? date : startDate;
      const e = date < startDate ? startDate : date;
      onChange({ startDate: s, endDate: e });
      setHoverDate(null);
    }
  };

  const month2 = viewMonth === 11 ? 0 : viewMonth + 1;
  const year2 = viewMonth === 11 ? viewYear + 1 : viewYear;

  return (
    <div>
      {/* Dua bulan berdampingan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { year: viewYear, month: viewMonth, showPrev: true, showNext: false },
          { year: year2, month: month2, showPrev: false, showNext: true },
        ].map(({ year, month, showPrev, showNext }) => {
          const first = new Date(year, month, 1);
          const last = new Date(year, month + 1, 0);
          const startDay = first.getDay();

          return (
            <div key={`${year}-${month}`}>
              {/* Header bulan */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate(-1)}
                  style={{ visibility: showPrev ? "visible" : "hidden" }}
                  className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-stone-600">
                  {MONTHS[month]} {year}
                </span>
                <button
                  onClick={() => navigate(1)}
                  style={{ visibility: showNext ? "visible" : "hidden" }}
                  className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>

              {/* Grid hari */}
              <div className="grid grid-cols-7 gap-0">
                {/* Label hari */}
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="font-sans text-[9px] tracking-[0.1em] uppercase text-stone-400 text-center py-2"
                  >
                    {d}
                  </div>
                ))}

                {/* Empty cells */}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Hari */}
                {Array.from({ length: last.getDate() }).map((_, i) => {
                  const d = i + 1;
                  const date = startOfDay(new Date(year, month, d));
                  const isPast = date < today;
                  const isToday = sameDay(date, today);
                  const isStart = sameDay(date, startDate);
                  const isEnd = sameDay(date, endDate);
                  const effectiveEnd =
                    endDate ?? (startDate && hoverDate ? hoverDate : null);
                  const inRange =
                    !isStart &&
                    !isEnd &&
                    isBetween(date, startDate, effectiveEnd);
                  const isHoverEnd = !endDate && sameDay(date, hoverDate);

                  let bg = "transparent";
                  let color = isPast ? "#c8b8a8" : "#44403c";
                  let radius = "4px";
                  let cursor = isPast ? "not-allowed" : "pointer";

                  if (isStart || isEnd || isHoverEnd) {
                    bg = "#1c1917";
                    color = "#f0ebe3";
                  } else if (inRange) {
                    bg = "#f0ebe3";
                    color = "#44403c";
                    radius = "0";
                  }

                  if (isToday && !isStart && !isEnd) {
                    color = isPast ? "#c8b8a8" : "#78716c";
                  }

                  return (
                    <div
                      key={d}
                      onClick={() => !isPast && handleClick(date)}
                      onMouseEnter={() => {
                        if (!isPast && startDate && !endDate)
                          setHoverDate(date);
                      }}
                      onMouseLeave={() => setHoverDate(null)}
                      style={{
                        background: bg,
                        color,
                        borderRadius: radius,
                        cursor,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontFamily: "inherit",
                        fontWeight: isToday ? 500 : 400,
                        transition: "background 0.1s",
                        userSelect: "none",
                      }}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Keterangan */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-200/60">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stone-800 rounded-sm" />
          <span className="font-sans text-[10px] text-stone-400">
            Tanggal dipilih
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#f0ebe3] border border-stone-200 rounded-sm" />
          <span className="font-sans text-[10px] text-stone-400">
            Rentang sewa
          </span>
        </div>
        {minRentalDays > 1 && (
          <span className="font-sans text-[10px] text-stone-400 ml-auto">
            Min. {minRentalDays} hari
          </span>
        )}
      </div>
    </div>
  );
}
