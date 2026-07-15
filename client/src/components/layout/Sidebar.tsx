import { NavLink } from "react-router-dom";
import { MdDashboard, MdAssignment, MdLocalShipping } from "react-icons/md";

interface MenuItem {
  name: string;
  icon: JSX.Element;
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

const Sidebar = () => {
  const userRaw = localStorage.getItem("user");
  const role = userRaw ? JSON.parse(userRaw).role : null;
  const menu = role === "MSLVL" ? mslvlMenu : adminMenu;

  return (
    <aside className="w-64 bg-teal-800 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-teal-700">
        SmartBelaku
      </div>

      <nav className="flex-1 mt-5">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
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
  );
};

export default Sidebar;