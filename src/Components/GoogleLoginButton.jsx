import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../api/authApi";

function GoogleLoginButton({ setToken, setUser }) {
  const handleSuccess = async (credentialResponse) => {
    try {
      console.log("Google credential:", credentialResponse);

      if (!credentialResponse.credential) {
        alert("Google credential not received");
        return;
      }

      const data = await googleLogin(credentialResponse.credential);

      console.log("Backend google login response:", data);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error("Google login error:", error);
      alert(error.message || "Google login failed");
    }
  };

  return (
    <div className="google-login-box">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert("Google login failed")}
        useOneTap={false}
      />
    </div>
  );
}

export default GoogleLoginButton;