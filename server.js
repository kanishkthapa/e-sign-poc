const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const docusign = require("docusign-esign");
const { generateKey } = require("./generateAccessKey");
const fs = require("fs");
const session = require("express-session");
const { generatePdfBuffer } = require("./pdfGeneration");
const { generateUrlForSignature } = require("./generateUrlForSignature");
const { checkEnvelopeStatus } = require("./checkEnvelopeStatus");
const { retrieveSignedDocument } = require("./retrieveSignedDocument");

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  session({ secret: "someSecretKey", resave: true, saveUnitialized: true })
);

app.get("/", async (req, res) => {
  if (req.session.access_token && req.session.expires_at < Date.now()) {
    console.log("re-using the token", access_token);
  } else {
    const results = await generateKey();

    console.log("generated access token", results.body.access_token);

    req.session.access_token = results.body.access_token;

    req.session.expires_at = Date.now() - results.body.expires_in * 1000;
  }

  res.send("HI!");
});

let envelopeId;

app.get("/form", async (req, res) => {
  try {
    const token = await generateKey();
    const access_token = token.body.access_token;

    const pdfBuffer = await generatePdfBuffer();

    const recipientName = "Test Name";

    const result = await generateUrlForSignature(pdfBuffer, recipientName);

    if (!result || !result.url) {
      throw new Error("Failed to generate signing URL");
    }

    envelopeId = result.envelopeId;

    res.json({ url: result.url, envelopeId: result.envelopeId });
  } catch (error) {
    console.error("Error in /form route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/signing-complete", async (req, res) => {
  await checkEnvelopeStatus("eec1677b-4eed-4dfa-81ed-b44bdee859ad");
  res.send("Thanks for adding your signature");
});

app.listen(3000, () => {
  console.log("server listening on port 3000", process.env.USER_ID);
});
