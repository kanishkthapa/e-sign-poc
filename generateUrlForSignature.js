const { generateKey } = require("./generateAccessKey");
const docusign = require("docusign-esign");

async function generateUrlForSignature(pdfBuffer, recipientName) {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);

  const result = await generateKey();
  dsApiClient.addDefaultHeader(
    "Authorization",
    `Bearer ${result.body.access_token}`
  );

  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  const envelopeDefinition = new docusign.EnvelopeDefinition();

  envelopeDefinition.emailSubject = "Please sign your policy";

  const document = new docusign.Document();
  document.documentBase64 = pdfBuffer.toString("base64");
  document.name = "Policy Document";
  document.fileExtension = "pdf";
  document.documentId = "1";

  envelopeDefinition.documents = [document];

  const signer = new docusign.Signer();
  signer.name = recipientName;
  signer.recipientId = "1";
  signer.clientUserId = Math.random(); // This can be any unique identifier
  signer.email = `${recipientName
    .replace(/\s+/g, "")
    .toLowerCase()}@example.com`;

  const signHere1 = new docusign.SignHere();
  signHere1.documentId = "1";
  signHere1.pageNumber = "2";
  signHere1.recipientId = "1";
  signHere1.tabLabel = "SignHereTab1";
  signHere1.xPosition = "50";
  signHere1.yPosition = "750";

  const signHere2 = new docusign.SignHere();
  signHere2.documentId = "1";
  signHere2.pageNumber = "20";
  signHere2.recipientId = "1";
  signHere2.tabLabel = "SignHereTab2";
  signHere2.xPosition = "50";
  signHere2.yPosition = "750";

  signer.tabs = new docusign.Tabs();
  signer.tabs.signHereTabs = [signHere1, signHere2];

  envelopeDefinition.recipients = new docusign.Recipients();
  envelopeDefinition.recipients.signers = [signer];

  envelopeDefinition.status = "sent";

  try {
    console.log("envelope definition check", envelopeDefinition);

    const results = await envelopesApi.createEnvelope(process.env.ACCOUNT_ID, {
      envelopeDefinition,
    });
    const envelopeId = results.envelopeId;
    console.log(`Envelope created with ID: ${envelopeId}`);

    // Create Recipient View
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = process.env.REDIRECT_URL;
    viewRequest.authenticationMethod = "none";
    viewRequest.email = signer.email; // Use a dummy email
    viewRequest.userName = recipientName;
    viewRequest.clientUserId = signer.clientUserId; // Must match the clientUserId in the envelope

    const recipientView = await envelopesApi.createRecipientView(
      process.env.ACCOUNT_ID,
      envelopeId,
      { recipientViewRequest: viewRequest }
    );

    console.log(`Recipient view URL: ${recipientView.url}`);
    return { url: recipientView.url, envelopeId };
  } catch (error) {
    // console.error("Error creating envelope or recipient view:", error);
    if (error.response && error.response.body) {
      console.error(
        "API Error Details:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
    throw error;
  }
}

module.exports = { generateUrlForSignature };
