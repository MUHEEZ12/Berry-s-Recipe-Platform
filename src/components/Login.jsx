import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { showToast } from "../utils/helpers";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate form before submission
  function validateForm() {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    setErrors({});

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Please fix the errors below", "error");
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      if (result.ok) {
        showToast("✅ Login successful!", "success");
        navigate("/");
      } else {
        setApiError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "An unexpected error occurred";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>
        <p>Login to Berry’s Recipe Platform</p>

        {apiError && (
          <div className="auth-error">
            <span>⚠️ {apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email && !isValidEmail(email)) {
                  setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
                } else {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={errors.email ? "input-error" : ""}
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "input-error" : ""}
              disabled={loading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? (
              <>
                <span className="spinner"></span> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span className="auth-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
