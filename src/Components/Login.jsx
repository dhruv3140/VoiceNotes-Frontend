import Icon from "./Icon";
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
        <div className="auth-header">
          <span className="login-kicker">YOUR PERSONAL NOTEBOOK</span>
          <h2>Make room for your ideas.</h2>
          <p className="auth-subtitle">
            {loginMode === "password"
              ? "Sign in to capture a thought, or pick up where you left off."
              : "Login securely using a one-time password"}
          </p>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}

        {loginMode === "password" ? (
          <>
            <form onSubmit={handlePasswordLogin}>
              <input
                type="email"
                aria-label="Enter your email" placeholder="Enter your email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />

              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  aria-label="Enter your password" placeholder="Enter your password"
                  value={password}
                  minLength={6}
                  maxLength={72}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name="eye" size={18} />
                </button>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="auth-links">
              <button
                type="button"
                className="auth-link-btn"
                onClick={switchToForgotPassword}
              >
                Forgot Password?
              </button>

              <button
                type="button"
                className="auth-link-btn"
                onClick={switchToOtpLogin}
              >
                Login with OTP
              </button>
            </div>
          </>
        ) : (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <input
                  type="text"
                  aria-label="Enter email or mobile number" placeholder="Enter email or mobile number"
                  value={otpIdentifier}
                  onChange={(e) => setOtpIdentifier(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  aria-label="Enter OTP" placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  autoComplete="one-time-code"
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

            <div className="auth-links">
              <button
                type="button"
                className="auth-link-btn"
                onClick={switchToPasswordLogin}
              >
                Login with Password
              </button>
            </div>
          </>
        )}

        <GoogleLoginButton setToken={setToken} setUser={setUser} />

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" onClick={switchToRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;