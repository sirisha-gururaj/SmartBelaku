import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard";
import Complaints from "../pages/Complaints";
import NewComplaint from "../pages/NewComplaint";
import StreetLights from "../pages/StreetLights";
import MSLVL from "../pages/MSLVL";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route element={<DashboardLayout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/complaints"
            element={<Complaints />}
          />

          <Route
            path="/complaints/new"
            element={<NewComplaint />}
        />
        <Route path="/street-lights" element={<StreetLights />} />
<Route path="/mslvl" element={<MSLVL />} />
<Route path="/reports" element={<Reports />} />
<Route path="/settings" element={<Settings />} />

        </Route>

        

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;