import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../features/auth/pages/Login";
import CitizenHome from "../features/citizen/pages/Home";
import TrackComplaint from "../features/citizen/pages/TrackComplaint";        
import CitizenNewComplaint from "../features/citizen/pages/NewComplaint"; 
import MslvlManagement from "../features/admin/pages/MslvlManagement";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Complaints from "../features/complaints/pages/Complaints";
import MslvlDashboard from "../features/mslvl/pages/MslvlDashboard";
import MslvlNewComplaint from "../features/mslvl/pages/NewComplaint";
import SurveyorManagement from "../features/admin/pages/SurveyorManagement";
import Surveys from "../features/admin/pages/Surveys";
import SurveyorDashboard from "../features/survey/pages/SurveyorDashboard";
import SurveyFormPage from "../features/survey/pages/SurveyFormPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no login */}
        <Route path="/" element={<CitizenHome />} />
        <Route path="/complaint/new" element={<CitizenNewComplaint />} />
        <Route path="/complaint/track" element={<TrackComplaint />} />

        {/* Staff login */}
        <Route path="/login" element={<Login />} />

        {/* Admin only */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/complaints" element={<Complaints />} />

          <Route path="/admin/mslvl" element={<MslvlManagement />} />
          <Route path="/admin/surveyor" element={<SurveyorManagement />} />
          <Route path="/admin/surveys" element={<Surveys />} />
        </Route>

        {/* MSLVL only */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["MSLVL"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/mslvl" element={<MslvlDashboard />} />
          <Route path="/mslvl/complaints/new" element={<MslvlNewComplaint />} />
        </Route>

        {/* SURVEYOR only */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["SURVEYOR"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/surveyor" element={<SurveyorDashboard />} />
          <Route path="/surveyor/new" element={<SurveyFormPage />} />
          <Route path="/surveyor/:id" element={<SurveyFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;