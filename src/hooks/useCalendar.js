import { useState, useMemo, useCallback } from "react";
import { generateCalendar, groupByMonth } from "../utils/calendarEngine";

export function useCalendar() {
  const [year, setYearState] = useState(1108);
  const [yearInput, setYearInput] = useState(() => String(year));
  const [currentMonth, setCurrentMonth] = useState(1);

  const { rows, extraMonthSeason, seasonMap } = useMemo(
    () => generateCalendar(year),
    [year]
  );

  const monthData = useMemo(() => groupByMonth(rows), [rows]);

  const commitYear = useCallback(() => {
    const v = parseInt(yearInput, 10);
    if (!isNaN(v) && v >= 1 && v <= 9999) {
      setYearState(v);
    } else {
      setYearInput(String(year));
    }
  }, [yearInput, year]);

  const incrementYear = useCallback(() => {
    setYearState(y => {
      const next = Math.min(9999, y + 1);
      setYearInput(String(next));
      return next;
    });
  }, []);

  const decrementYear = useCallback(() => {
    setYearState(y => {
      const next = Math.max(1, y - 1);
      setYearInput(String(next));
      return next;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(m => Math.min(13, m + 1));
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(m => Math.max(1, m - 1));
  }, []);

  return {
    year,
    yearInput,
    setYearInput,
    commitYear,
    incrementYear,
    decrementYear,
    currentMonth,
    setCurrentMonth,
    goToNextMonth,
    goToPrevMonth,
    rows,
    monthData,
    extraMonthSeason,
    seasonMap,
  };
}
