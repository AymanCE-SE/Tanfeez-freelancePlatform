
  import Sidebar from "../components/Sidebar";
  import Services from "../components/ServicesTable";
  import UsersTable from "../components/UsersTable";
  import Proposals from "../components/ProposalsTable";
  import Projects from "../components/ProjectsTable";
  import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import "../styles/sidebar.css";
  
  function DashboardLayout() {
    return (
      <div className="admin-dashboard-layout">
        <Header />
        <Sidebar />
        <main className="admin-main-content">
          <Outlet /> {/* Displays the current route component (e.g., UsersTable) */}
        </main>
      </div>
    );
  }
  
  export default DashboardLayout;
  