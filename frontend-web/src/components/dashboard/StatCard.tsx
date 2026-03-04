interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
}

const StatCard = ({ title, value, change }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-sm text-gray-500 mb-2">{title}</h3>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-gray-800">
          {value}
        </span>

        {change && (
          <span className="text-sm text-green-600 font-medium">
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;