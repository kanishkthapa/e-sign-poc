const docusign = require("docusign-esign");

async function forceRetrieveDocument(envelopeId) {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);
  const result = await generateKey();
  dsApiClient.addDefaultHeader(
    "Authorization",
    `Bearer ${result.body.access_token}`
  );

  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  try {
    const recipients = await envelopesApi.listRecipients(
      process.env.ACCOUNT_ID,
      envelopeId
    );
    const allSigned = recipients.signers.every(
      (signer) => signer.status === "completed"
    );

    if (allSigned) {
      console.log("All recipients have signed. Forcing document retrieval...");
      await retrieveSignedDocument(envelopeId);
      return true;
    } else {
      console.log("Not all recipients have signed yet.");
      return false;
    }
  } catch (error) {
    console.error("Error in forceRetrieveDocument:", error);
    return false;
  }
}

module.exports = { forceRetrieveDocument };
