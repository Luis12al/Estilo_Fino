// frontend/src/components/features/booking/DatePicker.tsx

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void; // ← VUELVE A Date (no null)
}

export const DatePicker = ({ selectedDate, onSelectDate }: DatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{ date: number; fullDate: Date | null }> = [];

    for (let i = 0; i < startingDay; i++) {
      days.push({ date: 0, fullDate: null });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, fullDate: new Date(year, month, i) });
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-[#C9A84C]" />
          <h3 className="text-white font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-[#9CA3AF] text-xs font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day.fullDate) {
            return <div key={idx} className="h-10" />;
          }

          const past = isPast(day.fullDate);
          const today = isToday(day.fullDate);
          const selected = isSelected(day.fullDate);

          return (
            <button
              key={idx}
              onClick={() => !past && onSelectDate(day.fullDate)}
              disabled={past}
              className={`h-10 rounded-lg text-sm font-medium transition-all ${
                selected
                  ? 'bg-[#C9A84C] text-[#1A1A1A]'
                  : today
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30'
                  : past
                  ? 'text-[#3A3A3A] cursor-not-allowed'
                  : 'text-white hover:bg-[#252525]'
              }`}
            >
              {day.date}
            </button>
          );
        })}
      </div>
    </div>
  );
};