/* eslint-disable no-nested-ternary */
import SpreadsheetApp = GoogleAppsScript.Spreadsheet.SpreadsheetApp;

const getSheet = (sheetId: string) => {
  const [id, name] = sheetId.split("#");
  const spreadSheet = SpreadsheetApp.openById(id);
  if (!name) return spreadSheet.getActiveSheet();
  return spreadSheet.getSheetByName(name) || spreadSheet.insertSheet(name);
};

const getIndex = (keyValue: string[][], key: string) =>
  keyValue.findIndex(([keyInRow]) => keyInRow === key);

const getHeight = (keyValue: string[][]) => keyValue.length;

const getWidth = (keyValue: string[][]) =>
  getHeight(keyValue) > 0 ? keyValue[0].length : 0;

const get = (keyValue: string[][], key: string, defaultValue = "") => {
  const index = getIndex(keyValue, key);
  return index >= 0 ? keyValue[index][1] ?? defaultValue : defaultValue;
};

const set = (keyValue: string[][], key: string, value: string) => {
  const width = getWidth(keyValue);
  const newTable =
    width === 0
      ? [["", ""]]
      : width === 1
      ? keyValue.map(([cell]) => [cell, ""])
      : keyValue.map((row) => [...row]);
  const index = getIndex(keyValue, key);
  if (index >= 0) {
    newTable[index][1] = value;
    return newTable;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newRow = newTable[0].map((_) => "");
  newRow[0] = key;
  newRow[1] = value;
  return [newRow, ...newTable];
};

const inc = ({ logger }: { logger: (log: string) => void }) => (
  key: string,
  sheetId: string
) => {
  const sheet = getSheet(sheetId);
  const url = sheet.getParent().getUrl();
  const values = sheet.getDataRange().getValues() as string[][];
  const table =
    values.length > 0 && values[0].length >= 2 ? values : [["", ""]];
  const prevCount = Number(get(table, key, "0"));
  const nextCount = prevCount + 1;
  const newValues = set(values, key, String(nextCount));
  sheet
    .getRange(1, 1, getHeight(newValues), getWidth(newValues))
    .setValues(newValues);
  logger(
    `executed:inc(key:${key},sheetId:${sheetId},url:${url})->count:${prevCount}->${nextCount}`
  );
  return nextCount;
};

function testInc() {
  // eslint-disable-next-line no-console
  const logger = (log: string) => console.log(log);
  inc({ logger })(
    "func-Inc-test",
    "149U28oB8gp23N_4hHTTIDiBziQRIBmxHbPmT0bnbvEM#count"
  );
}

export { inc, testInc };
