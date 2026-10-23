
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MsalProvider } from '@azure/msal-react';
import { googleConfig } from './config/googleConfig';
import { msalInstance } from './services/api';
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
function Root() {
  const [admin,setAdmin] = React.useState(() => window.location.hash.startsWith('#/admin') || window.location.pathname === '/admin');
  React.useEffect(() => { const update=()=>setAdmin(window.location.hash.startsWith('#/admin') || window.location.pathname === '/admin'); window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update); },[]);
  return admin ? <React.Suspense fallback={<p dir="rtl">جاري فتح مساحة الإدارة…</p>}><AdminPanel /></React.Suspense> : <App />;
}

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
          <Root />
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
