
import { PublicClientApplication } from "@azure/msal-browser";
import { azureConfig, msalConfig, loginRequest } from "../config/azureConfig";

// --- Safe MSAL Initialization ---
let msalInstance: PublicClientApplication;

try {
    msalInstance = new PublicClientApplication(msalConfig);
    if (!azureConfig.enabled) {
        console.log("[Auth] Azure disabled. MSAL initialized in offline mode.");
    }
} catch (e) {
    console.error("[Auth] MSAL Critical Failure:", e);
    // Fallback instance to preventing provider crash
    msalInstance = new PublicClientApplication({
        auth: { clientId: "dummy" }
    });
}

export { msalInstance };

// --- Safe API Client ---
export const api = {
  getToken: async (): Promise<string | null> => {
    if (!azureConfig.enabled) return null;
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) return null;
      const request = { ...loginRequest, account: accounts[0] };
      const response = await msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      console.warn("[Auth] Token acquisition failed:", error);
      return null;
    }
  },

  request: async (endpoint: string, options: RequestInit = {}) => {
    if (azureConfig.useMock) {
        return {
            ok: true,
            status: 200,
            json: async () => ({ status: 'success', mock: true })
        } as any;
    }
    return fetch(`${azureConfig.api.baseUrl}${endpoint}`, options);
  }
};
