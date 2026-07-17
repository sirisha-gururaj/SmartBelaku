import { NavLink } from "react-router-dom";
import type { ReactElement } from "react";
import { MdDashboard, MdAssignment, MdLocalShipping, MdClose } from "react-icons/md";

interface MenuItem {
  name: string;
  icon: ReactElement;
  path: string;
}

const adminMenu: MenuItem[] = [
  { name: "Dashboard", icon: <MdDashboard size={22} />, path: "/admin" },
  { name: "Complaints", icon: <MdAssignment size={22} />, path: "/admin/complaints" },
  { name: "MSLVL", icon: <MdLocalShipping size={22} />, path: "/admin/mslvl" },
];

const mslvlMenu: MenuItem[] = [
  { name: "Dashboard", icon: <MdDashboard size={22} />, path: "/mslvl" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const userRaw = localStorage.getItem("user");
  const role = userRaw ? JSON.parse(userRaw).role : null;
  const menu = role === "MSLVL" ? mslvlMenu : adminMenu;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-teal-800 text-white flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 text-2xl font-bold border-b border-teal-700 flex justify-between items-center">
          SmartBelaku
          <button onClick={onClose} className="md:hidden text-teal-200 hover:text-white">
            <MdClose size={24} />
          </button>
        </div>

        <nav className="flex-1 mt-5">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-4 transition ${isActive ? "bg-teal-700" : "hover:bg-teal-700"}`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;