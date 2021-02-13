import {
  EOF,
  takeTo,
  regexp,
  NL,
  of,
  between,
  anyOf,
  ParserLike,
} from "@ncukondo/parser-combinator-ts";
import type { Parser } from "@ncukondo/parser-combinator-ts";
import {
  combine,
  map,
  skip,
  assert,
  many,
  toObj,
  wrap,
  asSingleLine,
  fallback,
} from "@ncukondo/parser-combinator-ts/operators.js";

interface ScriptToken {
  type: "script";
  code: string;
  text: string;
}
interface KeyValueToken {
  type: "keyValue";
  key: string;
  value: string;
  text: string;
}
interface TextToken {
  type: "text";
  text: string;
}
type Token = ScriptToken | KeyValueToken | TextToken;

const trim = map((t: string) => t.trim());
const withRaw = map(<T extends Object>(value: T, { parsed }) => ({
  ...value,
  text: parsed() as string,
}));
const addType = <O extends Object, T extends string>(type: T) =>
  map((v: O) => ({ ...v, type }));
const toKeyValueToken = combine(
  toObj("key", "value"),
  addType("keyValue"),
  withRaw
);
const asALine = combine(wrap(/ */), asSingleLine);

const scriptStart = () => {
  const _ = / */;
  const with_ = (...a: ParserLike[]) => [...a.map((u) => [_, u]), _].flat();
  const types = anyOf(`"text/javascript"`, `'text/javascript'`);
  const content = of(" ", ...with_("type", "=", types)).to(fallback(""));
  return of(`<script`, content, ">").to(asALine);
};

const scriptToken = (): Parser<ScriptToken> => {
  const start = scriptStart();
  const endMark = of("</script>").to(asALine);
  const end = anyOf(endMark, EOF);
  const mapAsCode = map((code: string) => ({ code }));
  return between(start, end).to(mapAsCode, addType("script"), withRaw);
};

const keyValueBlockTitle = between("[", "]").to(asALine, trim);

const keyValueLineToken = () => {
  const unit = regexp(/[^\n=]+/);
  const key = unit.to(skip("="), trim);
  const value = unit.to(trim, skip(NL));
  return of(key, value).to(toKeyValueToken);
};

const stopTokens = [
  scriptStart,
  keyValueBlockTitle,
  keyValueLineToken(),
] as const;

const keyValueBlockToken = () => {
  const title = keyValueBlockTitle;
  const content = takeTo(...stopTokens).to(trim);
  return of(title, content).to(toKeyValueToken);
};

const textToken = () =>
  takeTo(EOF, ...stopTokens).to(
    assert((t) => t !== ""),
    map((text) => ({ text })),
    addType("text")
  );

const tokenize = (text: string) => {
  const parser = anyOf(
    scriptToken(),
    keyValueBlockToken(),
    keyValueLineToken(),
    textToken()
  ).to(many);
  return parser.tryParse(text) as Token[];
};

export {
  scriptStart,
  scriptToken,
  keyValueBlockToken,
  keyValueLineToken,
  keyValueBlockTitle,
  textToken,
  tokenize,
};
export type { TextToken, ScriptToken, KeyValueToken, Token };
