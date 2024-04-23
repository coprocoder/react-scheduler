import { ProcessedEvent } from "./lib/types";

export const EVENTS: ProcessedEvent[] = [
  {
    event_id: 1,
    title: "Event 1 (Disabled)",
    start: new Date(new Date(new Date(new Date().setHours(9)).setMinutes(0)).setSeconds(0)),
    end: new Date(new Date(new Date(new Date().setHours(10)).setMinutes(0)).setSeconds(0)),
    disabled: true,
    user_id: 1,
  },
  {
    event_id: 2,
    title: "Event 2",
    start: new Date(new Date(new Date(new Date().setHours(10)).setMinutes(0)).setSeconds(0)),
    end: new Date(new Date(new Date(new Date().setHours(11)).setMinutes(15)).setSeconds(0)),
    user_id: 3,
    color: "#50b500",
    editable: false,
    deletable: false,
    agendaAvatar: "E",
  },
  {
    event_id: 3,
    title: "Event 3",
    start: new Date(new Date(new Date(new Date().setHours(11)).setMinutes(0)).setSeconds(0)),
    end: new Date(new Date(new Date(new Date().setHours(12)).setMinutes(0)).setSeconds(0)),
    user_id: [2, 4],
    deletable: false,
  },
  {
    event_id: 4,
    title: "Event 4",
    start: new Date(new Date(new Date(new Date().setHours(13)).setMinutes(0)).setSeconds(0)),
    end: new Date(new Date(new Date(new Date().setHours(14)).setMinutes(0)).setSeconds(0)),
    user_id: [1, 3],
  },
  {
    event_id: 5,
    title: "Event 4",
    start: new Date(
      new Date(
        new Date(new Date(new Date().setHours(9)).setMinutes(30)).setDate(new Date().getDate() - 2)
      ).setSeconds(0)
    ),
    end: new Date(
      new Date(
        new Date(new Date(new Date().setHours(11)).setMinutes(0)).setDate(new Date().getDate() - 2)
      ).setSeconds(0)
    ),
    user_id: [2, 3],
    color: "#900000",
    allDay: true,
  },
  {
    event_id: 6,
    title: "Event 6",
    start: new Date(
      new Date(
        new Date(new Date(new Date().setHours(20)).setMinutes(30)).setDate(new Date().getDate() - 3)
      ).setSeconds(0)
    ),
    end: new Date(new Date(new Date(new Date().setHours(23)).setMinutes(0)).setSeconds(0)),
    user_id: 2,
    allDay: true,
    sx: { color: "purple" },
  },
  {
    event_id: 7,
    title: "Event 7 (Not draggable)",
    start: new Date(
      new Date(
        new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(new Date().getDate() - 3)
      ).setSeconds(0)
    ),
    end: new Date(
      new Date(
        new Date(new Date(new Date().setHours(14)).setMinutes(30)).setDate(new Date().getDate() - 3)
      ).setSeconds(0)
    ),
    user_id: 1,
    draggable: false,
    color: "#8000cc",
  },
  {
    event_id: 8,
    title: "Event 8",
    start: new Date(
      new Date(
        new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
          new Date().getDate() + 30
        )
      ).setSeconds(0)
    ),
    end: new Date(
      new Date(
        new Date(new Date(new Date().setHours(14)).setMinutes(30)).setDate(
          new Date().getDate() + 30
        )
      ).setSeconds(0)
    ),
    user_id: 1,
    color: "#8000cc",
  },
];

export const RESOURCES = [
  {
    user_id: 1,
    text: "User One",
    subtext: "Sales Manager 1",
    avatar: "",
    color: "#ab2d2d",
  },
  {
    user_id: 2,
    text: "Two is very long name",
    subtext: "Sales Manager 2",
    avatar: "https://cs14.pikabu.ru/avatars/1021/x1021816-1788094303.png",
    color: "#439417",
  },
  {
    user_id: 3,
    text: "User Three",
    subtext: "Sales Manager Three",
    avatar: "https://cs14.pikabu.ru/avatars/3400/x3400884-1273444445.png",
    color: "#a001a2",
  },
  {
    user_id: 4,
    text: "User Four",
    subtext: "Sales Manager Four",
    avatar: "https://cs13.pikabu.ru/avatars/658/x658267-1013849002.png",
    color: "#0078c4",
  },
];

export const generateRandomEvents = (total = 300) => {
  const events = [];
  for (let i = 0; i < total; i++) {
    const day = Math.round(i % 15);
    events.push({
      event_id: Math.random(),
      title: "Event " + (i + 1),
      start: new Date(
        new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
          new Date().getDate() + day
        )
      ),
      end: new Date(
        new Date(new Date(new Date().setHours(14)).setMinutes(0)).setDate(
          new Date().getDate() + day
        )
      ),
      // allDay: Math.random() > 0.5,
    });
  }

  return events;
};
