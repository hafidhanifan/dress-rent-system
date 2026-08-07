"use client";

import { useState } from "react";

// label hari & nama bulan buat ditampilkan di kalender
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

// bentuk data rentang tanggal yang dipilih user
export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

// satu rentang tanggal yang sudah dipesan orang lain, dari backend
export type BookedRange = { startDate: string; endDate: string };

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minRentalDays?: number;
  bookedRanges?: BookedRange[];
  stock?: number;
  bufferDays?: number;
};

// cek dua tanggal jatuh di hari yang sama
function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// cek tanggal d ada di antara a dan b (tidak termasuk ujungnya)
function isBetween(d: Date, a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  const s = a < b ? a : b;
  const e = a < b ? b : a;
  return d > s && d < e;
}

// buang jam/menit/detik, sisain tanggalnya saja
function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// berapa order yang BENERAN nyewa (tanpa buffer) di tanggal ini
function countActive(date: Date, bookedRanges: BookedRange[]) {
  return bookedRanges.filter((range) => {
    const start = startOfDay(new Date(range.startDate));
    const end = startOfDay(new Date(range.endDate));
    return date >= start && date <= end;
  }).length;
}

// berapa order yang masih "nempatin slot" termasuk masa buffer
// (dari startDate order sampai endDate + bufferDays)
function countOccupied(
  date: Date,
  bookedRanges: BookedRange[],
  bufferDays: number,
) {
  return bookedRanges.filter((range) => {
    const start = startOfDay(new Date(range.startDate));
    const end = startOfDay(new Date(range.endDate));
    const bufferedEnd = new Date(end);
    bufferedEnd.setDate(bufferedEnd.getDate() + bufferDays);
    return date >= start && date <= bufferedEnd;
  }).length;
}

// status satu tanggal: tersedia, kena buffer (masih ada slot lain
// yang beneran kosong), atau penuh beneran disewa
function getDateStatus(
  date: Date,
  bookedRanges: BookedRange[],
  stock: number,
  bufferDays: number,
): "available" | "buffered" | "full" {
  const active = countActive(date, bookedRanges);
  if (active >= stock) return "full";

  const occupied = countOccupied(date, bookedRanges, bufferDays);
  if (occupied >= stock) return "buffered";

  return "available";
}

// warna satu sel kalender tergantung statusnya
function getDayStyle({
  isPast,
  isStart,
  isEnd,
  isHoverEnd,
  inRange,
  isToday,
  status,
}: {
  isPast: boolean;
  isStart: boolean;
  isEnd: boolean;
  isHoverEnd: boolean;
  inRange: boolean;
  isToday: boolean;
  status: "available" | "buffered" | "full";
}) {
  if (isStart || isEnd || isHoverEnd) {
    return { bg: "var(--user-text)", color: "var(--user-bg)", radius: "4px" };
  }
  if (inRange) {
    return {
      bg: "var(--user-bg-alt)",
      color: "var(--user-text-secondary)",
      radius: "0",
    };
  }
  if (status === "full" && !isPast) {
    return { bg: "rgba(192,80,80,0.08)", color: "#c05050", radius: "4px" };
  }
  if (status === "buffered" && !isPast) {
    return { bg: "rgba(200,150,60,0.08)", color: "#c8963c", radius: "4px" };
  }
  return {
    bg: "transparent",
    color: isPast
      ? "var(--user-text-faint)"
      : isToday
        ? "var(--user-text-muted)"
        : "var(--user-text-secondary)",
    radius: "4px",
  };
}

export default function DateRangePicker({
  value,
  onChange,
  minRentalDays = 1,
  bookedRanges = [],
  stock = 1,
  bufferDays = 0,
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

  // cek apakah ada tanggal yang tidak "available" di sepanjang rentang s..e
  const rangeHasBlockedDay = (s: Date, e: Date) => {
    const cursor = new Date(s);
    while (cursor <= e) {
      if (
        getDateStatus(cursor, bookedRanges, stock, bufferDays) !== "available"
      )
        return true;
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  };

  const handleClick = (date: Date) => {
    if (getDateStatus(date, bookedRanges, stock, bufferDays) !== "available")
      return;

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: date, endDate: null });
      return;
    }
    if (sameDay(date, startDate)) {
      onChange({ startDate: null, endDate: null });
      return;
    }
    const s = date < startDate ? date : startDate;
    const e = date < startDate ? startDate : date;

    if (rangeHasBlockedDay(s, e)) return;

    onChange({ startDate: s, endDate: e });
    setHoverDate(null);
  };

  const month2 = viewMonth === 11 ? 0 : viewMonth + 1;
  const year2 = viewMonth === 11 ? viewYear + 1 : viewYear;

  return (
    <div>
      {/* dua bulan berdampingan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthGrid
          year={viewYear}
          month={viewMonth}
          showPrev
          showNext={false}
          today={today}
          startDate={startDate}
          endDate={endDate}
          hoverDate={hoverDate}
          bookedRanges={bookedRanges}
          stock={stock}
          bufferDays={bufferDays}
          onNavigate={navigate}
          onDayClick={handleClick}
          onDayHover={setHoverDate}
        />
        <MonthGrid
          year={year2}
          month={month2}
          showPrev={false}
          showNext
          today={today}
          startDate={startDate}
          endDate={endDate}
          hoverDate={hoverDate}
          bookedRanges={bookedRanges}
          stock={stock}
          bufferDays={bufferDays}
          onNavigate={navigate}
          onDayClick={handleClick}
          onDayHover={setHoverDate}
        />
      </div>

      {/* keterangan warna di bawah kalender */}
      <div
        className="flex items-center gap-4 mt-4 pt-4 flex-wrap"
        style={{ borderTop: "1px solid var(--user-border)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ background: "var(--user-text)" }}
          />
          <span
            className="font-sans text-[10px]"
            style={{ color: "var(--user-text-muted)" }}
          >
            Tanggal dipilih
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{
              background: "var(--user-bg)",
              border: "1px solid var(--user-border)",
            }}
          />
          <span
            className="font-sans text-[10px]"
            style={{ color: "var(--user-text-muted)" }}
          >
            Rentang sewa
          </span>
        </div>
        {bookedRanges.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ background: "rgba(192,80,80,0.15)" }}
              />
              <span
                className="font-sans text-[10px]"
                style={{ color: "var(--user-text-muted)" }}
              >
                Sudah disewa
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ background: "rgba(200,150,60,0.15)" }}
              />
              <span
                className="font-sans text-[10px]"
                style={{ color: "var(--user-text-muted)" }}
              >
                Masa pembersihan
              </span>
            </div>
          </>
        )}
        {minRentalDays > 1 && (
          <span
            className="font-sans text-[10px] ml-auto"
            style={{ color: "var(--user-text-muted)" }}
          >
            Min. {minRentalDays} hari
          </span>
        )}
      </div>
    </div>
  );
}

// satu blok kalender bulanan, dipakai 2x buat tampilan dua bulan berdampingan
function MonthGrid({
  year,
  month,
  showPrev,
  showNext,
  today,
  startDate,
  endDate,
  hoverDate,
  bookedRanges,
  stock,
  bufferDays,
  onNavigate,
  onDayClick,
  onDayHover,
}: {
  year: number;
  month: number;
  showPrev: boolean;
  showNext: boolean;
  today: Date;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  bookedRanges: BookedRange[];
  stock: number;
  bufferDays: number;
  onNavigate: (dir: number) => void;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
}) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();

  return (
    <div>
      {/* header nama bulan + tombol navigasi */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate(-1)}
          style={{
            visibility: showPrev ? "visible" : "hidden",
            color: "var(--user-text-muted)",
          }}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:text-(--user-text) hover:bg-(--user-bg-alt)"
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
        <span
          className="font-sans text-[11px] tracking-[0.15em] uppercase"
          style={{ color: "var(--user-text-secondary)" }}
        >
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => onNavigate(1)}
          style={{
            visibility: showNext ? "visible" : "hidden",
            color: "var(--user-text-muted)",
          }}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:text-(--user-text) hover:bg-(--user-bg-alt)"
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

      {/* grid 7 kolom: label hari + kotak-kotak tanggal */}
      <div className="grid grid-cols-7 gap-0">
        {DAYS.map((d) => (
          <div
            key={d}
            className="font-sans text-[9px] tracking-widest uppercase text-center py-2"
            style={{ color: "var(--user-text-muted)" }}
          >
            {d}
          </div>
        ))}

        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: last.getDate() }).map((_, i) => {
          const d = i + 1;
          const date = startOfDay(new Date(year, month, d));
          const isPast = date < today;
          const isToday = sameDay(date, today);
          const isStart = sameDay(date, startDate);
          const isEnd = sameDay(date, endDate);
          const isHoverEnd = !endDate && sameDay(date, hoverDate);
          const effectiveEnd =
            endDate ?? (startDate && hoverDate ? hoverDate : null);
          const inRange =
            !isStart && !isEnd && isBetween(date, startDate, effectiveEnd);
          const status = getDateStatus(date, bookedRanges, stock, bufferDays);

          const { bg, color, radius } = getDayStyle({
            isPast,
            isStart,
            isEnd,
            isHoverEnd,
            inRange,
            isToday,
            status,
          });
          const disabled =
            isPast || (status !== "available" && !isStart && !isEnd);

          const title = isPast
            ? undefined
            : status === "full"
              ? "Sudah disewa"
              : status === "buffered"
                ? "Masa pembersihan"
                : undefined;

          return (
            <div
              key={d}
              onClick={() => !disabled && onDayClick(date)}
              onMouseEnter={() =>
                !disabled && startDate && !endDate && onDayHover(date)
              }
              onMouseLeave={() => onDayHover(null)}
              title={title}
              style={{
                background: bg,
                color,
                borderRadius: radius,
                cursor: disabled ? "not-allowed" : "pointer",
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: isToday ? 500 : 400,
                textDecoration:
                  !isPast && status !== "available" ? "line-through" : "none",
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
}
