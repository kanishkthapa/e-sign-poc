const docusign = require("docusign-esign");
const config = require("./config");
const envelopesApi = require("./docusignSetup");
const { getAccessToken } = require("./generateAccessToken");

async function sendDocumentForSignature(pdfBuffer, recipientName) {
  const accessToken = await getAccessToken();

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(config.DOCUSIGN_BASE_URL);
  apiClient.addDefaultHeader("Authorization", `Bearer ${accessToken}`);
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = "Please sign this document";

  const document = new docusign.Document();
  document.documentBase64 = pdfBuffer.toString("base64");
  document.name = "Sample Document";
  document.fileExtension = "pdf";
  document.documentId = "1";

  envelopeDefinition.documents = [document];

  const signer = new docusign.Signer();
  signer.name = recipientName;
  signer.recipientId = "1";
  signer.clientUserId = "1234"; // Unique identifier for the recipient

  const signHere = new docusign.SignHere();
  signHere.documentId = "1";
  signHere.pageNumber = "1"; // Specify the 7th page
  signHere.recipientId = "1";
  signHere.tabLabel = "SignHereTab";
  signHere.xPosition = "50"; // Specify the x-coordinate (bottom left)
  signHere.yPosition = "750"; // Specify the y-coordinate (bottom left)

  signer.tabs = new docusign.Tabs();
  signer.tabs.signHereTabs = [signHere];

  envelopeDefinition.recipients = new docusign.Recipients();
  envelopeDefinition.recipients.signers = [signer];

  envelopeDefinition.status = "sent";

  try {
    const results = await envelopesApi.createEnvelope(
      config.DOCUSIGN_ACCOUNT_ID,
      { envelopeDefinition }
    );
    const envelopeId = results.envelopeId;
    console.log(`Envelope created with ID: ${envelopeId}`);

    // Create Recipient View
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = "http://localhost:3000/";
    viewRequest.authenticationMethod = "none";
    viewRequest.email = "placeholder@example.com"; // Placeholder email
    viewRequest.userName = recipientName;
    viewRequest.clientUserId = "1234";

    const recipientView = await envelopesApi.createRecipientView(
      config.DOCUSIGN_ACCOUNT_ID,
      envelopeId,
      { recipientViewRequest: viewRequest }
    );

    console.log(`Recipient view URL: ${recipientView.url}`);
    return { url: recipientView.url, envelopeId };
  } catch (error) {
    console.error("Error creating envelope or recipient view:", error);
  }
}

module.exports = sendDocumentForSignature;
