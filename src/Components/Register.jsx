import { useState } from "react";
import {
  registerUser,
  verifyEmailOtp,
  sendMobileOtp,
  verifyMobileOtp,
} from "../api/authApi";
import GoogleLoginButton from "./GoogleLoginButton";

function Register({ switchToLogin, setToken, setUser }) {
  const [registerMode, setRegisterMode] = useState("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveLoginData = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (registerMode === "email") {
      if (!email.trim() || !password.trim()) {
        setError("Please enter name, email and password.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    } else {
      if (!mobile.trim()) {
        setError("Please enter mobile number.");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (registerMode === "email") {
        const data = await registerUser(name, email, password);

        setOtpSent(true);
        setMessage(data.message || "OTP sent to your email.");
      } else {
        const data = await sendMobileOtp(name, mobile);

        setOtpSent(true);
        setMessage(data.message || "OTP sent to your mobile.");
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
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
      setError("");
      setMessage("");

      let data;

      if (registerMode === "email") {
        data = await verifyEmailOtp(email, otp);
      } else {
        data = await verifyMobileOtp(mobile, otp);
      }

      saveLoginData(data);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const changeRegisterMode = (mode) => {
    if (otpSent || loading) return;

    setRegisterMode(mode);
    setError("");
    setMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create account</h2>

          <p className="auth-subtitle">
            {registerMode === "email"
              ? "Create your Smart Notes account"
              : "Create an account using your mobile number"}
          </p>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
            />

            {registerMode === "email" ? (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    minLength={6}
                    maxLength={72}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </>
            ) : (
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={loading}
                autoComplete="tel"
              />
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder={
                registerMode === "email"
                  ? "Enter email OTP"
                  : "Enter 6 digit OTP"
              }
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              autoComplete="one-time-code"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP & Continue"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={handleSendOtp}
              disabled={loading}
            >
              Resend OTP
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setMessage("");
                setError("");
              }}
              disabled={loading}
            >
              Change Details
            </button>
          </form>
        )}

        {!otpSent && (
          <div className="auth-links">
            <button
              type="button"
              className={`auth-link-btn ${
                registerMode === "email" ? "active-link" : ""
              }`}
              onClick={() => changeRegisterMode("email")}
            >
              Register with Email
            </button>

            <button
              type="button"
              className={`auth-link-btn ${
                registerMode === "mobile" ? "active-link" : ""
              }`}
              onClick={() => changeRegisterMode("mobile")}
            >
              Register with Mobile
            </button>
          </div>
        )}

        <GoogleLoginButton setToken={setToken} setUser={setUser} />

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={switchToLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;