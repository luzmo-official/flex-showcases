import { useState, SyntheticEvent, useEffect } from "react";
import { Grid, Box, Tabs, Tab, Typography, Stack, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  FilterGroup,
  LuzmoVizItemComponent,
  VizItemOptions,
} from "@luzmo/react-embed";

import { useUser } from "../../services/UserService";

import { SleepTimeline } from "../SleepTimeline/SleepTimeline";

import { heattableOptions, heatTableSlots } from "./sleep/heatTableConsts";
import { areaChartOptions, areaChartSlots } from "./sleep/areaChartConsts";

import {
  calorieNumberWidgetOptions,
  getCaloriesNumberWidgetSlots,
} from "./steps/caloriesNumberWidgetConsts";
import {
  getHeightNumberWidgetSlots,
  heightNumberWidgetOptions,
} from "./steps/heightNumberWidgetConsts";
import {
  getStepNumberWidgetSlots,
  stepNumberWidgetOptions,
} from "./steps/stepsNumberWidgetConsts";
import {
  areaChartOptions as stepsAreaChartOptions,
  areaChartSlots as stepsAreaChartSlots,
} from "./steps/areaChartConsts";
import {
  circleGaugeOptions,
  circleGaugeSlots,
} from "./sleep/circleGaugeConsts";

import "./Analytics.css";
import {
  getSleepScoreLastNight,
  getStepsPerDay,
} from "../../services/DataService";

const LUZMO_VIZ_ITEM_SMALL_STYLE = { width: "100%", height: "10rem" };
const LUZMO_VIZ_ITEM_MEDIUM_STYLE = { width: "100%", height: "20rem" };
const LUZMO_VIZ_ITEM_LARGE_STYLE = { width: "100%", height: "40rem" };

const TEXTUAL_INSIGHTS_STYLE = {
  textAlign: "center",
  paddingY: "0.5rem",
  paddingX: "0.2rem",
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Analytics() {
  const { user } = useUser();
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [sleepScoreYesterday, setSleepScoreYesterday] = useState<
    number | undefined
  >(undefined);
  const [sleepScoreDayBefore, setSleepScoreDayBefore] = useState<
    number | undefined
  >(undefined);
  const [averageKcalBurned, setAverageKcalBurned] = useState<
    number | undefined
  >(undefined);
  const [stepsToday, setStepsToday] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    setSleepScoreYesterday(undefined);

    // Fetch sleep score from yesterday
    getSleepScoreLastNight(user.id).then((sleepScores) => {
      setSleepScoreYesterday(
        sleepScores.lastNightSleepScore > -1
          ? Math.round(sleepScores.lastNightSleepScore * 100)
          : -1
      );

      setSleepScoreDayBefore(
        sleepScores.previousNightSleepScore > -1
          ? Math.round(sleepScores.previousNightSleepScore * 100)
          : -1
      );
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setStepsToday(undefined);

    // Fetch number of steps per day
    getStepsPerDay(user.id).then((stepsPerDay) => {
      // Check if the first entry is from today & set the steps
      setStepsToday(
        stepsPerDay[0].date ===
          new Date(new Date().toISOString().split("T")[0]).toISOString()
          ? stepsPerDay[0].steps
          : 0
      );

      // Calculate the average steps per day to estimate the kcal burned
      const totalSteps = stepsPerDay.reduce(
        (acc, current) => acc + current.steps,
        0
      );

      setAverageKcalBurned(
        Math.round((totalSteps / stepsPerDay.length) * 0.04)
      );
    });
  }, [user]);

  const stepDevice = user
    ? user.devices.find((d) => d.type === "steps")
    : undefined;
  const sleepDevice = user
    ? user.devices.find((d) => d.type === "sleep")
    : undefined;

  const hasStepsData = stepDevice !== undefined;
  const hasSleepData = sleepDevice !== undefined;

  let stepDatetimeLevel = "day";

  if (stepDevice) {
    stepDatetimeLevel =
      stepDevice.intervalInSeconds > 1800
        ? "week"
        : stepDevice.intervalInSeconds > 60
        ? "day"
        : "hour";
  }

  const hourOfDay = new Date().getHours();
  const timeOfDay =
    hourOfDay > 6 && hourOfDay < 12
      ? "morning"
      : hourOfDay >= 12 && hourOfDay < 18
      ? "afternoon"
      : hourOfDay < 22
      ? "evening"
      : "night";

  const [defaultTab, setDefaultTab] = useState(1);

  // Create the necessary filters to filter to the user's data
  /*
   * NOTE:
   * This is a mock implementation, which performs the filtering on the client side.
   * In a real-world scenario, the filtering must be done server side in the Authorization request for security purposes!
   */
  const filtersToApply: FilterGroup[] = user
    ? [
        {
          condition: "and",
          filters: [
            // Steps filter on Patient ID column
            {
              expression: "? = ?",
              parameters: [
                {
                  column_id: "572740ed-aeed-4aeb-b318-d059e8be35a6",
                  dataset_id: "1c759996-74fd-438d-bcba-eb58838a5b03",
                },
                user.id,
              ],
            },
            // Sleep filter on Patient ID column
            {
              expression: "? = ?",
              parameters: [
                {
                  column_id: "695b3aee-6772-4aa6-bb50-a67a88bfc26b",
                  dataset_id: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
                },
                user.id,
              ],
            },
          ],
        },
      ]
    : [];

  const handleSleepTabChange = (_: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const applyTheme = (widgetOptions: VizItemOptions): VizItemOptions => {
    return {
      ...widgetOptions,
      theme: {
        font: {
          fontFamily: theme.typography.fontFamily,
        },
        mainColor: theme.palette.primary.main,
      },
    };
  };

  if (!hasSleepData && !hasStepsData) {
    return (
      <Grid item xs={12}>
        <Box padding={2}>
          <h2>No data available</h2>
        </Box>
      </Grid>
    );
  }

  return (
    <>
      {/* Create Luzmo number evolution widget with steps info */}
      {hasStepsData && (
        <Grid
          item
          sm={hasSleepData ? 9 : 12}
          xs={12}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              textAlign: "left",
              overflow: "auto",
            }}
          >
            <Typography variant="h4">
              Good {timeOfDay} {user?.name}!
            </Typography>
            <Stack
              direction="column"
              spacing={2}
              marginY={1}
              sx={{
                justifyContent: "flex-start",
                alignItems: "stretch",
              }}
            >
              {hasSleepData &&
                sleepScoreYesterday !== undefined &&
                sleepScoreYesterday !== -1 &&
                sleepScoreDayBefore !== undefined && (
                  <Paper elevation={2} sx={TEXTUAL_INSIGHTS_STYLE}>
                    Your sleep score was <strong>{sleepScoreYesterday}%</strong>{" "}
                    last night, which is{" "}
                    {sleepScoreDayBefore > sleepScoreYesterday
                      ? "less than"
                      : sleepScoreDayBefore < sleepScoreYesterday
                      ? "more than"
                      : "equal to"}{" "}
                    the night before (<i>{sleepScoreDayBefore}%</i>).
                  </Paper>
                )}
              {hasSleepData && sleepScoreYesterday === undefined && (
                <Paper elevation={2} sx={TEXTUAL_INSIGHTS_STYLE}>
                  Loading sleep insights...
                </Paper>
              )}
              {hasSleepData && sleepScoreYesterday === -1 && (
                <Paper elevation={2} sx={TEXTUAL_INSIGHTS_STYLE}>
                  No sleep insights yet for yesterday's night
                </Paper>
              )}
              {hasStepsData && stepsToday !== undefined && (
                <Paper elevation={2} sx={TEXTUAL_INSIGHTS_STYLE}>
                  Based on your walking history, you should have used about{" "}
                  <strong>{averageKcalBurned} kcal</strong> by the end of today
                  (<i>currently at {stepsToday} steps today</i>).
                </Paper>
              )}
              {hasStepsData && stepsToday === undefined && (
                <Paper elevation={2} sx={TEXTUAL_INSIGHTS_STYLE}>
                  Loading step insights...
                </Paper>
              )}
            </Stack>
          </Box>
          <Paper elevation={2} sx={{ flexGrow: 3 }}>
            <LuzmoVizItemComponent
              options={applyTheme(stepNumberWidgetOptions)}
              slots={getStepNumberWidgetSlots(stepDatetimeLevel)}
              type="evolution-number"
              contextId="evolution-number-steps-step"
              filters={filtersToApply}
            ></LuzmoVizItemComponent>
          </Paper>
        </Grid>
      )}
      {hasSleepData && (
        <>
          {/* Create Luzmo circular gauge widget with sleep info */}
          <Grid item sm={hasStepsData ? 3 : 12} xs={12}>
            <Paper elevation={2}>
              <LuzmoVizItemComponent
                options={applyTheme(circleGaugeOptions)}
                slots={circleGaugeSlots}
                type="circular-gauge"
                style={LUZMO_VIZ_ITEM_MEDIUM_STYLE}
                contextId="circle-gauge-sleep"
                filters={filtersToApply}
              ></LuzmoVizItemComponent>
            </Paper>
          </Grid>
          {/* Create sleep timeline */}
          <Grid item sm={4} xs={12}>
            <Paper
              elevation={2}
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <SleepTimeline
                selected={defaultTab}
                onSelectedChange={setDefaultTab}
              />
            </Paper>
          </Grid>
          {/* Create Luzmo sleep insights with custom tabs element */}

          <Grid item sm={8} xs={12}>
            <Paper elevation={2}>
              {defaultTab === 0 && (
                <LuzmoVizItemComponent
                  options={applyTheme(stepsAreaChartOptions)}
                  slots={stepsAreaChartSlots}
                  type="line-chart"
                  style={LUZMO_VIZ_ITEM_LARGE_STYLE}
                  contextId="line-chart-steps-movement-inner"
                  canFilter="all"
                  filters={filtersToApply}
                ></LuzmoVizItemComponent>
              )}
              {defaultTab === 1 && (
                <>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      value={value}
                      onChange={handleSleepTabChange}
                      aria-label="Chart type switch"
                    >
                      <Tab label="Sleep scores" />
                      <Tab label="Amount of sleep" />
                    </Tabs>
                  </Box>
                  <CustomTabPanel value={value} index={0}>
                    <Paper elevation={2}>
                      <LuzmoVizItemComponent
                        options={applyTheme(heattableOptions)}
                        slots={heatTableSlots}
                        type="heat-table"
                        style={LUZMO_VIZ_ITEM_LARGE_STYLE}
                        contextId="heat-table-sleep"
                        filters={filtersToApply}
                      ></LuzmoVizItemComponent>
                    </Paper>
                  </CustomTabPanel>
                  <CustomTabPanel value={value} index={1}>
                    <Paper elevation={2}>
                      <LuzmoVizItemComponent
                        options={applyTheme(areaChartOptions)}
                        slots={areaChartSlots}
                        type="area-chart"
                        style={LUZMO_VIZ_ITEM_LARGE_STYLE}
                        contextId="area-chart-sleep"
                        canFilter="all"
                        filters={filtersToApply}
                      ></LuzmoVizItemComponent>
                    </Paper>
                  </CustomTabPanel>
                </>
              )}
            </Paper>
          </Grid>
        </>
      )}
      {/* Create Luzmo number evolution widgets & line chart with steps info */}
      {hasStepsData && (
        <>
          <Grid item sm={6} xs={12}>
            <Paper elevation={2}>
              <LuzmoVizItemComponent
                options={applyTheme(calorieNumberWidgetOptions)}
                slots={getCaloriesNumberWidgetSlots(stepDatetimeLevel)}
                type="evolution-number"
                style={LUZMO_VIZ_ITEM_SMALL_STYLE}
                contextId="evolution-number-steps-calories"
                filters={filtersToApply}
              ></LuzmoVizItemComponent>
            </Paper>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Paper elevation={2}>
              <LuzmoVizItemComponent
                options={applyTheme(heightNumberWidgetOptions)}
                slots={getHeightNumberWidgetSlots(stepDatetimeLevel)}
                type="evolution-number"
                style={LUZMO_VIZ_ITEM_SMALL_STYLE}
                contextId="evolution-number-steps-height"
                filters={filtersToApply}
              ></LuzmoVizItemComponent>
            </Paper>
          </Grid>
          {!hasSleepData && (
            <Grid item sm={12} xs={12}>
              <Paper elevation={2}>
                <LuzmoVizItemComponent
                  options={applyTheme(stepsAreaChartOptions)}
                  slots={stepsAreaChartSlots}
                  type="line-chart"
                  style={LUZMO_VIZ_ITEM_LARGE_STYLE}
                  contextId="line-chart-steps-movement-bottom"
                  canFilter="all"
                  filters={filtersToApply}
                ></LuzmoVizItemComponent>
              </Paper>
            </Grid>
          )}
        </>
      )}
    </>
  );
}
