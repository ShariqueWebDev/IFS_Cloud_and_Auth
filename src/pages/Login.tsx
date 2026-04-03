import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../services/authApi";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password }).unwrap();
      navigate("/dashboard");
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-[400px]">
        <div className="text-center mb-5">
          <img src="/ifs_logo_name.svg" alt="IFS Logo" className="h-12 mx-auto" />
        </div>
        <h1 className="text-center text-2xl font-semibold text-gray-800 mb-8">
          IFS Cloud Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-1 font-semibold text-gray-600 text-sm">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (e.g. WIROUS)"
              className="w-full p-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block mb-1 font-semibold text-gray-600 text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-center mb-4 text-sm">
              {"data" in error
                ? (error.data as { error: string }).error
                : "Login failed"}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-blue-600 text-white rounded text-base cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
