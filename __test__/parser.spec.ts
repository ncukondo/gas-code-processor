import { readFileSync } from "fs";
import path from "path";
import { makeEvent } from "../src/eventMaker";
import {
  makeParser,
  makeScriptProcessor,
  makeInlineScriptProcessor,
  makeArgs,
  makeArgItem,
} from "../src/parser";
import type { OnEndParam, ProcessInfo } from "../src/parser";

declare const test: jest.It;
declare const expect: jest.Expect;
declare const describe: jest.Describe;

const loggerMaker = () => {
  const logList: string[] = [];
  const logger = (log: string) => {
    logList.push(log);
  };
  return [logList, logger] as const;
};

const readTextFile = (filename: string) =>
  readFileSync(path.resolve(__dirname, filename), { encoding: "utf-8" });

const ref = makeArgItem((info) => (name: string) => info.keyValues[name]);
const mockArgMaker = makeArgs({
  test1: () => "testValue1",
  testFn: () => () => "testFn",
  logger: ({ logger }) => logger,
  ref: (info) => ref(info),
});
const mockInfo: ProcessInfo = {
  text: "mockInfotext",
  // eslint-disable-next-line no-console
  logger: (log: string) => log,
  keyValues: { mockKey1: "mockValue1", mockKey2: "mockValue2" },
  events: {
    onEnd: makeEvent<OnEndParam>(),
  } as const,
  now: new Date(2021, 1 - 1, 5, 11, 30),
};

// eslint-disable-next-line no-template-curly-in-string
const inlineCodeText = "var-${test1}-${ref('mockKey1')}-${fakeVariable}";

const inlineCodeTextResult =
  // eslint-disable-next-line no-template-curly-in-string
  "var-testValue1-mockValue1-${ReferenceError: fakeVariable is not defined}";

describe("ScriptProcessor", () => {
  const [logList, logger] = loggerMaker();

  const mockProcessCode = makeScriptProcessor(mockArgMaker, {
    ...mockInfo,
    logger,
  });
  test("makeScriptProcessor", () => {
    const result = { ...mockProcessCode(`logger(test1);`), log: logList };
    const extedted = {
      info: {
        ...mockInfo,
        logger,
        keyValues: { mockKey1: "mockValue1", mockKey2: "mockValue2" },
        text: "mockInfotext",
      },
      log: ["testValue1"],
      returnValue: undefined,
    };
    expect(result).toEqual(extedted);
  });
  const mockProcessInlineCode = makeInlineScriptProcessor(
    mockArgMaker,
    mockInfo
  );
  test("makeInlineCodeProcessor", () => {
    expect(mockProcessInlineCode(inlineCodeText)).toBe(inlineCodeTextResult);
  });
});

describe("Parser", () => {
  const now = new Date(2021, 1 - 1, 5, 11, 30);
  const parser = makeParser({ argsMaker: mockArgMaker, now });
  const parserTestText = readTextFile("./text/parserTest.txt");
  const parserTestResult = readTextFile("./text/parserTestResult.txt");

  test("parser.parseInlineCode", () => {
    expect(parser(inlineCodeText).text).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      "var-testValue1-undefined-${ReferenceError: fakeVariable is not defined}"
    );
  });
  test("parserTestText", () => {
    const { log, text } = parser(parserTestText);
    expect(`${text}\n${["\nlog:", ...log].join("\n")}`).toBe(parserTestResult);
  });
});
