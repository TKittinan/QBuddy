interface QueueItemProps {
  name: string;
  count: number;
}

const QueueItem = ({ name, count }: QueueItemProps) => {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <span className="text-sm text-gray-700">{name}</span>
      <span className="text-sm font-semibold text-teal-600">
        {count} waiting
      </span>
    </div>
  );
};

export default QueueItem;