import { Navigate } from "react-router-dom";
import { useGetAuthStatusQuery } from "../services/authApi";

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isFetching } = useGetAuthStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading || isFetching)
    return <p className="text-center mt-12 text-lg">Loading...</p>;

  if (data?.loggedIn) return <Navigate to="/dashboard" replace />;

  return children;
}

export default GuestRoute;
