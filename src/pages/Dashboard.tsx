import { useNavigate } from "react-router-dom";
import { useGetUserInfoQuery, useLogoutMutation } from "../services/authApi";

function Dashboard() {
  const { data: user, isLoading, error } = useGetUserInfoQuery();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading) return <p className="text-center mt-12 text-lg">Loading...</p>;
  if (error) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between items-center px-8 py-4 bg-blue-600 text-white">
        <div className="flex items-center gap-3">
          <img
            src="/ifs_logo_name.svg"
            alt="IFS Logo"
            className="h-8 brightness-0 invert"
          />
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-white text-blue-600 rounded text-sm font-semibold hover:bg-gray-100 cursor-pointer"
        >
          Logout
        </button>
      </header>

      <div className="p-8 flex gap-5 flex-wrap">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 min-w-75">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Welcome, {user?.name || user?.preferred_username}!
          </h2>
          <p className="text-gray-600 text-sm">
            <strong>Username:</strong> {user?.preferred_username}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex-1 min-w-75">
          <h2 className="text- font-semibold text-gray-800 mb-3">
            Quick Actions
          </h2>
          <button
            onClick={() => navigate("/lobbies")}
            className="px-6 py-2 bg-blue-600 text-white rounded font-medium text-sm cursor-pointer hover:bg-blue-700"
          >
            View Lobbies
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
