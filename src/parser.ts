import {
  EOF,
  map,
  Parser,
  between,
  pipe,
  seq,
  takeTo,
} from "@ncukondo/parser-combinator-ts";
import {
  flatDeep,
  join,
  many,
  plus,
} from "@ncukondo/parser-combinator-ts/operators";
import { makeEvent } from "./eventMaker";
import type { Eventemitter } from "./eventMaker";
import { tokenize } from "./tokenizer";
import type { KeyValueToken, ScriptToken, TextToken, Token } from "./tokenizer";

interface Logger {
  (log: string): void;
}

type OnEndParam = {
  readonly text: string;
  readonly log: ReadonlyArray<string>;
};
type OnEnd = Eventemitter<OnEndParam>;
interface ProcessInfo {
  readonly text: string;
  readonly logger: Logger;
  readonly keyValues: { [key: string]: string };
  readonly now: Date;
  readonly events: Readonly<{
    onEnd: OnEnd;
  }>;
}

type ArgsMakerInfo = ProcessInfo;
type ArgsMaker = (info: ArgsMakerInfo) => Record<string, unknown>;
const makeArgItem = <T>(fn: (info: ArgsMakerInfo) => T) => fn;
const makeArgs = <T extends Record<string, (i: ArgsMakerInfo) => unknown>>(
  maker: T
) => (info: ArgsMakerInfo) =>
  Object.fromEntries(
    Object.entries(maker).map(([key, fn]) => [key, fn(info)] as const)
  ) as { [K in keyof T]: ReturnType<T[K]> };

const loggerMaker = () => {
  const logList: string[] = [];
  const logger = (log: string) => {
    logList.push(log);
  };
  return [logList, logger] as const;
};

const makeScriptProcessor = (argsMaker: ArgsMaker, info: ProcessInfo) => (
  code: string
) => {
  const args = argsMaker({ ...info });
  // eslint-disable-next-line no-new-func
  const processorCode = new Function(...Object.keys(args), code);
  const returnValue = processorCode(...Object.values(args));
  return { info, returnValue };
};

const stripe = <A, B>(a: Parser<A>, b: Parser<B>) =>
  pipe(a, plus(many(seq(b, a))), flatDeep);

const makeInlineScriptProcessor = (argsMaker: ArgsMaker, info: ProcessInfo) => (
  text: string
) => {
  const processCode = makeScriptProcessor(argsMaker, info);
  const processInlineCode = map((inlineCode: string) => {
    try {
      const { returnValue } = processCode(`return (${inlineCode})`);
      return `${returnValue}`;
    } catch (e) {
      return `\${${`${e}`}}`;
    }
  });
  const inlineCode = between("${", "}").to(processInlineCode);
  const plainText = takeTo(EOF, inlineCode);
  const parser = stripe(plainText, inlineCode).to(join());
  return parser.tryParse(text);
};

const processTextToken = (
  argsMaker: ArgsMaker,
  info: ProcessInfo,
  token: TextToken
) => {
  const processInlineCode = makeInlineScriptProcessor(argsMaker, info);
  const text = processInlineCode(token.text);
  return { ...info, text: info.text + text };
};

const processKeyValueToken = (
  argsMaker: ArgsMaker,
  info: ProcessInfo,
  token: KeyValueToken
) => {
  const processInlineScript = makeInlineScriptProcessor(argsMaker, info);
  const text = processInlineScript(token.text);
  const value = processInlineScript(token.value);
  const keyValues = { ...info.keyValues, [token.key]: value };
  return { ...info, keyValues, text: info.text + text };
};

const processScriptToken = (
  argsMaker: ArgsMaker,
  info: ProcessInfo,
  token: ScriptToken
) => {
  const processScript = makeScriptProcessor(argsMaker, info);
  const { info: newInfo } = processScript(token.code);
  return { ...newInfo, text: info.text + token.text };
};

const makeParserOptionDefault = {
  argsMaker: (() => ({})) as ArgsMaker,
  now: new Date(),
  keyValues: {} as Record<string, string>,
};
type MakeParserOption = Partial<typeof makeParserOptionDefault>;

const makeParser = (option: MakeParserOption = {}) => (text: string) => {
  const opt = { ...makeParserOptionDefault, ...option };
  const { argsMaker } = opt;
  const onEnd: OnEnd = makeEvent<OnEndParam>();
  const [log, logger] = loggerMaker();
  const initInfo: ProcessInfo = {
    ...opt,
    text: "",
    logger,
    events: {
      onEnd,
    },
  };
  const tokens = tokenize(text);
  const processToken = (info: ProcessInfo, token: Token) => {
    switch (token.type) {
      case "script":
        return processScriptToken(argsMaker, info, token);
      case "keyValue":
        return processKeyValueToken(argsMaker, info, token);
      default:
        return processTextToken(argsMaker, info, token);
    }
  };
  const finalInfo = tokens.reduce(processToken, initInfo);
  onEnd.emit({ log, ...finalInfo });
  return { text: finalInfo.text, log };
};

export {
  makeParser,
  makeScriptProcessor,
  makeInlineScriptProcessor,
  makeArgs,
  makeArgItem,
};
export type { Logger, ProcessInfo, ArgsMakerInfo, OnEndParam, ArgsMaker };
