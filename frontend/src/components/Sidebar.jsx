
import { Nav } from "react-bootstrap";
import { GoHome } from "react-icons/go";
import { FaUserTie, FaUserCheck, FaClipboardList, FaComments } from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <Nav className="flex-column admin-sidebar p-3">
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        <GoHome className="text-danger m-2 fs-4" />
        Dashboard
      </NavLink>

      <NavLink to="/dashboard/users" className={({ isActive }) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        <FaUserTie className="text-danger m-2 fs-4" />
        Users
      </NavLink>

      <NavLink to="/dashboard/proposals" className={({ isActive }) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        <FaUserCheck className="text-danger m-2 fs-4" />
        Proposals
      </NavLink>

      <NavLink to="/dashboard/projects" className={({ isActive }) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        <FaClipboardList className="text-danger m-2 fs-4" />
        Projects
      </NavLink>

      <NavLink to="/dashboard/services" className={({ isActive }) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        <FaComments className="text-danger m-2 fs-4" />
        Services
      </NavLink>
    </Nav>
  );
}

export default Sidebar;
