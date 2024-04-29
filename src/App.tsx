import { Scheduler } from "./lib";
import { EVENTS, RESOURCES, SERVICES } from "./events";
import { useRef } from "react";
import { Typography } from "@mui/material";
import ru from "date-fns/locale/ru";
import { useWindowResize } from "./lib/hooks/useWindowResize";
import { SchedulerRef } from "./lib/types";
import "./app.scss";

function App() {
  const calendarRef = useRef<SchedulerRef>(null);
  const windowSize = useWindowResize();

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
      services={SERVICES}
      resourceViewMode={windowSize.width < 900 ? "tabs" : "default"}
      hourFormat={"24"}
      locale={ru}
      day={{
        startHour: 7,
        endHour: 24,
        step: 15,
        headerShow: false,
        hourRenderer: hourRender,
      }}
      singleDayEditor={true}
      view={"day"}
      // navigation={false}
      // disableViewNavigator={true}
      // === DEBUG PROPS
      // events ={generateRandomEvents(200)}
      // fields={[{
      //   name: "clientName",
      //   type: "hidden",
      // }]}
    />
  );
}

export default App;
