import DocumentApp = GoogleAppsScript.Document.DocumentApp;

const appendDoc = ({ logger }: { logger: (log: string) => void }) => (
  docId: string,
  content: string
) => {
  DocumentApp.openById(docId).getBody().editAsText().appendText(`\n${content}`);
  logger(`executed:appendDoc(${docId},${content})`);
};

const testAppendDoc = () => {
  // eslint-disable-next-line no-console
  const logger = (log: string) => console.log(log);
  appendDoc({ logger })(
    "1_mUOBrZCqIeYlexo2oae_EephKaFleT0RSPdYVdta5E",
    "appendTextTest"
  );
};

export { appendDoc, testAppendDoc };
