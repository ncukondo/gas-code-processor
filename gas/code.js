function test() {
  console.log("test");
  const cal = CalendarApp.getCalendarById(
    "gojhpijdj8p0be9nd2dsg05fl0@group.calendar.google.com"
  );
  const event = cal.getEvents(
    new Date(2021, 2 - 1, 12),
    new Date(2021, 2 - 1, 14)
  );
  console.log(event[0].getDescription());
}
