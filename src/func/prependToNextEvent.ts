// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CalenarApp = GoogleAppsScript.Calendar.CalendarApp;

const deltaDefault = { year: 0, month: 0, date: 0 };
const addToDate = (src: Date, delta?: Partial<typeof deltaDefault>) => {
  const d = delta ? { ...deltaDefault, ...delta } : { ...deltaDefault };
  return new Date(
    src.getFullYear() + d.year,
    src.getMonth() + d.month,
    src.getDate() + d.date
  );
};

const prependToNextEvent = ({ logger }: { logger: (log: string) => void }) => (
  calName: string,
  eventName: string,
  content: string
) => {
  const cal = CalendarApp.getCalendarsByName(calName)[0];
  if (!cal) {
    logger(`calendar[${cal}] not found in appendToNexEvent`);
    return;
  }
  const start = addToDate(new Date(), { date: 1 });
  const end = addToDate(new Date(), { month: 3 });
  const event = cal.getEvents(start, end, { search: eventName })[0];
  if (!event) {
    logger(`cannot find event ${eventName}`);
    return;
  }
  const text =
    `${encodeURIComponent(content)}\n`.replace(/\n/g, "<br>") +
    event.getDescription();
  event.setDescription(text);

  logger(
    `executed:prependToNextEvent(cal:${calName},eventName:${eventName},prepend content${content})`
  );
};

function testPrependToNextEvent() {
  // eslint-disable-next-line no-console
  const logger = (log: string) => console.log(log);
  prependToNextEvent({ logger })("定期予定", "テスト", "テスト1\nテスト2");
}

export { prependToNextEvent, testPrependToNextEvent };
