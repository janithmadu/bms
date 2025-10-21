import { Calendar } from "@/components/ui/calendar";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  canBookDate: (date: Date) => boolean;
}

export default function DateSelector({
  selectedDate,
  setSelectedDate,
  canBookDate,
}: DateSelectorProps) {
  return (
    <div className="md:w-1/2 p-4 flex flex-col">
      <h4 className="text-sm font-medium text-slate-700 mb-2">Select Date</h4>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(d) => setSelectedDate(d as Date)}
        disabled={(date) => !canBookDate(date)}
      />
      <div className="mt-3">
        <p className="text-xs text-slate-500">
          You can book up to 30 days in advance
        </p>
      </div>
    </div>
  );
}
