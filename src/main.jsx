
import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SocialLogin } from "@capgo/capacitor-social-login";
import App from "./App.jsx";
import "./App.css";

async function bootstrap() {
  if (Capacitor.isNativePlatform()) {
    try {
      const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!webClientId) {
        throw new Error("VITE_GOOGLE_CLIENT_ID is missing.");
      }

      await SocialLogin.initialize({
        google: {
          webClientId,
        },
      });
    } catch (error) {
      console.error("Google native initialization failed:", error);
    }
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      >
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}

bootstrap();
