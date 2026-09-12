import React, { useState, useRef, useEffect } from "react";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Overlay,
  Popover,
  Badge,
  Image,
} from "react-bootstrap";
import {
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
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/header.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { getMyProfileAction } from "../store/slices/userSlice";
import { useNotifications } from "../context/NotificationContext";

const NOTIFICATION_LINKS = {
  project: (targetId) => `/project/${targetId}`,
  service: (targetId) => `/services/${targetId}`,
};

const timeAgo = (isoString) => {
  const diffMinutes = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((myStore) => myStore.authSlice);
  const { user: authUser } = useSelector((myStore) => myStore.authSlice);
  const { user } = useSelector((state) => state.userSlice);
  const { theme } = useSelector((state) => state.themeSlice);
  const { notifications, unreadCount, markAllRead, markOneRead, messagesUnreadCount } = useNotifications();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  
  useEffect(() => {
    if (isLoggedIn) dispatch(getMyProfileAction());
  }, [dispatch, isLoggedIn]);

  const [dropdowns, setDropdowns] = useState({
    expandMenu: false,
    notifications: false,
    profileMenu: false,
  });

  const refs = {
    expandMenu: useRef(null),
    notifications: useRef(null),
    profileMenu: useRef(null),
  };

  // Refs on a plain div WE control inside each Popover — not on the
  // Popover component itself, since Overlay needs that ref internally
  // for positioning and doesn't reliably forward a ref we pass to it.
  const popoverRefs = {
    expandMenu: useRef(null),
    notifications: useRef(null),
    profileMenu: useRef(null),
  };

  const toggleDropdown = (dropdown) => {
    setDropdowns((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        next[key] = key === dropdown ? !prev[key] : false;
      });
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdowns).forEach((key) => {
        const trigger = refs[key]?.current;
        const popover = popoverRefs[key]?.current;
        const clickedInsideTrigger = trigger && trigger.contains(event.target);
        const clickedInsidePopover = popover && popover.contains(event.target);
        if (!clickedInsideTrigger && !clickedInsidePopover) {
          setDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (notification.notification_type === "rating_received" && authUser?.id) {
      toggleDropdown("notifications");
      if (!notification.is_read) markOneRead(notification.id);
      navigate(`/profile/${authUser.id}?tab=reviews`);
      return;
    }

    const buildLink = NOTIFICATION_LINKS[notification.target_type];
    toggleDropdown("notifications");
    if (!notification.is_read) markOneRead(notification.id);
    if (buildLink && notification.target_id) {
      navigate(buildLink(notification.target_id));
    }
  };

  const profileMenuOptions = [
    { icon: <FaUser />, text: "Profile", to: `/profile/${user?.id}` },
    { icon: <FaShoppingCart />, text: "Saved", to: "/saved" },
    { icon: <FaEnvelope />, text: "Balance", to: "/balance" },
    { icon: <FaCog />, text: "Settings", to: "/settings" },
    { icon: <FaUser />, text: "Edit my account", to: `/profile/edit/${user?.id}` },
    { icon: <FaTruck />, text: "Help", to: "/help" },
    { icon: <FaSignOutAlt />, text: "Logout", onClick: handleLogout },
  ];

  const expandMenuOptions = [
    { icon: <FaHome />, text: "Home", path: "/" },
    { icon: <FaProjectDiagram />, text: "Projects", path: "/projects" },
    { icon: <FaTools />, text: "Services", path: "/services" },
    { icon: <FaInfoCircle />, text: "About", path: "/about" },
    { icon: <FaRobot />, text: "Chat bot", path: "/chatBot" },
    ...(isLoggedIn
      ? [
          { icon: <FaUser />, text: "My Profile", path: `/profile/${user?.id}` },
          { icon: <FaEnvelope />, text: "Messages", path: "/chat" },
          { icon: <FaCog />, text: "Settings", path: "/settings" },
          ...(user?.user_type === "freelancer"
            ? [{ icon: <FaTools />, text: "Add Service", path: "/0/service" }]
            : []),
          ...(user?.user_type === "client"
            ? [{ icon: <FaProjectDiagram />, text: "Post a Project", path: "/add/project" }]
            : []),
          { icon: <FaSignOutAlt />, text: "Logout", onClick: handleLogout },
        ]
      : []),
  ];

  const handleToggleTheme = () => {
    dispatch({ type: "theme/toggleTheme" });
  };

  const renderActionButton = () => {
    if (!isLoggedIn || !user) return null;
    if (user.user_type === "freelancer") {
      return (
        <Link to="/0/service" className="add-action-btn">
          <span className="btn-text">Add Service</span>
          <span className="btn-icon">+</span>
        </Link>
      );
    }
    if (user.user_type === "client") {
      return (
        <Link to="/add/project" className="add-action-btn">
          <span className="btn-text">Post a Project</span>
          <span className="btn-icon">+</span>
        </Link>
      );
    }
    return (
      <Link to="/dashboard" className="add-action-btn">
        <span className="btn-text">Admin Dashboard</span>
      </Link>
    );
  };

  return (
    <header className="header-component">
      <Navbar bg="dark" variant="dark" expand="lg" className="py-2">
        <Container>
          <Navbar.Brand as={Link} to="/" className="me-4">
            <svg width="120" height="40" viewBox="0 0 120 40">
              <text x="10" y="30" className="logo-text">
                <tspan fill="#ffffff">Tan</tspan>
                <tspan fill="#f09819">feez</tspan>
                <tspan fill="#f09819">.</tspan>
              </text>
            </svg>
          </Navbar.Brand>

          <Nav className="me-auto main-nav d-none d-lg-flex">
            <NavLink to="/" className={({ isActive }) => `nav-link nav-link-custom ${isActive ? "active" : ""}`}>Home</NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-link nav-link-custom ${isActive ? "active" : ""}`}>Projects</NavLink>
            <NavLink to="/services" className={({ isActive }) => `nav-link nav-link-custom ${isActive ? "active" : ""}`}>Services</NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link nav-link-custom ${isActive ? "active" : ""}`}>About</NavLink>
            <NavLink to="/chatBot/" className={({ isActive }) => `nav-link nav-link-custom me-4 ai ${isActive ? "active" : ""}`}>ChatBot</NavLink>
          </Nav>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-auto d-lg-none border-0 custom-toggler" />

          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center justify-content-center nav-icons-container flex-row gap-3">
              {!isLoggedIn && (
                <div className="d-flex align-items-center">
                  <Link to="/register" className="me-2 text-white border-0">
                    <FaUser className="me-1" /> Register
                  </Link>
                  <Link to="/login" className="text-white border-0">
                    <FaUser className="me-1" /> Login
                  </Link>
                </div>
              )}

              <div className="icon-wrapper">
                <button
                  type="button"
                  className="theme-toggle-btn"
                  onClick={handleToggleTheme}
                  aria-label="Toggle theme"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                  {theme === "light" ? <FaMoon size={26} /> : <FaSun size={26} />}
                </button>
              </div>

              {isLoggedIn && (
                <>
                  <div className="d-none d-lg-block">{renderActionButton()}</div>

                  {/* Notifications */}
                  <div ref={refs.notifications} className="position-relative icon-wrapper">
                    <Nav.Link
                      as="button"
                      type="button"
                      onClick={() => toggleDropdown("notifications")}
                      className="nav-icon"
                      aria-label="Notifications"
                      aria-haspopup="menu"
                      aria-expanded={dropdowns.notifications}>
                      <FaBell />
                      {unreadCount > 0 && (
                        <Badge bg="danger" pill className="position-absolute top-0 end-0 notification-badge">
                          {unreadCount}
                        </Badge>
                      )}
                    </Nav.Link>

                    <Overlay
                      show={dropdowns.notifications}
                      target={refs.notifications.current}
                      placement="bottom-end"
                      containerPadding={20}>
                      <Popover id="notifications-popover" className="border-0 shadow-custom">
                        <div ref={popoverRefs.notifications}>
                          <Popover.Header className="bg-light d-flex justify-content-between align-items-center popup-header">
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <Button variant="link" size="sm" className="p-0 text-muted mark-read-btn" onClick={markAllRead}>
                                Mark all as read
                              </Button>
                            )}
                          </Popover.Header>
                          <Popover.Body className="p-0">
                            {notifications.length > 0 ? (
                              <div className="notification-list">
                                {notifications.slice(0, 8).map((notification) => (
                                  <div
                                    key={notification.id}
                                    role="button"
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`notification-item p-2 border-bottom ${!notification.is_read ? "bg-light" : ""}`}>
                                    <div className="d-flex justify-content-between">
                                      <span className="notification-content">{notification.message}</span>
                                      {!notification.is_read && <span className="text-primary unread-indicator">•</span>}
                                    </div>
                                    <small className="text-muted notification-time">{timeAgo(notification.created_at)}</small>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 text-center">No notifications</div>
                            )}
                          </Popover.Body>
                        </div>
                      </Popover>
                    </Overlay>
                  </div>

                  {/* Messages */}
                  <div className="position-relative icon-wrapper">
                    <NavLink className="nav-icon" aria-label="Messages" to="/chat">
                      <FaEnvelope />
                      {messagesUnreadCount > 0 && (
                        <Badge bg="danger" pill className="position-absolute top-0 end-0 notification-badge">
                          {messagesUnreadCount}
                        </Badge>
                      )}
                    </NavLink>
                  </div>

                  {/* Profile */}
                  <div ref={refs.profileMenu} className="position-relative icon-wrapper d-none d-lg-block">
                    <Nav.Link as="button" type="button" onClick={() => toggleDropdown("profileMenu")} className="p-0 profile-link" aria-label="Profile" aria-haspopup="menu" aria-expanded={dropdowns.profileMenu}>
                      <Image
                        src={!user?.photo ? "/avatar.png" : user.photo}
                        roundedCircle width="32" height="32"
                        className="border border-2 border-light profile-image shadow"
                        alt="Profile" />
                    </Nav.Link>

                    <Overlay
                      show={dropdowns.profileMenu}
                      target={refs.profileMenu.current}
                      placement="bottom-end"
                      containerPadding={20}>
                      <Popover id="profile-menu-popover" className="border-0 shadow-custom profile-menu-popover">
                        <div ref={popoverRefs.profileMenu}>
                          <Popover.Body className="p-0">
                            <Nav className="flex-column">
                              {profileMenuOptions.map((option) => (
                                <Nav.Link
                                  key={option.text}
                                  as={option.onClick ? "button" : Link}
                                  to={!option.onClick ? option.to : undefined}
                                  onClick={(e) => {
                                    if (option.onClick) {
                                      e.preventDefault();
                                      option.onClick();
                                    }
                                    toggleDropdown("profileMenu");
                                  }}
                                  className="px-3 py-2 text-dark menu-item d-flex align-items-center">
                                  <span className="menu-icon me-2">{option.icon}</span>
                                  {option.text}
                                </Nav.Link>
                              ))}
                            </Nav>
                          </Popover.Body>
                        </div>
                      </Popover>
                    </Overlay>
                  </div>
                </>
              )}

              {/* Mobile expand menu */}
              <div ref={refs.expandMenu} className="position-relative icon-wrapper d-lg-none">
                <Button
                  type="button"
                  variant="outline-light" size="sm" className="py-1 px-2 expand-menu-btn"
                  onClick={() => toggleDropdown("expandMenu")}
                  aria-expanded={dropdowns.expandMenu}>
                  <FaBars />
                </Button>

                <Overlay
                  show={dropdowns.expandMenu}
                  target={refs.expandMenu.current}
                  placement="bottom-end"
                  containerPadding={20}>
                  <Popover id="expand-menu-popover" className="border-0 shadow-custom expandable-menu">
                    <div ref={popoverRefs.expandMenu}>
                      <Popover.Body className="p-0">
                        <Nav className="flex-column">
                          {expandMenuOptions.map((option) => (
                            <Nav.Link
                              key={option.text}
                              as={option.onClick ? "button" : Link}
                              to={!option.onClick ? option.path : undefined}
                              onClick={
                                option.onClick
                                  ? (e) => {
                                      e.preventDefault();
                                      option.onClick();
                                      toggleDropdown("expandMenu");
                                    }
                                  : () => toggleDropdown("expandMenu")
                              }
                              className="px-3 py-2 text-dark menu-item d-flex align-items-center">
                              <span className="menu-icon me-2">{option.icon}</span>
                              {option.text}
                            </Nav.Link>
                          ))}
                          {!isLoggedIn && (
                            <>
                              <Nav.Link as={Link} to="/login" className="px-3 py-2 text-dark menu-item d-flex align-items-center" onClick={() => toggleDropdown("expandMenu")}>
                                <span className="menu-icon me-2"><FaSignInAlt /></span>
                                Login
                              </Nav.Link>
                              <Nav.Link as={Link} to="/register" className="px-3 py-2 text-dark menu-item d-flex align-items-center" onClick={() => toggleDropdown("expandMenu")}>
                                <span className="menu-icon me-2"><FaUserPlus /></span>
                                Register
                              </Nav.Link>
                            </>
                          )}
                        </Nav>
                      </Popover.Body>
                    </div>
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