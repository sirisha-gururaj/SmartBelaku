import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdLightbulb,
  MdAssignment,
  MdLocalShipping,
  MdBarChart,
  MdSettings,
} from "react-icons/md";

const menu = [
  {
    name: "Dashboard",
    icon: <MdDashboard size={22} />,
    path: "/",
  },
  {
    name: "Street Lights",
    icon: <MdLightbulb size={22} />,
    path: "/street-lights",
  },
  {
    name: "Complaints",
    icon: <MdAssignment size={22} />,
    path: "/complaints",
  },
  {
    name: "MSLVL",
    icon: <MdLocalShipping size={22} />,
    path: "/mslvl",
  },
  {
    name: "Reports",
    icon: <MdBarChart size={22} />,
    path: "/reports",
  },
  {
    name: "Settings",
    icon: <MdSettings size={22} />,
    path: "/settings",
  },
];

const Sidebar = () => {
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
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 transition ${
                isActive
                  ? "bg-teal-700"
                  : "hover:bg-teal-700"
              }`
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