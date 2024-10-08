import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Route,
  RouterProvider,
  BrowserRouter,
  Routes,
  useNavigate,
  Navigate,
  Outlet
} from "react-router-dom";
import './index.css'
import Login from './views/Login.tsx';
import Home from './views/Home.tsx';
import { useUserStore } from './stores/user.ts';
import AppLoadingPage from './components/AppLoadingPage.tsx';
import AddNewSite from './views/AddNewSite.tsx';


const ProtectedRoutes = () => {

  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  if(!isAuthenticated) {
    return <Navigate to="/login" replace />;
  } else {
    return <Outlet />;
  }
}

const SplashPage = ({ children }: { children: JSX.Element }) => {

  const isLoading = useUserStore(state => state.isLoading)
  const setIsLoading = useUserStore(state => state.setIsLoading)
  const isAuthenticated = useUserStore(state => state.isAuthenticated)
  const setUser = useUserStore(state => state.setUser)
  const token = useUserStore(state => state.token)

  useEffect(() => {
    setTimeout(() => {
      if (token) {
        setUser(token)
      } else if (window.location.href !== `${location.origin}/login`) {
        window.location.href = `${location.origin}/login`
      }
    }, 1250)
    setIsLoading(false)
    console.log(isLoading)
  }, [token])


  return <>
    {isLoading ? <AppLoadingPage /> : children}
  </>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SplashPage>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoutes />}>
              <Route path="/" element={<Home />} />
              <Route path="/add-new-site" element={<AddNewSite />} />
            </Route>
        </Routes>
      </BrowserRouter>
    </SplashPage>
  </StrictMode>
)
