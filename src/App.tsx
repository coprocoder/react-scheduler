import { Scheduler } from "./lib";
import { EVENTS, RESOURCES } from "./events";
import { useRef } from "react";
import { Typography } from "@mui/material";
import { SchedulerRef } from "./lib/types";
import "./app.scss";

function App() {
  const calendarRef = useRef<SchedulerRef>(null);
  const hourRender = (hour: string) => {
    const minutes = +(hour.slice(-2) || "");
    if ([15, 45].includes(minutes)) return <div></div>;
    return minutes % 60 ? (
      <Typography variant="caption" color={"gray"}>
        {minutes}
      </Typography>
    ) : (
      <Typography variant="caption">{hour}</Typography>
    );
  };

  return (
    <Scheduler
      ref={calendarRef}
      events={EVENTS}
      resources={RESOURCES}
      // resourceViewMode={"tabs"}
      hourFormat={"24"}
      day={{
        startHour: 7,
        endHour: 24,
        step: 15,
        headerShow: false,
        hourRenderer: hourRender,
      }}
      view={"day"}
      navigation={false}
      disableViewNavigator={true}
      // events ={generateRandomEvents(200)}
    />
  );
}

export default App;
