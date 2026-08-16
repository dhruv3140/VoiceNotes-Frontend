import { useState } from "react";
import {
  loginWithPassword,
  sendLoginOtp,
  verifyLoginOtp,
} from "../api/authApi";
import GoogleLoginButton from "./GoogleLoginButton";

function Login({
  setToken,
  setUser,
  switchToRegister,
  switchToForgotPassword,
}) {
  const [loginMode, setLoginMode] = useState("password"); 
  // password | otp

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);


  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const saveLoginData = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);
  };

  const resetMessages = () => {
    setError("");
    setMessage("");
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    if (!identifier.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      resetMessages();

      const data = await loginWithPassword(identifier, password);
      saveLoginData(data);
    } catch (err) {
      setError(err.message || "Password login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!otpIdentifier.trim()) {
      setError("Please enter email or mobile number.");
      return;
    }

    try {
      setLoading(true);
      resetMessages();

      const data = await sendLoginOtp(otpIdentifier);

      setOtpSent(true);
      setMessage(data.message || "OTP sent successfully.");
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Please enter OTP.");
      return;
    }

    try {
      setLoading(true);
      resetMessages();

      const data = await verifyLoginOtp(otpIdentifier, otp);
      saveLoginData(data);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchToOtpLogin = () => {
    setLoginMode("otp");
    setIdentifier("");
    setPassword("");
    setOtpIdentifier("");
    setOtp("");
    setOtpSent(false);
    resetMessages();
  };

  const switchToPasswordLogin = () => {
    setLoginMode("password");
    setIdentifier("");
    setPassword("");
    setOtpIdentifier("");
    setOtp("");
    setOtpSent(false);
    resetMessages();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        {loginMode === "password" && (
          <>
            <p className="auth-subtitle">Login with email and password</p>

            <form onSubmit={handlePasswordLogin}>
              <input
                              type="text"
                              placeholder="Enter email"
                              value={identifier}
                              onChange={(e) => setIdentifier(e.target.value)}
                              disabled={loading}
                            />

              <div className="password-input-wrapper">
                <input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter password"
                                  value={password}
                                  minLength={6}
                                  maxLength={72}
                                  onChange={(e) => setPassword(e.target.value)}
                                  disabled={loading}
                                />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="auth-switch">
                          <span onClick={switchToForgotPassword}>Forgot Password?</span>
            </p>

            <p className="auth-switch">
                          <span onClick={switchToOtpLogin}>Login with OTP</span>
            </p>
          </>
        )}

        {loginMode === "otp" && (
          <>
            <p className="auth-subtitle">Login with OTP</p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <input
                                  type="text"
                                  placeholder="Enter email or mobile number"
                                  value={otpIdentifier}
                                  onChange={(e) => setOtpIdentifier(e.target.value)}
                                  disabled={loading}
                                />

                <button type="submit" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <input
                                  type="text"
                                  placeholder="Enter OTP"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  disabled={loading}
                                />

                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP & Login"}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </form>
            )}

            <p className="auth-switch">
              <span onClick={switchToPasswordLogin}>Login with Password</span>
            </p>
          </>
        )}

        <GoogleLoginButton setToken={setToken} setUser={setUser} />

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
                  <span onClick={switchToRegister}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;