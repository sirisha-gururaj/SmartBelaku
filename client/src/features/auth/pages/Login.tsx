import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      const role = response.data.user.role;

    navigate(role === "ADMIN" ? "/admin" : "/mslvl");
    } catch (err) {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">

      <form
        onSubmit={login}
        className="bg-white w-[400px] rounded-xl shadow-lg p-8"
      >

        <h1 className="text-3xl font-bold text-center mb-8">
          SmartBelaku
        </h1>

        <input
          placeholder="Email"
          className="border p-3 rounded-lg w-full mb-5"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg w-full mb-6"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800"
        >
          Login
        </button>

      </form>

    </div>
  );
};

export default Login;