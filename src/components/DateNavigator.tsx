import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split("T")[0]);
  };

  const displayDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="flex items-center justify-between gap-2 bg-white rounded shadow p-4 mb-4">
      <button
        onClick={handlePrevDay}
        className="p-2 hover:bg-gray-100 rounded transition"
        title="Previous day"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex-1 text-center">
        <p className="font-semibold text-lg">{displayDate}</p>
        {!isToday && (
          <button
            onClick={handleToday}
            className="text-xs text-blue-500 hover:text-blue-700 mt-1"
          >
            Go to today
          </button>
        )}
      </div>

      <button
        onClick={handleNextDay}
        className="p-2 hover:bg-gray-100 rounded transition"
        title="Next day"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateNavigator;
