const fs = require("fs");
const path = require("path");
const envelopesApi = require("./docusignSetup");
const config = require("./config");

async function downloadSignedDocument(envelopeId) {
  try {
    const results = await envelopesApi.getDocument(
      config.DOCUSIGN_ACCOUNT_ID,
      envelopeId,
      "1"
    );
    fs.writeFileSync(
      path.join(__dirname, "signed_document.pdf"),
      Buffer.from(results, "binary")
    );
    console.log("Signed document downloaded successfully.");
  } catch (error) {
    console.error("Error downloading signed document:", error);
  }
}

module.exports = downloadSignedDocument;
