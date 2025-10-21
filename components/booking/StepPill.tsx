import { Calendar, Clock, CheckCircle } from "lucide-react";

interface StepPillProps {
  idx: number;
  title: string;
  active: boolean;
  done: boolean;
  icon: any;
}

export function StepPill({ idx, title, active, done, icon: Icon }: StepPillProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
          active ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="hidden md:block">
        <div className={`text-xs ${active ? "text-slate-800" : "text-slate-500"}`}>{title}</div>
      </div>
    </div>
  );
}