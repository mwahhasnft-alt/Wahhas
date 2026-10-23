
import { getEnv } from "../utils/env";

// 1. Read Raw Configuration
const RAW_CONFIG = {
  clientId: getEnv("AZURE_CLIENT_ID"),
  tenantId: getEnv("AZURE_TENANT_ID"),
  redirectUri: getEnv("AZURE_REDIRECT_URI", typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  apiUrl: getEnv("AZURE_API_URL"),
};

// 2. Validate
const isAzureEnabled = Boolean(RAW_CONFIG.clientId && RAW_CONFIG.tenantId);

// 3. Export Safe Object
export const azureConfig = {
  enabled: isAzureEnabled,
  useMock: !isAzureEnabled,
  auth: {
    clientId: RAW_CONFIG.clientId || "00000000-0000-0000-0000-000000000000",
    authority: `https://login.microsoftonline.com/${RAW_CONFIG.tenantId || "common"}`,
    redirectUri: RAW_CONFIG.redirectUri,
  },
  api: {
    baseUrl: RAW_CONFIG.apiUrl || "https://api.aqarai.com",
    scopes: [`api://${RAW_CONFIG.clientId}/access_as_user`]
  }
};

// MSAL Specific Config Object
export const msalConfig = {
  auth: {
    clientId: azureConfig.auth.clientId,
    authority: azureConfig.auth.authority,
    redirectUri: azureConfig.auth.redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "offline_access", ...azureConfig.api.scopes]
};
