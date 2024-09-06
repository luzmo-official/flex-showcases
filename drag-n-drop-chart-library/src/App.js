import * as React from "react";
import FlexComponent from "./Components/FlexComponent";
import RGL, { WidthProvider } from "react-grid-layout";
import ChartDrawer from "./Components/ChartDrawer";
import { Button, Box } from "@mui/material";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import initialState from "./Reference/InitialState";

// Userflow is only necessary for the Luzmo hosted showcases
import userflow from "userflow.js";

userflow.init("ct_65z5oczamna45bveai47cpcbpe");
userflow.identifyAnonymous();

export default function App() {
  // initialize state
  const [open, setOpen] = React.useState(false);
  const [layout, setLayout] = React.useState(initialState.layout);
  const [activeCharts, setActiveCharts] = React.useState(
    initialState.activeCharts
  );
  // initialize RGL
  const ReactGridLayout = WidthProvider(RGL);

  // App functions
  const handleClearCharts = () => {
    setActiveCharts([]);
    setLayout([]);
  };

  const handleChartClick = (chart) => {
    const newActiveCharts = [...activeCharts];
    const newLayout = [...layout];
    const chartLayout = chart.layout;
    chartLayout.i = chart.title;
    const chartIndex = newActiveCharts.findIndex(
      (activeChart) => activeChart.title === chart.title
    );
    if (chartIndex > -1) {
      newActiveCharts.splice(chartIndex, 1);
    } else {
      newActiveCharts.push(chart);
    }
    const layoutIndex = newLayout.findIndex(
      (activeLayout) => activeLayout.i === chart.title
    );
    if (layoutIndex > -1) {
      newLayout.splice(layoutIndex, 1);
    } else {
      newLayout.push(chartLayout);
    }
    setActiveCharts(newActiveCharts);
    setLayout(newLayout);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <div
        class="userflow-drag-n-drop"
        style={{
          maxWidth: "fit-content",
          marginInline: "auto",
        }}>
        <Button onClick={toggleDrawer(!open)}>Add/Remove Charts</Button>
        <Button onClick={handleClearCharts}>Clear All Charts</Button>
        <ChartDrawer
          open={open}
          toggleDrawer={toggleDrawer}
          activeCharts={activeCharts}
          handleChartClick={handleChartClick}
        />
      </div>
      <ReactGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={(currentLayout) => setLayout(currentLayout)}
        cols={12}
        rowHeight={30}
        draggableHandle=".drag-handle"
        resizeHandles={["n", "ne", "e", "se", "s", "sw", "w"]}
        draggableCancel=".luzmo-viz-item">
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
