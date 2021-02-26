import { appendDoc } from "./func/appendDoc";
import { inc } from "./func/inc";
import { insertToSheet } from "./func/insertToSheet";
import { prependToNextEvent } from "./func/prependToNextEvent";
import { saveLog } from "./func/saveLog";
import { makeArgItem, makeArgs, makeParser } from "./parser";
import type { ArgsMaker } from "./parser";

const get = makeArgItem((info) => (name: string) => info.keyValues[name]);
const importVars = makeArgItem((info) => () => ({ ...info.keyValues }));
const importFuncs = makeArgItem((info) => () =>
  makeArgs({
    inc,
    appendDoc,
    insertToSheet,
    saveLog,
    get,
    prependToNextEvent,
  } as const)(info)
);

const args = (additionalArgs: ArgsMaker) =>
  makeArgs({
    get,
    importVars,
    importFuncs,
    ...additionalArgs,
  });

const dateToObj = (dt: Date) => ({
  year: dt.getFullYear().toString(),
  month: (dt.getMonth() + 1).toString(),
  date: dt.getDate().toString().toString(),
  hour: dt.getHours().toString(),
  minute: dt.getMinutes().toString(),
});
const defaultOption = {
  now: new Date(),
  argsMaker: makeArgs({}),
  keyValues: {} as Record<string, string>,
};
type ProcessCodeOption = Partial<typeof defaultOption>;

const processCode = (code: string, option: ProcessCodeOption = {}) => {
  const opt = { ...defaultOption, ...option };
  const keyValues = { ...dateToObj(opt.now), ...opt.keyValues };
  const parser = makeParser({
    ...opt,
    keyValues,
    argsMaker: args(opt.argsMaker),
  });
  return parser(code);
};

export { processCode };
export type { ProcessCodeOption };
