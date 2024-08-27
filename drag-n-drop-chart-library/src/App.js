import * as React from "react";
import flexConfig from "./Reference/FlexConfig";
import FlexComponent from "./Components/FlexComponent";
import { Rnd } from "react-rnd";
import ChartDrawer from "./Components/ChartDrawer";
import { Button, Box} from "@mui/material";

export default function App() {
  const [open, setOpen] = React.useState(false);
  const [activeCharts, setActiveCharts] = React.useState([]);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleClearCharts = () => {
    setActiveCharts([]);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <div
        style={{
          maxWidth: "fit-content",
          marginInline: "auto",
        }}>
        <Button onClick={toggleDrawer(true)}>Add Charts</Button>
        <Button onClick={handleClearCharts}>Clear Charts</Button>
        <ChartDrawer
          open={open}
          toggleDrawer={toggleDrawer}
          activeCharts={activeCharts}
          setActiveCharts={setActiveCharts}
        />
      </div>
      {activeCharts.length > 0
        ? activeCharts.map((flexOptions) => {
            return (
              <Rnd
                key={flexOptions.type}
                default={{
                  x: 150,
                  y: 205,
                  width: flexOptions.width || 500,
                  height: flexOptions.height || 200,
                }}
                minWidth={50}
                minHeight={50}
                bounds="window">
                <FlexComponent
                  flexOptions={flexOptions}
                />
              </Rnd>
            );
          })
        : null}
    </Box>
  );
}
