const docusign = require("docusign-esign");
const config = require("./config");
const envelopesApi = require("./docusignSetup");
const fs = require("fs");

async function retrieveSignedDocument(envelopeId) {
  try {
    const results = await envelopesApi.getDocument(
      config.DOCUSIGN_ACCOUNT_ID,
      envelopeId,
      "1"
    );
    const pdfBytes = Buffer.from(results, "base64");
    fs.writeFileSync("signed_document.pdf", pdfBytes);
    console.log("Signed document retrieved and saved as signed_document.pdf");
  } catch (error) {
    console.error("Error retrieving signed document:", error);
  }
}

module.exports = retrieveSignedDocument;
