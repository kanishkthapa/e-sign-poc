const docusign = require("docusign-esign");
const fs = require("fs");
const path = require("path");

const getEnvelopesApi = (request) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);

  apiClient.addDefaultHeader(
    "Authorization",
    `Bearer ${request.session.access_token}`
  );
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  return envelopesApi;
};

module.exports = { getEnvelopesApi };
