const docusign = require("docusign-esign");
const { generateKey } = require("./generateAccessKey");
const fs = require("fs");

async function retrieveSignedDocument(envelopeId) {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);
  const result = await generateKey();
  dsApiClient.addDefaultHeader(
    "Authorization",
    `Bearer ${result.body.access_token}`
  );

  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  try {
    const documents = await envelopesApi.listDocuments(
      process.env.ACCOUNT_ID,
      envelopeId
    );

    console.log("Documents:", JSON.stringify(documents, null, 2));

    // Get the first document or the combined document if available
    const documentId = documents.envelopeDocuments[0].documentId;

    const pdfBytes = await envelopesApi.getDocument(
      process.env.ACCOUNT_ID,
      envelopeId,
      documentId
    );

    // Save or process the document as needed
    fs.writeFileSync(`signed_document_${envelopeId}.pdf`, pdfBytes);
    console.log(`Signed document saved for envelope ${envelopeId}`);

    return pdfBytes;
  } catch (error) {
    console.error("Error retrieving signed document:", error);
    throw error;
  }
}

module.exports = { retrieveSignedDocument };
