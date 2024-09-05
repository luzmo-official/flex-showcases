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
const resizeHandles = ["s", "e", "se"];

export default function App() {
  const [open, setOpen] = React.useState(false);
  const [layout, setLayout] = React.useState([
    { i: "a", x: 0, y: 0, w: 1, h: 2, resizeHandles: resizeHandles },
    {
      i: "b",
      x: 1,
      y: 0,
      w: 3,
      h: 2,
      resizeHandles: resizeHandles,
    },
    { i: "c", x: 4, y: 0, w: 1, h: 2, resizeHandles: resizeHandles },
  ]);
  const [activeCharts, setActiveCharts] = React.useState(["a", "b", "c"]);

  const ReactGridLayout = WidthProvider(RGL);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleClearCharts = () => {
    setActiveCharts([]);
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
        />
      </div>
      <ReactGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={(currentLayout) => setLayout(currentLayout)}
        cols={12}
        rowHeight={30}>
        {activeCharts.map((item) => {
          return <div key={item}>{item}</div>;
        })}
        {activeCharts.length > 0
          ? activeCharts.map((flexOptions) => {
              return (
                <FlexComponent
                  key={flexOptions.type}
                  flexOptions={flexOptions}
                />
              );
            })
          : null}
      </ReactGridLayout>
    </Box>
  );
}
