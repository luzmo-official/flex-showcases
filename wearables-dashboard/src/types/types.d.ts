export type DeviceType = "sleep" | "steps";

export interface UserDevice {
  name: string;
  type: DeviceType;
  intervalInSeconds: number;
}

export interface User {
  id: string;
  name: string;
  devices: UserDevice[];
}

export interface UserContextType {
  user: User | null;
  switchUser: (newUser: User) => void;
}
