const puppeteer = require("puppeteer");
const sendDocumentForSignature = require("./sendDocumentForSignature");
const checkEnvelopeStatus = require("./checkEnvelopeStatus");
const retrieveSignedDocument = require("./retrieveSignedDocument");

async function generatePdfBuffer() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent("<h1>Hello, World!</h1>"); // Replace with your HTML content
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();
  return pdfBuffer;
}

(async () => {
  const pdfBuffer = await generatePdfBuffer();
  const recipientName = "Recipient Name";

  const signingUrl = await sendDocumentForSignature(pdfBuffer, recipientName);

  if (signingUrl) {
    console.log(
      `Recipient can sign the document using this URL: ${signingUrl}`
    );
    // Open the signing URL in your UI for the user to sign

    // After the user signs, check the envelope status
    const envelopeId = "YOUR_ENVELOPE_ID"; // You need to store the envelope ID returned by sendDocumentForSignature
    let status = await checkEnvelopeStatus(envelopeId);

    // Poll the envelope status until it is 'completed'
    while (status !== "completed") {
      console.log("Envelope status:", status);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
      status = await checkEnvelopeStatus(envelopeId);
    }

    console.log("Document signed!");
    await retrieveSignedDocument(envelopeId);
  }
})();
