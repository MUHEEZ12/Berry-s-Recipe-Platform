import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../utils/helpers";
import "./SignUp.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate password strength
  const isValidPassword = (password) => {
    return password && password.length >= 6;
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!form.name || !form.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email || !form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!isValidPassword(form.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirm) {
      newErrors.confirm = "Please confirm your password";
    } else if (form.password !== form.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    if (!form.agree) {
      newErrors.agree = "You must accept the Terms & Conditions";
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
      return;
    }

    try {
      setLoading(true);
      const result = await signup(form.email, form.password, form.name);
      if (result.ok) {
        showToast("✅ Account created successfully!", "success");
        navigate("/");
      } else {
        setApiError(result.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "An unexpected error occurred";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2>Create Account ✨</h2>
        <p>Join Berry's Recipe Community</p>

        {apiError && (
          <div className="auth-error">
            <span>⚠️ {apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              disabled={loading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={handleChange}
              className={errors.confirm ? "input-error" : ""}
              disabled={loading}
            />
            {errors.confirm && <span className="error-text">{errors.confirm}</span>}
          </div>

          <label className="terms" style={{ color: errors.agree ? "#ef4444" : "inherit" }}>
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              disabled={loading}
            />
            I agree to <Link to="/terms" target="_blank">Terms & Conditions</Link>
          </label>
          {errors.agree && <span className="error-text">{errors.agree}</span>}

          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? (
              <>
                <span className="spinner"></span> Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
