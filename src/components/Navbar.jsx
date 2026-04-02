import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useRecipes } from "../Context/RecipeContext";
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const { setCategory } = useRecipes();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileDropdownRef = useRef(null);
  const navbarRef = useRef(null);

  // Detect scroll for navbar shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFilter = (value) => {
    setCategory(value);
    setFilterOpen(false);
    setMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} ref={navbarRef}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="nav-logo">
          <Link to="/">
            <span className="logo-text">🍓 BerryRecipes</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu-desktop">
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/recipes"
                className={location.pathname === "/recipes" ? "active" : ""}
              >
                Recipes
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={location.pathname === "/about" ? "active" : ""}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={location.pathname === "/contact" ? "active" : ""}
              >
                Contact
              </Link>
            </li>

            {user && (
              <li>
                <Link
                  to="/create-recipe"
                  className={location.pathname === "/create-recipe" ? "active" : ""}
                >
                  ✏️ Create Recipe
                </Link>
              </li>
            )}

            <li className="dropdown-filter">
              <button 
                className="filter-btn" 
                onClick={() => setFilterOpen(!filterOpen)}
              >
                Filter <FiChevronDown size={16} />
              </button>
              {filterOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => handleFilter("all")}>🍓 All</button>
                  <button onClick={() => handleFilter("Pasta")}>🍝 Pasta</button>
                  <button onClick={() => handleFilter("Dessert")}>🍰 Dessert</button>
                  <button onClick={() => handleFilter("Fast Food")}>🍔 Fast Food</button>
                  <button onClick={() => handleFilter("Salad")}>🥗 Salad</button>
                </div>
              )}
            </li>
          </ul>

          {/* User section */}
          <div className="nav-user-section">
            {!user ? (
              <>
                <Link to="/login" className="btn-login">Login</Link>
                <Link to="/signup" className="btn-signup">Sign Up</Link>
              </>
            ) : (
              <div className="profile-dropdown" ref={profileDropdownRef}>
                <button 
                  className="profile-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="user-avatar">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="user-name">{user.name || user.email}</span>
                  <FiChevronDown 
                    size={16} 
                    className={`dropdown-icon ${profileDropdownOpen ? "open" : ""}`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="profile-menu">
                    <div className="profile-header">
                      <p className="profile-email">{user.email}</p>
                    </div>
                    <hr />
                    <Link to="/profile" className="menu-item">
                      <FiUser size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/settings" className="menu-item">
                      <FiSettings size={18} />
                      <span>Settings</span>
                    </Link>
                    <hr />
                    <button 
                      className="menu-item logout-item"
                      onClick={handleLogout}
                    >
                      <FiLogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`nav-menu-mobile ${menuOpen ? "active" : ""}`}>
        <ul className="mobile-links">
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>
          <li>
            <Link to="/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </li>
          {user && (
            <li>
              <Link to="/create-recipe" onClick={() => setMenuOpen(false)}>✏️ Create Recipe</Link>
            </li>
          )}
          <li>
            <button 
              className="filter-btn"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filter <FiChevronDown size={16} />
            </button>
            {filterOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleFilter("all")}>🍓 All</button>
                <button onClick={() => handleFilter("Pasta")}>🍝 Pasta</button>
                <button onClick={() => handleFilter("Dessert")}>🍰 Dessert</button>
                <button onClick={() => handleFilter("Fast Food")}>🍔 Fast Food</button>
              </div>
            )}
          </li>
        </ul>

        <div className="mobile-user-section">
          {!user ? (
            <>
              <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="menu-item" onClick={() => setMenuOpen(false)}>
                <FiUser size={18} /> My Profile
              </Link>
              <Link to="/settings" className="menu-item" onClick={() => setMenuOpen(false)}>
                <FiSettings size={18} /> Settings
              </Link>
              <button 
                className="menu-item logout-item"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                <FiLogOut size={18} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

