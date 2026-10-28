
import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../api/authApi";

function GoogleLoginButton({ setToken, setUser }) {
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const completeLogin = async (idToken) => {
    if (!idToken) {
      throw new Error("Google ID token nahi mila.");
    }

    const data = await googleLogin(idToken);

    if (!data?.access_token || !data?.user) {
      throw new Error("Backend ne valid login response nahi diya.");
    }

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);
  };

  const handleNativeLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const result = await SocialLogin.login({
        provider: "google",
        options: {
          scopes: ["email", "profile"],
        },
      });

      await completeLogin(result.result?.idToken);
    } catch (error) {
      console.error("Native Google login failed:", error);
      alert(error?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWebSuccess = async (response) => {
    setLoading(true);

    try {
      await completeLogin(response.credential);
    } catch (error) {
      console.error("Web Google login failed:", error);
      alert(error?.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isNative) {
    return (
      <div className="google-login-box">
        <button
          type="button"
          onClick={handleNativeLogin}
          disabled={loading}
          className="google-native-button"
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    );
  }

  return (
    <div className="google-login-box">
      <GoogleLogin
        onSuccess={handleWebSuccess}
        onError={() => alert("Google login failed. Please try again.")}
        useOneTap={false}
      />
    </div>
  );
}

export default GoogleLoginButton;