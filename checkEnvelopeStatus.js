const docusign = require("docusign-esign");
const { generateKey } = require("./generateAccessKey");
const { retrieveSignedDocument } = require("./retrieveSignedDocument");

async function checkEnvelopeStatus(envelopeId) {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);
  const result = await generateKey();
  dsApiClient.addDefaultHeader(
    "Authorization",
    `Bearer ${result.body.access_token}`
  );

  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  try {
    // Get envelope details
    const envelope = await envelopesApi.getEnvelope(
      process.env.ACCOUNT_ID,
      envelopeId,
      null
    );
    console.log("Envelope status:", envelope.status);
    console.log("Envelope details:", JSON.stringify(envelope, null, 2));

    // Get recipient details
    const recipients = await envelopesApi.listRecipients(
      process.env.ACCOUNT_ID,
      envelopeId
    );
    console.log("Recipients details:", JSON.stringify(recipients, null, 2));

    // Get document details
    const documents = await envelopesApi.listDocuments(
      process.env.ACCOUNT_ID,
      envelopeId
    );
    console.log("Documents details:", JSON.stringify(documents, null, 2));

    // Check if all recipients have signed
    const allSigned = recipients.signers.every(
      (signer) => signer.status === "completed"
    );
    console.log("All recipients signed:", allSigned);

    if (allSigned || envelope.status === "completed") {
      console.log("Attempting to retrieve signed document...");
      await retrieveSignedDocument(envelopeId);
    }
  } catch (error) {
    console.error("Error checking envelope status:", error);
    if (error.response && error.response.body) {
      console.error(
        "API Error Details:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
  }
}

module.exports = { checkEnvelopeStatus };
