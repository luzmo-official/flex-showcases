import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import FlexConfig from "../Reference/FlexConfig";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function ChartDrawer({
  open,
  toggleDrawer,
  activeCharts,
  handleChartClick,
}) {
  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
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
    <Drawer open={open} variant="persistent" onClose={toggleDrawer(false)}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
        <IconButton onClick={toggleDrawer(false)}>
          <ChevronLeftIcon color="secondary" />
        </IconButton>
      </div>
      {DrawerList}
    </Drawer>
  );
}
