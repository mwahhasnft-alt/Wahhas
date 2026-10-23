
import { getEnv } from "../utils/env";

const CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");

export const googleConfig = {
  enabled: Boolean(CLIENT_ID),
  clientId: CLIENT_ID || "mock_google_client_id_for_ui_rendering" 
};
