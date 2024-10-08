import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../stores/user";
import AppNavBar from "../components/AppNavbar";

export default function AuthenticatedLayout() {

    const isAuthenticated = useUserStore((state) => state.isAuthenticated)

    if(!isAuthenticated) {
      return <Navigate to="/login" replace />;
    } 

    return <div>

        <AppNavBar />

        <main>
            <Outlet />
        </main>

    </div>
}