import {
    Navigate,
    Outlet,
    createBrowserRouter,
    useLocation,
} from "react-router-dom";
import { useUserStore } from "../store/user";

//
import LoginPage from '../views/LoginPage'
import SignUpPage from "../views/SignUpPage";
import HomePage from "../views/HomePage";
import SiteEditPage from "../views/SiteEditPage";

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
        children: [
            {
                path: "",
                element: <HomePage />
            },
            {
                path: "site/:siteId/",
                children: [
                    {
                        path: "edit/:templateId",
                        element: <SiteEditPage />
                    }
                ]
            }
        ]
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/signup",
        element: <SignUpPage />
    }
]);

export {
    router
}