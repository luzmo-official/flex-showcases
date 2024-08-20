import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import FlexConfig from "../Reference/FlexConfig";

export default function ChartDrawer({open, toggleDrawer, activeCharts, setActiveCharts}) {

    const handleChartClick = (chart) => { 
        const newActiveCharts = [ ...activeCharts ];
        const chartIndex = newActiveCharts.findIndex((activeChart) => activeChart.title === chart.title);
        if (chartIndex > -1) {
          newActiveCharts.splice(chartIndex, 1);
        } else {
          newActiveCharts.push(chart);
        }
        setActiveCharts(newActiveCharts);
    }

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {FlexConfig.filterList.map((filter) => (
          <ListItem
            key={filter.title}
            disablePadding
            onClick={() => handleChartClick(filter)}>
            <ListItemButton
              selected={
                activeCharts.findIndex(
                  (activeChart) => activeChart.title === filter.title
                ) > -1
              }>
              <ListItemText
                primary={filter.title}
                primaryTypographyProps={{
                  color: "primary",
                  fontWeight: "medium",
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {FlexConfig.chartList.map((chart) => (
          <ListItem
            key={chart.title}
            disablePadding
            onClick={() => handleChartClick(chart)}>
            <ListItemButton
              selected={
                activeCharts.findIndex(
                  (activeChart) => activeChart.title === chart.title
                ) > -1
              }>
              
              <ListItemText
                primary={chart.title}
                primaryTypographyProps={{
                  color: "primary",
                  fontWeight: "medium",
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
        <Drawer
            open={open}
            onClose={toggleDrawer(false)}
            >
        {DrawerList}
      </Drawer>
  );
}
