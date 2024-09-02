// import * as React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineDot,
} from "@mui/lab";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import HotelIcon from "@mui/icons-material/Hotel";
import RepeatIcon from "@mui/icons-material/Repeat";
import Typography from "@mui/material/Typography";

const TIMELINE_ITEM_SX = {
  height: "25%",
};

const TIMELINE_CONTENT_SX = { py: "12px", px: 2, alignSelf: "center" };

type SLEEP_TIMELINE_PROPS = {
  selected: number;
  onSelectedChange: (newSelected: number) => void;
};

export function SleepTimeline({
  selected,
  onSelectedChange,
}: SLEEP_TIMELINE_PROPS) {
  return (
    <Timeline position="alternate" sx={{ height: "100%" }}>
      <TimelineItem sx={TIMELINE_ITEM_SX}>
        <TimelineOppositeContent
          sx={{ m: "auto 0" }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          9:30 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector
            sx={{ bgcolor: selected === 0 ? "primary.main" : undefined }}
          />
          <TimelineDot
            color="primary"
            variant={selected === 0 ? "filled" : "outlined"}
            onClick={() => onSelectedChange(0)}
            sx={{ cursor: selected === 0 ? "default" : "pointer" }}
          >
            <FastfoodIcon />
          </TimelineDot>
          <TimelineConnector
            sx={{ bgcolor: selected === 0 ? "primary.main" : undefined }}
          />
        </TimelineSeparator>
        <TimelineContent sx={TIMELINE_CONTENT_SX} color="text.secondary">
          <Typography variant="h6" component="span">
            Eat
          </Typography>
          <Typography>Because you need strength</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem sx={TIMELINE_ITEM_SX}>
        <TimelineOppositeContent
          sx={{ m: "auto 0" }}
          variant="body2"
          color="text.secondary"
        >
          10:00 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot>
            <LaptopMacIcon />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={TIMELINE_CONTENT_SX} color="text.secondary">
          <Typography variant="h6" component="span">
            Code
          </Typography>
          <Typography>Because it&apos;s awesome!</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem sx={TIMELINE_ITEM_SX}>
        <TimelineSeparator>
          <TimelineConnector
            sx={{ bgcolor: selected === 1 ? "primary.main" : undefined }}
          />
          <TimelineDot
            color="primary"
            variant={selected === 1 ? "filled" : "outlined"}
            onClick={() => onSelectedChange(1)}
            sx={{ cursor: selected === 1 ? "default" : "pointer" }}
          >
            <HotelIcon />
          </TimelineDot>
          <TimelineConnector
            sx={{ bgcolor: selected === 1 ? "primary.main" : undefined }}
          />
        </TimelineSeparator>
        <TimelineContent sx={TIMELINE_CONTENT_SX}>
          <Typography variant="h6" component="span">
            Sleep
          </Typography>
          <Typography>Because you need rest</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem sx={TIMELINE_ITEM_SX}>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot>
            <RepeatIcon />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={TIMELINE_CONTENT_SX} color="text.secondary">
          <Typography variant="h6" component="span">
            Repeat
          </Typography>
          <Typography>Because this is the life you love!</Typography>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
