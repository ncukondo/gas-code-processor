import { processCode as _processCode } from "./codeProcessor";
import type { ProcessCodeOption } from "./codeProcessor";
import { testAppendDoc as _testAppendDoc } from "./func/appendDoc";
import { testInc as _testInc } from "./func/inc";
import { testInsertToSheet as _testInsertToSheet } from "./func/insertToSheet";
import { testSaveLog as _testSaveLog } from "./func/saveLog";
import { makeArgs, makeParser } from "./parser";

export function testInsertToSheet() {
  _testInsertToSheet();
}

export function testInc() {
  _testInc();
}

export function testSaveLog() {
  _testSaveLog();
}

export function testAppendDoc() {
  _testAppendDoc();
}

export function testParser() {
  const now = new Date();
  const argsMaker = makeArgs({
    year: (i) => i.now.getFullYear(),
    month: (i) => i.now.getMonth() + 1,
    date: (i) => i.now.getDate().toString(),
    hour: (i) => i.now.getHours(),
    minute: (i) => i.now.getMinutes(),
  });

  const parser = makeParser({ argsMaker, now });
  // eslint-disable-next-line no-template-curly-in-string
  const text = "test - date: ${year}-${month}-${date}";
  // eslint-disable-next-line no-console
  console.log(parser(text));
}

export function testConsole() {
  // eslint-disable-next-line no-console
  console.log("test");
}

export function processCode(code: string, option: ProcessCodeOption = {}) {
  return _processCode(code, option);
}
