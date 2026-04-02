import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useSettings } from "../Context/SettingsContext";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/helpers";
import "./Settings.css";

function Settings() {
  const { user, logout } = useAuth();
  const { settings, toggleDarkMode, toggleEmailNotifications, toggleRecipeNotifications, togglePrivateProfile } = useSettings();
  const navigate = useNavigate();

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password Change State
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Profile Edit
  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }

    try {
      setLoading(true);
      // In a real app, this would call the backend API to update the profile
      showToast("✅ Profile updated successfully!", "success");
      setEditingProfile(false);
      // Refresh user data would happen here
    } catch (error) {
      showToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);
      // In a real app, call backend API to change password
      showToast("✅ Password changed successfully!", "success");
      setChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showToast("Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete your account? This cannot be undone. All your recipes and data will be permanently deleted."
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      // Call backend to delete account
      showToast("❌ Account deleted successfully", "error");
      logout();
      navigate("/");
    } catch (error) {
      showToast("Failed to delete account", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Theme Toggle
  const handleThemeToggle = () => {
    toggleDarkMode();
    showToast(settings.darkMode ? "☀️ Light mode enabled" : "🌙 Dark mode enabled", "success");
  };

  // Handle Settings Change
  const handleEmailNotifications = () => {
    toggleEmailNotifications();
    showToast("📧 Email notifications updated!", "success");
  };

  const handleRecipeNotifications = () => {
    toggleRecipeNotifications();
    showToast("🍳 Recipe notifications updated!", "success");
  };

  const handlePrivateProfile = () => {
    togglePrivateProfile();
    showToast("🔐 Privacy settings updated!", "success");
  };

  return (
    <div className="settings-container">
      <h1>⚙️ Settings</h1>

      {/* Account Information */}
      <div className="settings-section">
        <h2>👤 Account Information</h2>
        <div className="account-info">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Account Created:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="settings-section">
        <h2>Edit Profile</h2>
        {!editingProfile ? (
          <button className="primary-btn" onClick={() => setEditingProfile(true)}>
            ✏️ Edit Profile
          </button>
        ) : (
          <form onSubmit={handleEditProfile} className="form-group">
            <div className="form-input">
              <label>Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="form-input">
              <label>Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Your email"
                disabled
              />
            </div>
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditingProfile(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="settings-section">
        <h2>🔒 Change Password</h2>
        {!changingPassword ? (
          <button className="primary-btn" onClick={() => setChangingPassword(true)}>
            🔑 Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="form-group">
            <div className="form-input">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
              />
            </div>
            <div className="form-input">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="At least 6 characters"
              />
            </div>
            <div className="form-input">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Re-enter new password"
              />
            </div>
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Changing..." : "✅ Change Password"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setChangingPassword(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="settings-section">
        <h2>🔔 Notification Preferences</h2>
        <div className="toggle-item">
          <div>
            <span className="label">Email Notifications</span>
            <p className="description">Receive email updates on your activities</p>
          </div>
          <input
            type="checkbox"
            className="toggle-switch"
            checked={settings.emailNotifications}
            onChange={handleEmailNotifications}
          />
        </div>
        <div className="toggle-item">
          <div>
            <span className="label">Recipe Notifications</span>
            <p className="description">Get notified when someone likes your recipe</p>
          </div>
          <input
            type="checkbox"
            className="toggle-switch"
            checked={settings.recipeNotifications}
            onChange={handleRecipeNotifications}
          />
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="settings-section">
        <h2>🔐 Privacy & Security</h2>
        <div className="toggle-item">
          <div>
            <span className="label">Private Profile</span>
            <p className="description">Only you can see your recipes and profile</p>
          </div>
          <input
            type="checkbox"
            className="toggle-switch"
            checked={settings.privateProfile}
            onChange={handlePrivateProfile}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h2>🎨 Appearance</h2>
        <div className="toggle-item">
          <div>
            <span className="label">Dark Mode</span>
            <p className="description">Switch to dark theme</p>
          </div>
          <input
            type="checkbox"
            className="toggle-switch"
            checked={settings.darkMode}
            onChange={handleThemeToggle}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <h2>⚠️ Danger Zone</h2>
        <div className="danger-buttons">
          <button className="logout-btn" onClick={() => {
            logout();
            navigate("/");
            showToast("👋 Logged out successfully", "success");
          }}>
            🚪 Logout
          </button>
          <button className="delete-btn" onClick={handleDeleteAccount} disabled={loading}>
            {loading ? "⏳ Deleting..." : "🗑️ Delete Account"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <p>Need help? <a href="#">Contact Support</a></p>
        <p>Berry Recipes v1.0.0 | © 2026</p>
      </div>
    </div>
  );
}

export default Settings;
