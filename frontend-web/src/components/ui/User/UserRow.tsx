import type { User } from "../User/index"; 

type Props = {
  user: User;
  onSelect: () => void;
};

const UserRow = ({ user, onSelect }: Props) => {
  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="py-3">{user.name}</td>
      <td>{user.email}</td>
      <td>{user.status}</td>
      <td className="text-right">
        <button
          onClick={onSelect}
          className="text-indigo-600 text-sm"
        >
          View
        </button>
      </td>
    </tr>
  );
};

export default UserRow;