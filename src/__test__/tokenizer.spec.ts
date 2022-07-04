import {
  scriptToken,
  keyValueBlockToken,
  keyValueLineToken,
  tokenize,
  keyValueBlockTitle,
  textToken,
  scriptStart,
} from "../tokenizer";

declare const test: jest.It;
declare const expect: jest.Expect;
declare const describe: jest.Describe;

const onlyScriptText = `<script type="text/javascript">
const {textSections,info} = _import_Objects();
</script>
`;
const onlyScriptNoTailText = `<script type="text/javascript">
const {textSections,info} = _import_Objects();
`;
const onlyScriptExpected = {
  expect: "",
  index: 89,
  ok: true,
  value: {
    type: "script",
    code: "const {textSections,info} = _import_Objects();\n",
    text: onlyScriptText,
  },
};
const onlyKeyValueBlockText = `[  title1  ]
content1   
<script type="text/javascript">
`;
const onlyKeyValueBlockExpected = {
  text: `[  title1  ]
content1   
`,
  key: "title1",
  value: "content1",
  type: "keyValue",
};
const tokenizeText = `

[  title1  ]
content1
key1=value1   
[  title2  ]
content2   
<script>
console.log()
</script>
key2=value2   
`;

describe("tokenizer", () => {
  test("scriptToken", () => {
    expect(scriptToken().parse(onlyScriptText)).toEqual(onlyScriptExpected);
  });
  test("scriptStart match to script header", () => {
    const head1 = `<script type="text/javascript">`;
    expect(scriptStart().parse(head1).ok).toBeTruthy();
    const head2 = `<script>`;
    expect(scriptStart().parse(head2).ok).toBeTruthy();
  });
  test("scriptTokenNoTail", () => {
    expect(scriptToken().parse(onlyScriptNoTailText)).toEqual({
      ...onlyScriptExpected,
      index: 79,
      value: { ...onlyScriptExpected.value, text: onlyScriptNoTailText },
    });
  });
  test("textToken stopby keyValueLine", () => {
    expect(
      textToken()
        .tryParse(
          `text1text2
      key=Value
    `
        )
        .text.trim()
    ).toBe("text1text2");
  });
  test("textToken stopby script", () => {
    expect(
      textToken()
        .tryParse(
          `text1text2
      <script type="text/javascript">
    `
        )
        .text.trim()
    ).toBe("text1text2");
  });
  test("textToken stopby keyValueBlockTitle", () => {
    expect(
      textToken()
        .tryParse(
          `text1text2
      [blockTitle]
    `
        )
        .text.trim()
    ).toBe("text1text2");
  });
  test("keyValueBlockTitle", () => {
    expect(keyValueBlockTitle.tryParse(onlyKeyValueBlockText)).toBe("title1");
    expect(keyValueBlockTitle.parse(onlyKeyValueBlockText).index).toBe(13);
  });
  test("keyValueBlockToken", () => {
    expect(keyValueBlockToken().tryParse(onlyKeyValueBlockText)).toEqual(
      onlyKeyValueBlockExpected
    );
  });
  test("keyValueLineToken", () => {
    expect(
      keyValueLineToken().tryParse(`key1=value1
    key2=value2`)
    ).toEqual({
      key: "key1",
      value: "value1",
      type: "keyValue",
      text: "key1=value1\n",
    });
  });
});
describe("tokenize", () => {
  const tokens = tokenize(tokenizeText);
  test("sum of toke.text should be fullText", () => {
    expect(tokens.reduce((text, token) => text + token.text, "")).toBe(
      tokenizeText
    );
  });
  test("check types of output", () => {
    expect(
      tokens
        .reduce((arr, token) => [...arr, token.type], [] as string[])
        .join(",")
    ).toBe("text,keyValue,keyValue,keyValue,script,keyValue");
  });
});
