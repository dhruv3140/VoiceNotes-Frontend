import { useState } from "react";
import { registerUser, verifyEmailOtp, sendMobileOtp, verifyMobileOtp } from "../api/authApi";
import GoogleLoginButton from "./GoogleLoginButton";

function Register({ switchToLogin, setToken, setUser }) {
  const [registerMode, setRegisterMode] = useState("email"); // email | mobile
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
        setMessage(data.message || "OTP sent to your mobile. Check backend console.");
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>

        <div className="auth-tab-switcher">
          <button
            type="button"
            className={`auth-tab-btn ${registerMode === "email" ? "active" : ""}`}
            onClick={() => {
              setRegisterMode("email");
              setError("");
              setMessage("");
            }}
            disabled={otpSent || loading}
          >
            Email Register
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${registerMode === "mobile" ? "active" : ""}`}
            onClick={() => {
              setRegisterMode("mobile");
              setError("");
              setMessage("");
            }}
            disabled={otpSent || loading}
          >
            Mobile Register
          </button>
        </div>

        <p className="auth-subtitle">
          {registerMode === "email"
            ? "Register with email verification"
            : "Register with mobile OTP verification"}
        </p>

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
            />

            {registerMode === "email" ? (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
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
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </>
            ) : (
              <input
                type="text"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={loading}
              />
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP & Register"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder={registerMode === "email" ? "Enter email OTP" : "Enter 6 digit OTP"}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
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

        <GoogleLoginButton setToken={setToken} setUser={setUser} />

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={switchToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;