import DriveApp = GoogleAppsScript.Drive.DriveApp;

interface Info {
  readonly logger: (log: string) => void;
}

const loadText = ({ logger }: Info) => (id: string) => {
  const file = DriveApp.getFileById(id);
  if (!file) {
    logger(`cannot find file ${id} in loadText`);
    return;
  }
  // eslint-disable-next-line consistent-return
  return file.getBlob().getDataAsString();
};

function testLoadText() {
  const logger = (log: string) => {
    // eslint-disable-next-line no-console
    console.log(log);
  };
  // eslint-disable-next-line no-console
  console.log(loadText({ logger })("1wJPL_uvIX8PCNpUzFuZcSaoEb95gY8Vt"));
}

export { loadText, testLoadText };
