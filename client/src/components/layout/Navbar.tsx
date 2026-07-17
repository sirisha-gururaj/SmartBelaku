import { MdMenu, MdLogout } from "react-icons/md";
import { getUser, logout } from "../../features/auth/services/auth.service";
import NotificationBell from "./NotificationBell";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const user = getUser();

  return (
    <header className="bg-white h-16 shadow flex items-center justify-between px-4 sm:px-8 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-slate-600 shrink-0" aria-label="Open menu">
          <MdMenu size={26} />
        </button>
        <h1 className="text-base sm:text-2xl font-bold text-gray-800 truncate">
          <span className="hidden sm:inline">Street Light Maintenance Management</span>
          <span className="sm:hidden">SmartBelaku</span>
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {user?.role === "ADMIN" && <NotificationBell />}

        <div className="text-right hidden sm:block">
          <h2 className="font-semibold">{user?.full_name}</h2>
          <p className="text-sm text-gray-500">{user?.role}</p>
        </div>

        <button onClick={logout} className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1">
          <MdLogout size={18} className="sm:hidden" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;