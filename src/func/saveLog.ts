import DriveApp = GoogleAppsScript.Drive.DriveApp;

type OnEndFunc = (info: { text: string; log: ReadonlyArray<string> }) => void;
type OnEnd = (fn: OnEndFunc) => void;
interface Info {
  readonly text: string;
  readonly events: Readonly<{
    onEnd: OnEnd;
  }>;
  readonly logger: (log: string) => void;
}

const saveLog = ({ text, events: { onEnd }, logger }: Info) => (
  filename: string,
  folderId: string
) => {
  const file = DriveApp.getFolderById(folderId).createFile(filename, text);
  const url = file.getUrl();
  onEnd(({ text: textOnEnd, log }) => {
    const logText = log.join("\n");
    file.setContent(`${textOnEnd}\n\nLog\n${logText}`);
  });
  logger(`executed:saveLog(name:${filename},url:${url})`);
  return url;
};

function testSaveLog() {
  const logList: string[] = [];
  const onEndFuncs: OnEndFunc[] = [];
  const logger = (log: string) => {
    // eslint-disable-next-line no-console
    console.log(log);
    logList.push(log);
  };
  const onEnd: OnEnd = (fn) => {
    // eslint-disable-next-line no-console
    console.log(`onEnd added`);
    onEndFuncs.push(fn);
  };
  const text = "initialText";
  const url = saveLog({ logger, events: { onEnd }, text })(
    "testLog.txt",
    "1D2wNAAZeMxhVR4TeekIW2K9s9G_aSsa_"
  );
  // eslint-disable-next-line no-console
  console.log(`returned value(url)= ${url}`);
  onEndFuncs.forEach((fn) =>
    fn({
      text: `content coverted onEnd:@${new Date()}`,
      log: logList,
    })
  );
}

export { saveLog, testSaveLog };
