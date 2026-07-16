import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { AdminModalProvider } from "../features/admin/context/AdminModalContext";
import GlobalModals from "../features/admin/components/GlobalModals";

const DashboardLayout = () => {
  return (
    <AdminModalProvider>
      <div className="flex h-screen bg-slate-100">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <GlobalModals />
    </AdminModalProvider>
  );
};

export default DashboardLayout;