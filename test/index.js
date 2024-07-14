require("dotenv").config();

const puppeteer = require("puppeteer");
const sendDocumentForSignature = require("./sendDocumentForSignature");
const checkEnvelopeStatus = require("./checkEnvelopeStatus");
const retrieveSignedDocument = require("./retrieveSignedDocument");

// function to generate the PDF buffer
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

  const { url: signingUrl, envelopeId } = await sendDocumentForSignature(
    pdfBuffer,
    recipientName
  );

  if (signingUrl) {
    console.log(
      `Recipient can sign the document using this URL: ${signingUrl}`
    );
    // Open the signing URL in your UI for the user to sign

    let status = await checkEnvelopeStatus(envelopeId);

    while (status !== "completed") {
      console.log("Envelope status:", status);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      status = await checkEnvelopeStatus(envelopeId);
    }

    console.log("Document signed!");
    await retrieveSignedDocument(envelopeId);
  }
})();
