const docusign = require("docusign-esign");
const { generateKey } = require("./generateAccessKey");

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
    const documents = await envelopesApi.getDocuments(
      process.env.ACCOUNT_ID,
      envelopeId
    );

    // Assuming you want the combined document
    const documentId = "combined";
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
  }
}

module.exports = { retrieveSignedDocument };
