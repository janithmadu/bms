
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  canBookDate: (date: Date) => boolean;
  onContinue: () => void;
}

export default function DateSelector({ selectedDate, setSelectedDate, canBookDate, onContinue }: DateSelectorProps) {
  return (
    <div className="md:w-1/2 p-4 flex flex-col">
      <h4 className="text-sm font-medium text-slate-700 mb-2">Select Date</h4>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(d) => setSelectedDate(d as Date)}
        disabled={(date) => !canBookDate(date)}
      />
      <div className="mt-3 flex justify-between items-center">
        <p className="text-xs text-slate-500"></p>
        <Button
          className="text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          onClick={onContinue}
          disabled={!selectedDate}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
