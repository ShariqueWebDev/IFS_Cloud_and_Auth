import { useGetLoginUrlQuery } from "../services/authApi";

function Login() {
  const { data, isLoading } = useGetLoginUrlQuery();

  const handleLogin = () => {
    if (data?.authUrl) {
      window.location.href = data.authUrl;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-[400px] text-center">
        <div className="mb-5">
          <img
            src="/ifs_logo_name.svg"
            alt="IFS Logo"
            className="h-12 mx-auto"
          />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          IFS Login
        </h1>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="px-8 py-3 bg-gray-900 text-white rounded text-sm font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;
