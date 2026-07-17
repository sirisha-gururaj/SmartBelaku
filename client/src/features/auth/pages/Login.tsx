import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import api from "../../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const role = response.data.user.role;
      navigate(role === "ADMIN" ? "/admin" : "/mslvl");
    } catch (err) {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100 px-4">
      <form
        onSubmit={login}
        className="bg-white w-full max-w-[400px] rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          SmartBelaku
        </h1>

        <input
          placeholder="Email"
          className="border p-3 rounded-lg w-full mb-4 sm:mb-5 text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-5 sm:mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="border p-3 rounded-lg w-full text-base pr-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
          </button>
        </div>

        <button className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 text-base">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;