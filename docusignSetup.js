const docusign = require("docusign-esign");
const config = require("./config");

const apiClient = new docusign.ApiClient();
apiClient.setBasePath(config.DOCUSIGN_BASE_URL);
apiClient.addDefaultHeader("Authorization", "Bearer " + config.ACCESS_TOKEN);

const envelopesApi = new docusign.EnvelopesApi(apiClient);

module.exports = envelopesApi;
