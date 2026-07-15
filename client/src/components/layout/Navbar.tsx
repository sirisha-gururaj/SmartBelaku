import { MdNotifications } from "react-icons/md";
import { getUser, logout } from "../../features/auth/services/auth.service";
const Navbar = () => {
    const user = getUser();
  return (
    <header className="bg-white h-16 shadow flex items-center justify-between px-8">

      <div>

        <h1 className="text-2xl font-bold text-gray-800">
          Street Light Maintenance Management
        </h1>

      </div>

      <div className="flex items-center gap-5">
        <MdNotifications
          size={28}
          className="text-gray-600 cursor-pointer"
        />

    <div className="text-right">

        

        <h2 className="font-semibold">
            {user?.full_name}
        </h2>

        <p className="text-sm text-gray-500">
            {user?.role}
        </p>

    </div>

    <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded-lg"
    >
        Logout
    </button>

</div>

    </header>
  );
};

export default Navbar;

