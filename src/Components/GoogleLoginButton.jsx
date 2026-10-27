import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../api/authApi";

function GoogleLoginButton({ setToken, setUser }) {
  const handleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error("Google credential was not received.");
      }

      console.log("Google credential received.");

      const data = await googleLogin(credentialResponse.credential);

      if (!data?.access_token || !data?.user) {
        throw new Error("Backend returned an invalid login response.");
      }

      // Save only after the backend confirms login.
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setToken(data.access_token);
    } catch (error) {
      console.error("Google Sign-In failed:", error);

      alert(
        `Google Sign-In failed: ${
          error?.message || "Unexpected error"
        }`
      );
    }
  };

  return (
    <div className="google-login-box">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          alert(
            "Google Sign-In failed. Check internet and Google OAuth configuration."
          );
        }}
        useOneTap={false}
      />
    </div>
  );
}

export default GoogleLoginButton;