import UserRow from "./UserRow";
import type { User } from "./index"; 

const users: User[] = [
  { id: "1", name: "John Doe", email: "john.doe@example.com", role: "ADMIN", status: "ACTIVE", createdAt: "2024-03-01T10:00:00Z" },
  { id: "2", name: "Jane Smith", email: "jane.smith@example.com", role: "STAFF", status: "ACTIVE", createdAt: "2024-03-02T11:30:00Z" },
  { id: "3", name: "Bob Brown", email: "bob.b@example.com", role: "CUSTOMER", status: "INACTIVE", createdAt: "2024-03-03T09:15:00Z" },
];

type Props = {
  onSelectUser: (user: User) => void;
};

const UserTable = ({ onSelectUser }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-6">All Users</h2>

      <table className="w-full text-sm">
        <thead className="border-b text-slate-500">
          <tr>
            {/* ✅ บังคับจัดซ้าย (text-left) และเพิ่ม padding (px-4) ให้กว้างขึ้น */}
            <th className="py-3 px-4 text-left font-medium">Name</th>
            <th className="py-3 px-4 text-left font-medium">Email</th>
            <th className="py-3 px-4 text-left font-medium">Role</th>
            <th className="py-3 px-4 text-left font-medium">Status</th>
            <th className="py-3 px-4 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onSelect={() => onSelectUser(user)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;