import {
    Navigate,
    Outlet,
    createBrowserRouter,
    useLocation,
} from "react-router-dom";
import { useUserStore } from "../store/user";

//
import AppLoginPage from '../views/LoginPage'

const PrivateRoutes = () => {
    const location = useLocation();
    const { isLoading, isAuthenticated, authenticateFromCookie } = useUserStore()

    if (isLoading) {
        authenticateFromCookie()
    }

    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace state={{ from: location }} />;
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRoutes />,
    },
    {
        path: "/login",
        element: <AppLoginPage />
    }
]);

export {
    router
}