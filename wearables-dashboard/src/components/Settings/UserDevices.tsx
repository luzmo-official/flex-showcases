import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Divider,
} from "@mui/material";

import { User } from "../../types/types";

// Helper function to format interval
const formatInterval = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = "";
  if (hours > 0) {
    result += `${hours}hr `;
  }
  if (minutes > 0) {
    result += `${minutes}min `;
  }
  if (remainingSeconds > 0) {
    result += `${remainingSeconds}sec`;
  }

  // Trim any trailing space
  return result.trim();
};

export const UserDevices = ({ user }: { user: User }) => {
  return (
    <Card sx={{ maxWidth: 400, margin: "auto", mt: 5 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {user.name}'s Devices
        </Typography>
        <Divider />
        <List
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Devices
            </ListSubheader>
          }
        >
          {user.devices.map((device, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={device.name}
                secondary={`Type: ${device.type} - Interval: ${formatInterval(
                  device.intervalInSeconds
                )}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
