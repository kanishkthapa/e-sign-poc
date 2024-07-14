const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("./config");

// Load the RSA private key from the environment variable or a file
let rsaKey;
if (process.env.PRIVATE_KEY) {
  console.log("HERE_HERE");
  rsaKey = process.env.PRIVATE_KEY;
}
// else {
//   // If not in environment variable, try to load from a file
//   const keyPath = path.join(__dirname, "private.key");
//   rsaKey = fs.readFileSync(keyPath, "utf8");
// }
console.log("HERE-1");

async function getAccessToken() {
  const jwtPayload = {
    iss: config.DOCUSIGN_INTEGRATION_KEY,
    sub: config.DOCUSIGN_USER_ID,
    aud: config.DOCUSIGN_BASE_URL,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const jwtOptions = {
    algorithm: "RS256",
    header: {
      typ: "JWT",
      alg: "RS256",
    },
  };

  try {
    const token = jwt.sign(jwtPayload, rsaKey, jwtOptions);

    console.log("check_here");
    const response = await axios.post(
      `${config.DOCUSIGN_BASE_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("check_jwt_token", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error obtaining access token:", error.message);
    throw error;
  }
}

module.exports = { getAccessToken };
