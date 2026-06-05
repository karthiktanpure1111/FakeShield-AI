import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'

// Note: In production you should put your real Client ID in a .env file
// and use import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = "971732512315-88hpv1rqhebv3pfsisggtlst3divkvgg.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
