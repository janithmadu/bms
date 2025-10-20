
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BoardroomDetailsProps {
  boardroom: any;
}

export default function BoardroomDetails({ boardroom }: BoardroomDetailsProps) {
  return (
    <Card className="rounded-2xl shadow-md overflow-hidden md:w-1/2">
      {boardroom?.imageUrl ? (
        <img className="w-full h-56 object-cover" src={boardroom.imageUrl} alt={boardroom.name} />
      ) : (
        <div className="w-full h-56 bg-slate-100 flex items-center justify-center text-slate-400">
          No image
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{boardroom?.name}</h3>
        <p className="text-sm text-slate-600 mt-1">{boardroom?.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="text-xs">{boardroom?.capacity} people</Badge>
          {boardroom?.dimensions && <Badge className="text-xs">{boardroom.dimensions}</Badge>}
          {boardroom?.facilities?.map((f: string, i: number) => (
            <Badge key={i} className="text-xs">{f}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
