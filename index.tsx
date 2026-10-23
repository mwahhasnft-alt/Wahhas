
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MsalProvider } from '@azure/msal-react';
import { googleConfig } from './config/googleConfig';
import { msalInstance } from './services/api';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// MSAL v3+ requires async initialization
const renderApp = () => {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <GoogleOAuthProvider clientId={googleConfig.clientId}>
          <App />
        </GoogleOAuthProvider>
      </MsalProvider>
    </React.StrictMode>
  );
};

// Initialize MSAL and render
msalInstance.initialize()
  .then(() => {
    renderApp();
  })
  .catch((error) => {
    console.warn("MSAL Initialization failed, rendering app with limited auth capabilities.", error);
    // Proceed to render even if MSAL init fails, to allow Google Auth or Guest mode to work.
    renderApp();
  });
