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
import AuthenticatedLayout from './layouts/AuthenticatedLayout.tsx';
import EditPage from './views/EditPage.tsx';

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
  }, [isAuthenticated])


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
          <Route path="/" element={<AuthenticatedLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/add-new-site" element={<AddNewSite />} />
              <Route path="/sites/:siteId/edit" element={<EditPage />} />
            </Route>
        </Routes>
      </BrowserRouter>
    </SplashPage>
  </StrictMode>
)
