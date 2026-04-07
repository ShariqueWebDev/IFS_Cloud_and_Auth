import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHandleCallbackMutation } from "../services/authApi";

function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [handleCallback, { isLoading, error }] = useHandleCallbackMutation();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code) {
      handleCallback({ code, state: state || "" })
        .unwrap()
        .then(() => navigate("/dashboard", { replace: true }))
        .catch(() => {});
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, handleCallback, navigate]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-md w-[400px] text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Login Failed
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            {"data" in error
              ? (error.data as { error: string }).error
              : "Authentication failed. Please try again."}
          </p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-semibold cursor-pointer hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isLoading ? "Completing login..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}

export default Callback;
