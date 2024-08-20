// import { FormControlLabel, FormGroup } from "@mui/material";

// import { SleepSwitch } from "../SleepSwitch/SleepSwitch";
import { UserDevices } from "./UserDevices";
import { useUser } from "../../services/UserService";

export const Settings = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div>
        <h1>No user selected</h1>
      </div>
    );
  }

  return (
    <>
      <UserDevices user={user} />
      {/* <FormGroup>
        <FormControlLabel
          control={<SleepSwitch sx={{ m: 1 }} defaultChecked />}
          label="Sleep monitoring"
        />
      </FormGroup> */}
    </>
  );
};
