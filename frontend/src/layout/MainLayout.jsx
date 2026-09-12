// src/layout/MainLayout.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import { SharedLayout } from "../sharedLayout/SharedLayout";
import { Home } from "../pages/Home";
import { NotFound } from "../pages/NotFound";
import AddProject from '../pages/AddProject';
import ProjectDetails from '../pages/ProjectDetails';
import Charts from "../components/Charts/Charts";
import UsersTable from "../components/UsersTable";
import ServicesTable from "../components/ServicesTable";
import ProjectsTable from "../components/ProjectsTable";
import ProposalsTable from "../components/ProposalsTable";
import DashboardLayout from "../layout/DashboardLayout";



import {
  BrowserRouter,
 
} from "react-router-dom";
import { RegisterPage } from "../pages/RegisterPage";
import CreateService from "../pages/CreateService";
import { ServiceDetailsPage } from "../pages/ServiceDetailsPage";
import UserProfile from "../pages/UserProfile";
import About from "../pages/About";
import LoginPage from "../pages/Login";
import Settings from "../pages/Setting";
import Chat from "../pages/Chat";
import ServicesPage from "../pages/ServicesPage";
import Help from "../components/Help";
import EditProfile from "../pages/EditProfile";
import Projects from "../pages/Projects";
import Dashboard from "../pages/Dashboard";
import { ChatbotInterface } from "../pages/ChatBot";
import { NotificationProvider } from "../context/NotificationContext";
import ServiceRequests from "../pages/ServiceRequests";
import SavedProfiles from "../pages/SavedProfiles";

export function MainLayout() {
  return (
    <NotificationProvider>
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<SharedLayout />}>
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="/about" element={<About />} />
          <Route path="servicedetails" element={<ServiceDetailsPage />} />
          <Route path=":id/service" element={<CreateService />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/add/project" element={<AddProject />} />
          <Route path="profile/:id" element={<UserProfile />} />
          <Route path="profile/edit/:id" element={<EditProfile />} />
          <Route path="/services/:id" element={<ServiceDetailsPage />} />
          <Route path="services/:serviceId/requests" element={<ServiceRequests />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="saved" element={<SavedProfiles />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:conversationId" element={<Chat />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="help" element={<Help />} />
          <Route path="projects" element={<Projects />} />
          <Route path="chatbot" element={<ChatbotInterface/>}/>
       </Route>

{/* Dashboard-related routes with sidebar */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="charts" element={<Charts />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="services" element={<ServicesTable />} />
          <Route path="projects" element={<ProjectsTable />} />
          <Route path="proposals" element={<ProposalsTable />} />
        </Route>

      </Routes>
    </BrowserRouter>
    </NotificationProvider>
  );
}
