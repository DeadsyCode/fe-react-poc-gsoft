import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';
import { registerLicense } from '@syncfusion/ej2-base';
// Import i18n configuration
import './i18n/i18n';

// Registering Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmpCe0x0TXxbf1x1ZFBMYltbQHVPIiBoS35Rc0VnW3dfd3ddRWNbV013VEBU');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
