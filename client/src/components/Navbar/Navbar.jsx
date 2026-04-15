import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const closeNavbar = () => {
    const navEl = document.getElementById("navbarNav");
    if (navEl && navEl.classList.contains("show")) {
      const { Collapse } = window.bootstrap;
      const collapse = Collapse.getInstance(navEl) || new Collapse(navEl, { toggle: false });
      collapse.hide();
    }
    // also close any open bootstrap dropdown
    const openDropdown = document.querySelector(".dropdown-menu.show");
    if (openDropdown) {
      const { Dropdown } = window.bootstrap;
      const toggle = document.querySelector("[data-bs-toggle='dropdown']");
      if (toggle) {
        const dd = Dropdown.getInstance(toggle);
        if (dd) dd.hide();
      }
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeNavbar();
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    closeNavbar();
    logout();
    navigate("/login");
  };

  const initial = user?.name?.charAt(0).toUpperCase();

  return (
    <nav className="navbar navbar-expand-lg navbar-custom px-3 px-md-4" ref={navRef}>
      <NavLink className="navbar-brand fw-bold" to="/dashboard">
         ExpenseTracker
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon" style={{ filter: "invert(0.5)" }}></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
          <li className="nav-item">
            <NavLink className="nav-link" to="/dashboard" onClick={closeNavbar}>Dashboard</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/expenses" onClick={closeNavbar}>Expenses</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/ai-insights" onClick={closeNavbar}>AI Insights</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/chat" onClick={closeNavbar}>Chat</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/goals" onClick={closeNavbar}>Goals</NavLink>
          </li>
          {user && (
            <li className="nav-item dropdown ms-2">
              <button
                className="avatar-btn dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {initial}
              </button>
              <ul className="dropdown-menu dropdown-menu-end avatar-dropdown">
                <li>
                  <button className="dropdown-item" onClick={() => { navigate("/profile"); setTimeout(closeNavbar, 50); }}>
                    👤 Profile
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={() => { logout(); navigate("/login"); }}>
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
