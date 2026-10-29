import { useState } from "react";

export interface DateRange {
  fromDate: string; // yyyy-MM-dd, or "" for open/unset
  toDate: string; // yyyy-MM-dd, or "" for open/unset
}

type Mode = "all" | "year" | "month" | "custom";

interface Props {
  /** Called when the user applies or clears a range. */
  onApply: (range: DateRange) => void;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
// Day 0 of the next month is the last day of the given month.
const lastDayOfMonth = (year: number, month1to12: number) =>
  new Date(year, month1to12, 0).getDate();

/**
 * Date-range picker with four modes: All, a whole Year, a single Month, or a
 * custom From/To range. Resolves the selection into plain yyyy-MM-dd strings and
 * hands them to the parent, which sends them to the server. Reused across the
 * orders, inventory, fine-chemical and archive list pages.
 */
const DateRangeFilter = ({ onApply, className }: Props) => {
  const now = new Date();
  const [mode, setMode] = useState<Mode>("all");
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const resolve = (): DateRange => {
    if (mode === "year") {
      return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
    }
    if (mode === "month") {
      const last = lastDayOfMonth(year, month);
      return {
        fromDate: `${year}-${pad(month)}-01`,
        toDate: `${year}-${pad(month)}-${pad(last)}`,
      };
    }
    if (mode === "custom") {
      return { fromDate: from, toDate: to };
    }
    return { fromDate: "", toDate: "" }; // all
  };

  const handleClear = () => {
    setMode("all");
    setFrom("");
    setTo("");
    onApply({ fromDate: "", toDate: "" });
  };

  return (
    <div
      className={className}
      style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
    >
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as Mode)}
        className="form-select form-select-sm"
        style={{ width: "auto" }}
      >
        <option value="all">All dates</option>
        <option value="year">Year</option>
        <option value="month">Month</option>
        <option value="custom">Custom range</option>
      </select>

      {(mode === "year" || mode === "month") && (
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="form-select form-select-sm"
          style={{ width: "auto" }}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}

      {mode === "month" && (
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="form-select form-select-sm"
          style={{ width: "auto" }}
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
      )}

      {mode === "custom" && (
        <>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="form-control form-control-sm"
            style={{ width: "auto" }}
          />
          <span>to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="form-control form-control-sm"
            style={{ width: "auto" }}
          />
        </>
      )}

      <button type="button" className="btn btn-sm btn-primary" onClick={() => onApply(resolve())}>
        Apply
      </button>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleClear}>
        Clear
      </button>
    </div>
  );
};

export default DateRangeFilter;
