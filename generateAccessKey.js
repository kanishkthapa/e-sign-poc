const docusign = require("docusign-esign");
const fs = require("fs");
const path = require("path");

const generateKey = async () => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);

  const results = await dsApiClient.requestJWTUserToken(
    process.env.INTEGRATION_KEY,
    process.env.USER_ID,
    "signature", // this is the scope for the auth key
    fs.readFileSync(path.join(__dirname, "private.key")),
    3600 // this is the lifespan of the key in seconds
  );

  return results;
};

module.exports = { generateKey };
