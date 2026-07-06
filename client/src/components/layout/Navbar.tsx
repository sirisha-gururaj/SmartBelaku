import { MdNotifications } from "react-icons/md";

const Navbar = () => {
  return (
    <header className="bg-white h-16 shadow flex items-center justify-between px-8">

      <div>

        <h1 className="text-2xl font-bold text-gray-800">
          Street Light Maintenance Management
        </h1>

      </div>

      <div className="flex items-center gap-6">

        <MdNotifications
          size={28}
          className="text-gray-600 cursor-pointer"
        />

        <div className="text-right">

          <h2 className="font-semibold">
            Administrator
          </h2>

          <p className="text-sm text-gray-500">
            MCC
          </p>

        </div>

      </div>

    </header>
  );
};

export default Navbar;