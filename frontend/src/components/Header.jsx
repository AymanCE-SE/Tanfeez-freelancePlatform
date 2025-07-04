/** @format */

import React, { useState, useRef, useEffect } from "react";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Form,
  FormControl,
  Overlay,
  Popover,
  Badge,
  Image,
} from "react-bootstrap";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaEnvelope,
  FaBell,
  FaTruck,
  FaBars,
  FaMoon,
  FaSun,
  FaHome,
  FaProjectDiagram,
  FaTools,
  FaInfoCircle,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { ChatDots } from "react-bootstrap-icons";
import "../styles/header.css"; // Import your CSS file
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

import { NavLink } from "react-router-dom";
import { getMyProfileAction } from "../store/slices/userSlice";

export const Header = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((myStore) => myStore.authSlice);
  const { isLoading, user } = useSelector((state) => state.userSlice);

  // let isLoggedIn = false

  const navigate = useNavigate(); // Initialize navigate  // Function to handle logout
  const handleLogout = () => {
    dispatch(logout());

    navigate("/login"); // Redirect to the login page
  };

  useEffect(() => {
    dispatch(getMyProfileAction());
  }, []);

  // Redux state for theme management
  const { theme } = useSelector((state) => state.themeSlice);
  // const { role } = useSelector((state) => state.authSlice);

  // Redux state for theme management
  // State for managing dropdowns with consolidated naming convention
  const [dropdowns, setDropdowns] = useState({
    categories: false,
    search: false,
    expandMenu: false,
    messages: false,
    notifications: false,
    profileMenu: false,
  });

  // Refs for handling click outside events
  const refs = {
    categories: useRef(null),
    search: useRef(null),
    expandMenu: useRef(null),
    messages: useRef(null),
    notifications: useRef(null),
    profileMenu: useRef(null),
  };

  // Toggle dropdown function - closes other dropdowns when opening one
  const toggleDropdown = (dropdown) => {
    const newState = { ...dropdowns };

    // Close all other dropdowns
    Object.keys(newState).forEach((key) => {
      newState[key] = key === dropdown ? !newState[key] : false;
    });

    setDropdowns(newState);
  };

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(refs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const notifications = [
    {
      id: 1,
      content: "Your order has been shipped",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 2,
      content: "New comment on your service",
      time: "5 hours ago",
      unread: true,
    },
    { id: 3, content: "Payment received", time: "Yesterday", unread: false },
  ];

  const profileMenuOptions = [
    { icon: <FaUser />, text: "Profile", to: `/profile/${user?.id}` },
    { icon: <FaShoppingCart />, text: "Saved", to: "/saved" },
    { icon: <FaEnvelope />, text: "Balance", to: "/balance" },
    { icon: <FaCog />, text: "Settings", to: "/settings" }, // Changed icon and added route
    { icon: <FaUser />, text: "Edit my account", to: `/profile/edit/${user?.id}` },
    { icon: <FaTruck />, text: "Help", to: "/help" }, // Added route
    { icon: <FaSignOutAlt />, text: "Logout" },
  ];

  const expandMenuOptions = [
    {
      icon: <FaHome />,
      text: "Home",
      path: "/"
    },
    {
      icon: <FaProjectDiagram />,
      text: "Projects",
      path: "/projects"
    },
    {
      icon: <FaTools />,
      text: "Services",
      path: "/services"
    },
    {
      icon: <FaInfoCircle />,
      text: "About Us",
      path: "/about"
    },
    {
      icon: <FaRobot />,
      text: "Chat With 🤖",
      path: "/chatBot"
    },
    ...(isLoggedIn ? [
      {
        icon: <FaUser />,
        text: "My Profile",
        path: `/profile/${user?.id}`
      },
      {
        icon: <FaBell />,
        text: "Notifications",
        path: "#notifications"
      },
      {
        icon: <FaEnvelope />,
        text: "Messages",
        path: "/chat"
      },
      {
        icon: <FaCog />,
        text: "Settings",
        path: "/settings"
      },
      {
        icon: <FaSignOutAlt />,
        text: "Logout",
        onClick: handleLogout
      }
    ] : [])
  ];

  // Function to render notification badge
  const renderBadge = (items) => {
    const count = items.filter((item) => item.unread).length;
    return count > 0 ? (
      <Badge
        bg="danger"
        pill
        className="position-absolute top-0 end-0 notification-badge">
        {count}
      </Badge>
    ) : null;
  };

  // Toggle theme function
  const handleToggleTheme = () => {
    dispatch({ type: "theme/toggleTheme" });
  };

  const renderActionButton = () => {
    if (!isLoggedIn || !user) return null;

    return (
      <div className="action-button-wrapper ms-auto me-4">
        {user.user_type === "freelancer" ? (
          <Link to="/0/service" className="add-action-btn">
            <span className="btn-text">Add Service</span>
            <span className="btn-icon">+</span>
          </Link>
        ) : user.user_type === "client" ? (
          <Link to="/add/project" className="add-action-btn">
            <span className="btn-text">Post a Project</span>
            <span className="btn-icon">+</span>
          </Link>
        ) : <Link to="/dashboard" className="add-action-btn">
          <span className="btn-text">Admin Dashboard</span>
        </Link>}
      </div>
    );
  };

  return (
    <header className="header-component">
      <Navbar bg="dark" variant="dark" expand="lg" className="py-2">
        <Container>
          {/* Left section: Logo and Categories */}
          <div className="d-flex align-items-center">
            {/* Logo */}
            <Navbar.Brand href="/" className="me-4">
              <svg width="120" height="40" viewBox="0 0 120 40">
                <text
                  x="10"
                  y="30"
                  className="logo-text"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: "24px",
                  }}>
                  <tspan fill="#ffffff">Tan</tspan>
                  <tspan fill="#f09819">feez</tspan>
                  <tspan fill="#f09819">.</tspan>
                </text>
              </svg>
            </Navbar.Brand>
          </div>

          {/* Main Nav Links - Hide on small screens */}
          <Nav className="me-auto main-nav d-none d-lg-flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link nav-link-custom ${isActive ? "active" : ""}`
              }>
              Home
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `nav-link nav-link-custom ${isActive ? "active" : ""}`
              }>
              Projects
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                `nav-link nav-link-custom ${isActive ? "active" : ""}`
              }>
              Services
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link nav-link-custom ${isActive ? "active" : ""}`
              }>
              About Us
            </NavLink>
            <NavLink
              to="/chatBot/"
              className={({ isActive }) =>
                `nav-link nav-link-custom me-4  ai  ${isActive ? "active" : ""}`
              }>
              Chat With
              <span className="robot-icon"> 🤖</span>
            </NavLink>
          </Nav>

          {/* Responsive navbar toggle */}
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="ms-auto d-lg-none border-0 custom-toggler"
          />

          {/* Right section: Search, cart, notifications, etc. */}
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center justify-content-center nav-icons-container flex-row  gap-3">
              {/* Login/Signup buttons for not logged in users */}
              {!isLoggedIn && (
                <div className="d-flex align-items-center auth-buttons">
                  <Link
                    to={"register"}
                    variant="outline-secondary"
                    size="sm"
                    className="me-2 text-white border-0 signup-btn">
                    <FaUser className="me-1" /> Register
                  </Link>
                  <Link
                    to={"/login"}
                    variant="outline-secondary"
                    size="sm"
                    className="text-white border-0 login-btn">
                    <FaUser className="me-1" /> Login
                  </Link>
                </div>
              )}

              {/* Logged in user features */}
              {isLoggedIn && (
                <>
                  {/* Post Project/Service Button - always visible on large screens, optional on small */}
                  <div className="d-none d-lg-block">
                    {renderActionButton()}
                  </div>

                  {/* Notifications Icon */}
                  <div ref={refs.notifications} className="position-relative icon-wrapper">
                    <Nav.Link
                      onClick={() => toggleDropdown("notifications")}
                      className="nav-icon"
                      aria-label="Notifications"
                    >
                      <FaBell />
                      {renderBadge(notifications)}
                    </Nav.Link>

                    <Overlay
                      show={dropdowns.notifications}
                      target={refs.notifications.current}
                      placement="bottom-end"
                      container={refs.notifications.current}
                      containerPadding={20}>
                      <Popover
                        id="notifications-popover"
                        className="border-0 shadow-custom">
                        <Popover.Header className="bg-light d-flex justify-content-between align-items-center popup-header">
                          <span>Notifications</span>

                          {/* <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-muted mark-read-btn">
                            Mark all as read
                          </Button> */}
                        </Popover.Header>
                        <Popover.Body className="p-0">
                          {notifications.length > 0 ? (
                            <div className="notification-list">
                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`notification-item p-2 border-bottom ${notification.unread ? "bg-light" : ""
                                    }`}>
                                  <div className="d-flex justify-content-between">
                                    <span className="notification-content">
                                      {notification.content}
                                    </span>
                                    {notification.unread && (
                                      <span className="text-primary unread-indicator">
                                        •
                                      </span>
                                    )}
                                  </div>
                                  <small className="text-muted notification-time">
                                    {notification.time}
                                  </small>
                                </div>
                              ))}
                              <div className="text-center py-2">
                                <a
                                  href="#all-notifications"
                                  className="text-decoration-none see-all-link">
                                  See all notifications
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 text-center">
                              No notifications
                            </div>
                          )}
                        </Popover.Body>
                      </Popover>
                    </Overlay>
                  </div>

                  {/* Messages Icon */}
                  <div ref={refs.messages} className="position-relative icon-wrapper">
                    <NavLink
                      className="nav-icon"
                      aria-label="Messages"
                      to={isLoggedIn ? "/chat" : "/chat"}>
                      <FaEnvelope />
                    </NavLink>
                  </div>

                  {/* Theme Toggle Button */}
                  <div className="icon-wrapper">
                    <button
                      className="theme-toggle-btn"
                      onClick={handleToggleTheme}
                      aria-label="Toggle theme"
                      title={
                        theme === "light"
                          ? "Switch to dark mode"
                          : "Switch to light mode"
                      }>
                      {theme === "light" ? (
                        <FaMoon size={26} />
                      ) : (
                        <FaSun size={26} />
                      )}
                    </button>
                  </div>

                  {/* Profile Picture with Dropdown - hide on small screens */}
                  <div
                    ref={refs.profileMenu}
                    className="position-relative icon-wrapper d-none d-lg-block"
                  >
                    <Nav.Link
                      onClick={() => toggleDropdown("profileMenu")}
                      className="p-0 profile-link"
                      aria-label="Profile">
                      <Image
                        src={!user.photo ? '/avatar.png' : user.photo}
                        roundedCircle
                        width="32"
                        height="32"
                        className="border border-2 border-light profile-image shadow"
                        alt="Profile"
                      />
                    </Nav.Link>

                    {/* Profile Menu Popover */}
                    <Overlay
                      show={dropdowns.profileMenu}
                      target={refs.profileMenu.current}
                      placement="bottom-end"
                      container={refs.profileMenu.current}
                      containerPadding={20}>
                      <Popover
                        id="profile-menu-popover"
                        className="border-0 shadow-custom profile-menu-popover">
                        <Popover.Body className="p-0">
                          <Nav className="flex-column">
                            {profileMenuOptions.map((option, idx) => (
                              <Nav.Link
                                key={idx}
                                as={option.text === "Logout" ? 'button' : Link}
                                to={option.to}
                                onClick={option.text === "Logout"
                                  ? (e) => {
                                      e.preventDefault();
                                      handleLogout();
                                      toggleDropdown("profileMenu");
                                    }
                                  : () => toggleDropdown("profileMenu")}
                                className="px-3 py-2 text-dark menu-item d-flex align-items-center"
                              >
                                <span className="menu-icon me-2">
                                  {option.icon}
                                </span>
                                {option.text}
                              </Nav.Link>
                            ))}
                          </Nav>
                        </Popover.Body>
                      </Popover>
                    </Overlay>
                  </div>
                </>
              )}
              {/* Expand Menu Button - only on small screens */}
              <div ref={refs.expandMenu} className="position-relative icon-wrapper d-lg-none">
                <Button
                  variant="outline-light"
                  size="sm"
                  className="py-1 px-2 expand-menu-btn"
                  onClick={() => toggleDropdown("expandMenu")}
                  aria-expanded={dropdowns.expandMenu}>
                  <FaBars />
                </Button>

                <Overlay
                  show={dropdowns.expandMenu}
                  target={refs.expandMenu.current}
                  placement="bottom-end"
                  container={refs.expandMenu.current}
                  containerPadding={20}>
                  <Popover
                    id="expand-menu-popover"
                    className="border-0 shadow-custom expandable-menu">
                    <Popover.Body className="p-0">
                      <Nav className="flex-column">
                        {expandMenuOptions.map((option, idx) => (
                          <Nav.Link
                            key={idx}
                            as={option.onClick ? 'button' : Link}
                            to={!option.onClick ? option.path : undefined}
                            onClick={option.onClick ? (e) => {
                              e.preventDefault();
                              option.onClick();
                              toggleDropdown("expandMenu");
                            } : () => toggleDropdown("expandMenu")}
                            className="px-3 py-2 text-dark menu-item d-flex align-items-center"
                          >
                            <span className="menu-icon me-2">
                              {option.icon}
                            </span>
                            {option.text}
                          </Nav.Link>
                        ))}
                        {!isLoggedIn && (
                          <>
                            <Nav.Link
                              as={Link}
                              to="/login"
                              className="px-3 py-2 text-dark menu-item d-flex align-items-center"
                              onClick={() => toggleDropdown("expandMenu")}
                            >
                              <span className="menu-icon me-2">
                                <FaSignInAlt />
                              </span>
                              Login
                            </Nav.Link>
                            <Nav.Link
                              as={Link}
                              to="/register"
                              className="px-3 py-2 text-dark menu-item d-flex align-items-center"
                              onClick={() => toggleDropdown("expandMenu")}
                            >
                              <span className="menu-icon me-2">
                                <FaUserPlus />
                              </span>
                              Register
                            </Nav.Link>
                          </>
                        )}
                      </Nav>
                    </Popover.Body>
                  </Popover>
                </Overlay>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
