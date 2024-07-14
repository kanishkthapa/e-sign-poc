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
    const envelope = await envelopesApi.getEnvelope(
      process.env.ACCOUNT_ID,
      envelopeId
    );

    console.log("check envelope status here", envelope.status);

    if (envelope.status === "completed") {
      await retrieveSignedDocument(envelopeId);
    }
  } catch (error) {
    console.error("Error checking envelope status:", error);
  }
}

module.exports = { checkEnvelopeStatus };
