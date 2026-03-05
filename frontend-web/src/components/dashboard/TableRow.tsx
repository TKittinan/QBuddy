interface TableRowProps {
  user: string;
  action: string;
  target: string;
  time: string;
  status: string;
}

const TableRow = ({
  user,
  action,
  target,
  time,
  status,
}: TableRowProps) => {
  const statusColor =
    status === "Completed"
      ? "bg-green-100 text-green-600"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-gray-200 text-gray-600";

  return (
    <tr className="border-b last:border-none">
      <td className="py-3">{user}</td>
      <td>{action}</td>
      <td>{target}</td>
      <td>{time}</td>
      <td>
        <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

export default TableRow;