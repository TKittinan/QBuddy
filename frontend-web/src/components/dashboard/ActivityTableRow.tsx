type Props = {
  ticket: string;
  name: string;
  service: string;
  wait: string;
  status: string;
};

const ActivityTableRow = ({ ticket, name, service, wait, status }: Props) => {
  const statusStyle = (status: string) => {
    switch (status) {
      case "Serving":
        return "bg-green-100 text-green-600";
      case "Waiting":
        return "bg-yellow-100 text-yellow-600";
      case "Completed":
        return "bg-slate-100 text-slate-500";
      default:
        return "";
    }
  };

  return (
    <tr className="border-b hover:bg-slate-50 transition">
      <td className="py-4 font-medium text-indigo-600">{ticket}</td>
      <td>{name}</td>
      <td>
        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs">
          {service}
        </span>
      </td>
      <td>{wait}</td>
      <td>
        <span
          className={`px-3 py-1 text-xs rounded-full ${statusStyle(status)}`}
        >
          {status}
        </span>
      </td>
      <td className="text-right space-x-2">
        <button className="px-3 py-1 text-xs bg-slate-100 rounded-lg hover:bg-slate-200">
          Transfer
        </button>
        <button className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
          Complete
        </button>
      </td>
    </tr>
  );
};

export default ActivityTableRow;