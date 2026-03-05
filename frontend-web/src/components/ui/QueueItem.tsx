import Card from "./Card";

interface QueueItemProps {
  name: string;
  count: number;
}

const QueueItem = ({ name, count }: QueueItemProps) => {
  return (
    // ✅ นำ Card มาใช้งานแทน div ชั้นนอก
    <Card className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all group max-w-full shadow-none">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
          {name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
            {count}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            waiting
          </span>
        </div>
      </div>
    </Card>
  );
};

export default QueueItem;