// 생년월일 입력: 달력 대신 년/월/일 select 3개 (Figma 목업 기준) + 만 18세 검증
"use client";

import { MIN_SIGNUP_AGE } from "@/features/auth/constants/signupPolicy";
import { isAtLeast18 } from "@/features/auth/utils/isAdult";

interface BirthDateSelectProps {
  year: string;
  month: string;
  day: string;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
  /** 하이드레이션 불일치를 피하기 위해 부모가 확보한 "오늘" 날짜를 주입받음 */
  today: Date;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const daysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

export const BirthDateSelect = ({
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
  today,
}: BirthDateSelectProps) => {
  // 가입 가능한 최신 출생연도(예: 2026년 기준 2008년생)까지만 목록에 노출
  const maxBirthYear = today.getFullYear() - MIN_SIGNUP_AGE;
  const years = Array.from({ length: 100 }, (_, i) => maxBirthYear - i);
  const dayCount =
    year && month ? daysInMonth(Number(year), Number(month)) : 31;
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  const birthDate =
    year && month && day
      ? new Date(Number(year), Number(month) - 1, Number(day))
      : null;
  const isAdult = birthDate ? isAtLeast18(birthDate, today) : null;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
        생년월일 <span className="text-[#356DF3]">*</span>
      </label>

      <div className="flex gap-2">
        <select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="h-11 flex-1 rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-[#142B4A]"
        >
          <option value="" disabled>
            년
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="h-11 flex-1 rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-[#142B4A]"
        >
          <option value="" disabled>
            월
          </option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
          className="h-11 flex-1 rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-[#142B4A]"
        >
          <option value="" disabled>
            일
          </option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {isAdult === false ? (
        <p className="mt-2 text-xs text-red-500">
          만 18세 이상만 가입할 수 있습니다.
        </p>
      ) : null}
    </div>
  );
};

export const isBirthDateValid = (
  year: string,
  month: string,
  day: string,
  today: Date,
) => {
  if (!year || !month || !day) return false;

  const birthDate = new Date(Number(year), Number(month) - 1, Number(day));

  return isAtLeast18(birthDate, today);
};
