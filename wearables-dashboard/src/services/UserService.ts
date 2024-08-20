import { createContext, useContext } from "react";

import { User, UserContextType } from "../types/types";

// Create a User Context
export const UserContext = createContext<UserContextType>({
  user: null,
  switchUser: () => {},
} as UserContextType);

// Custom Hook to facilitate using the User Context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John",
    devices: [
      {
        name: "Fitsybitsy Tracker",
        type: "steps",
        intervalInSeconds: 60,
      },
      {
        name: "Auratic Ring",
        type: "sleep",
        intervalInSeconds: 30,
      },
    ],
  },
  {
    id: "2",
    name: "Emma",
    devices: [
      {
        name: "SteppingStones Tracker",
        type: "steps",
        intervalInSeconds: 600,
      },
      {
        name: "Sleeperings Band",
        type: "sleep",
        intervalInSeconds: 1800,
      },
    ],
  },
  {
    id: "3",
    name: "Tim",
    devices: [
      {
        name: "Fitterst Tracker",
        type: "steps",
        intervalInSeconds: 30,
      },
    ],
  },
  {
    id: "4",
    name: "Sarah",
    devices: [
      {
        name: "Fitsybitsy Tracker",
        type: "steps",
        intervalInSeconds: 300,
      },
    ],
  },
];
