const docusign = require("docusign-esign");
const config = require("./config");
const envelopesApi = require("./docusignSetup");

async function checkEnvelopeStatus(envelopeId) {
  try {
    const results = await envelopesApi.getEnvelope(
      config.DOCUSIGN_ACCOUNT_ID,
      envelopeId
    );
    return results.status;
  } catch (error) {
    console.error("Error checking envelope status:", error);
  }
}

module.exports = checkEnvelopeStatus;
