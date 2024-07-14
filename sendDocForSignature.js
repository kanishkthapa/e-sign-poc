const docusign = require("docusign-esign");
const envelopesApi = require("./docusignSetup");
const config = require("./config");

async function sendDocumentForSignature(
  pdfBuffer,
  recipientEmail,
  recipientName,
  pageNumber,
  xPos,
  yPos
) {
  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = "Please sign this document";

  const document = new docusign.Document();
  document.documentBase64 = pdfBuffer.toString("base64");
  document.name = "Sample Document";
  document.fileExtension = "pdf";
  document.documentId = "1";

  envelopeDefinition.documents = [document];

  const signer = new docusign.Signer();
  signer.email = recipientEmail;
  signer.name = recipientName;
  signer.recipientId = "1";

  const signHere = new docusign.SignHere();
  signHere.documentId = "1";
  signHere.pageNumber = pageNumber; // Specify the page number
  signHere.recipientId = "1";
  signHere.tabLabel = "SignHereTab";
  signHere.xPosition = xPos; // Specify the x-coordinate
  signHere.yPosition = yPos; // Specify the y-coordinate

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

    // Set the URL where you want the recipient to be redirected once they finish signing
    viewRequest.returnUrl = "https://www.your-redirect-url.com";
    viewRequest.authenticationMethod = "email";
    viewRequest.email = recipientEmail;
    viewRequest.userName = recipientName;
    viewRequest.clientUserId = "1234"; // You can use any value here

    const recipientView = await envelopesApi.createRecipientView(
      config.DOCUSIGN_ACCOUNT_ID,
      envelopeId,
      { recipientViewRequest: viewRequest }
    );

    console.log(`Recipient view URL: ${recipientView.url}`);
    return recipientView.url;
  } catch (error) {
    console.error("Error creating envelope or recipient view:", error);
  }
}

module.exports = sendDocumentForSignature;
