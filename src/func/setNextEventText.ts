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

const escapeHtml = (text: string) => {
  const template = {
    "<": "&lt;",
    ">": "&gt;",
  };
  const reg = new RegExp(`[${Object.keys(template).join("")}]`, "g");
  return text.replace(reg, (match) => template[match]);
};

const setNextEventText = ({ logger }: { logger: (log: string) => void }) => (
  calName: string,
  eventName: string,
  content: string
) => {
  const cal = CalendarApp.getCalendarsByName(calName)[0];
  if (!cal) {
    logger(`calendar[${cal}] not found in setNextEventText`);
    return;
  }
  const start = addToDate(new Date(), { date: 1 });
  const end = addToDate(new Date(), { month: 3 });
  const event = cal.getEvents(start, end, { search: eventName })[0];
  if (!event) {
    logger(`cannot find event ${eventName}`);
    return;
  }
  const text = `${escapeHtml(content)}`.replace(/\n/g, "<br>");
  event.setDescription(text);

  logger(
    `executed:setNextEventText(cal:${calName},eventName:${eventName},set content${content})`
  );
};

function testSetNextEventText() {
  // eslint-disable-next-line no-console
  const logger = (log: string) => console.log(log);
  setNextEventText({ logger })("定期予定", "テスト", "テスト1\nテスト2");
}

export { setNextEventText, testSetNextEventText };
