import { useEffect, useState } from "react";
import { sendMobileOtp, verifyMobileOtp, sendLoginOtp, verifyLoginOtp } from "../api/authApi";

function MobileLogin({ mode = "login", setToken, setUser, switchToLogin, switchToRegister }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();

    if (mode === "register" && !name.trim()) {
      setError("Please enter name");
      return;
    }
    if (!mobile.trim()) {
      setError("Please enter mobile number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (mode === "register") {
        await sendMobileOtp(name, mobile);
      } else {
        await sendLoginOtp(mobile);
      }

      setOtpSent(true);
      setTimer(30);
      setOtp("");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let data;
      if (mode === "register") {
        data = await verifyMobileOtp(mobile, otp);
      } else {
        data = await verifyLoginOtp(mobile, otp);
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
      >
        <h1>{mode === "register" ? "Mobile OTP Register" : "Mobile OTP Login"}</h1>
        <p>
          {mode === "register"
            ? "Register a new account using mobile OTP"
            : "Login using mobile OTP"}
        </p>

        {error && <div className="auth-error">{error}</div>}

        {!otpSent && (
          <>
            {mode === "register" && (
              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <input
              type="text"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </>
        )}

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter 6 digit OTP"
              value={otp}
              maxLength="6"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            <p className="otp-timer">
              {timer > 0
                ? `Resend OTP in ${timer}s`
                : "You can resend OTP now"}
            </p>

            <button
              type="button"
              className="resend-btn"
              disabled={timer > 0 || loading}
              onClick={handleSendOtp}
            >
              Resend OTP
            </button>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
        </button>

        <p className="auth-switch">
          Back to <span onClick={switchToLogin}>Login</span> or <span onClick={switchToRegister}>Register</span>
        </p>
      </form>
    </div>
  );
}

export default MobileLogin;