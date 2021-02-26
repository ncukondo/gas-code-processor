import DocumentApp = GoogleAppsScript.Document.DocumentApp;

const appendDoc = ({ logger }: { logger: (log: string) => void }) => (
  docId: string,
  content: string
) => {
  const doc = DocumentApp.openById(docId);
  doc.getBody().editAsText().appendText(`\n${content}`);
  logger(
    `executed:appendDoc(id:${docId},content:${content},url${doc.getUrl()})`
  );
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
