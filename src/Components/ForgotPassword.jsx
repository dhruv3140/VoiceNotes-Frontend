import { useEffect, useState } from "react";
import { forgotPassword, resetPassword } from "../api/authApi";

function ForgotPassword({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    if (!email.trim()) {
      setError("Please enter email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await forgotPassword(email);

      setOtpSent(true);
      setTimer(30);
      setOtp("");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (otp.length !== 6 || !newPassword.trim()) {
      setError("Please enter OTP and new password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await resetPassword(email, otp, newPassword);

      alert("Password reset successful. Please login.");
      switchToLogin();
    } catch (err) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={otpSent ? handleResetPassword : handleSendOtp}
      >
        <h1>Forgot Password</h1>
        <p>Reset password using Email OTP</p>

        {error && <div className="auth-error">{error}</div>}

        <input
          type="email"
          placeholder="Enter registered email"
          value={email}
          disabled={otpSent}
          onChange={(e) => setEmail(e.target.value)}
        />

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter 6 digit OTP"
              value={otp}
              maxLength="6"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                minLength={6}
                maxLength={72}
                onChange={(e) => setNewPassword(e.target.value)}
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
          {loading ? "Please wait..." : otpSent ? "Reset Password" : "Send OTP"}
        </button>

        <p className="auth-switch">
          Back to <span onClick={switchToLogin}>Login</span>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;