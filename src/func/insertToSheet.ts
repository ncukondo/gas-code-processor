import SpreadsheetApp = GoogleAppsScript.Spreadsheet.SpreadsheetApp;

const getSheet = (sheetId: string) => {
  const [id, name] = sheetId.split("#");
  const spreadSheet = SpreadsheetApp.openById(id);
  if (!name) return spreadSheet.getActiveSheet();
  return spreadSheet.getSheetByName(name) || spreadSheet.insertSheet(name);
};

const insertToSheet = ({ logger }: { logger: (log: string) => void }) => (
  sheetId: string,
  columns: Record<string, string>
) => {
  const sheet = getSheet(sheetId);
  const url = sheet.getParent().getUrl();
  const prevHeader = sheet.getDataRange().getValues()[0];
  const headerDif = Object.keys(columns).filter(
    (key) => !prevHeader.includes(key)
  );
  const header = prevHeader.concat(headerDif);
  const values = header.map((key) => (key in columns ? columns[key] : ""));
  sheet.insertRowAfter(1);
  sheet.getRange(1, 1, 2, values.length).setValues([header, values]);
  logger(
    `executed:insertToSheet(${sheetId},url:${url},${JSON.stringify(
      columns,
      null,
      2
    )}})`
  );
};

function testInsertToSheet() {
  // eslint-disable-next-line no-console
  const logger = (log: string) => console.log(log);
  insertToSheet({ logger })("149U28oB8gp23N_4hHTTIDiBziQRIBmxHbPmT0bnbvEM", {
    場所: "津島",
    回数: "2",
    できていること: "全部",
    できていないこと: "ない",
  });
}

export { insertToSheet, testInsertToSheet };
