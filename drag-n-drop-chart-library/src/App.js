import * as React from "react";
import FlexComponent from "./Components/FlexComponent";
import RGL, { WidthProvider } from "react-grid-layout";
import ChartDrawer from "./Components/ChartDrawer";
import { Button, Box } from "@mui/material";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Userflow is only necessary for the Luzmo hosted showcases
import userflow from "userflow.js";
userflow.init("ct_65z5oczamna45bveai47cpcbpe");
userflow.identifyAnonymous();

export default function App() {
  const [open, setOpen] = React.useState(false);
  const [layout, setLayout] = React.useState([]);
  const [activeCharts, setActiveCharts] = React.useState([]);
  console.log("layout", layout);

  const ReactGridLayout = WidthProvider(RGL);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleClearCharts = () => {
    setActiveCharts([]);
    setLayout([]);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <div
        class="userflow-drag-n-drop"
        style={{
          maxWidth: "fit-content",
          marginInline: "auto",
        }}>
        <Button onClick={toggleDrawer(true)}>Add/Remove Charts</Button>
        <Button onClick={handleClearCharts}>Clear All Charts</Button>
        <ChartDrawer
          open={open}
          toggleDrawer={toggleDrawer}
          activeCharts={activeCharts}
          setActiveCharts={setActiveCharts}
          layout={layout}
          setLayout={setLayout}
        />
      </div>
      <ReactGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={(currentLayout) => setLayout(currentLayout)}
        cols={12}
        rowHeight={30}>
        {activeCharts.length > 0
          ? activeCharts.map((flexOptions) => {
              return (
                <FlexComponent
                  key={flexOptions.title}
                  flexOptions={flexOptions}
                />
              );
            })
          : null}
      </ReactGridLayout>
    </Box>
  );
}
