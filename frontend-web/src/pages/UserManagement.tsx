import { useState } from "react";
import UserTable from "../components/ui/User/UserTable";
import UserDetailPanel from "../components/ui/User/UserDetailPanel";
import type { User } from "../components/ui/User/index"; 

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <>
      <UserTable onSelectUser={setSelectedUser} />

      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
};

export default UserManagement;