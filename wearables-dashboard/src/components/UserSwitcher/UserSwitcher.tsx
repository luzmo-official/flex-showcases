import { Box } from "@mui/material";

import { useUser, mockUsers } from "../../services/UserService";

const UserSwitcher = () => {
  const { switchUser } = useUser();

  return (
    <Box>
      <h2>Switch User</h2>
      <ul>
        {mockUsers.map((user) => (
          <li key={user.id}>
            <button onClick={() => switchUser(user)}>{user.name}</button>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default UserSwitcher;
