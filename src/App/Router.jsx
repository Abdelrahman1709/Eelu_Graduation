import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
import Profile from "../Pages/dashboard/Profile";
import SignUp from "../Pages/public/SignUp"; // Standard import to fix context error
import GenderSelection from "../Pages/public/GenderSelection";
import Login from "../Pages/public/Login";
import ForgotPassword from "../Pages/public/ForgotPassword";
import ResetPasswordToken from "../Pages/public/ResetPasswordToken";

import MainLayout from "../layouts/MainLayout";
import NoFooterLayout from "../layouts/NoFooterLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

const PageNotFound = lazy(() => import("../components/PageNotFound"));

const LandingPage = lazy(() => import("../Pages/public/LandingPage"));
const PublicWardrobe = lazy(
  () => import("../Pages/public/main/Wardrobe/PublicWardrobe"),
);
const EditProfile = lazy(() => import("../Pages/dashboard/EditProfile"));
const Wardrob = lazy(() => import("../Pages/dashboard/Wardrob"));
const TryOn = lazy(() => import("../Pages/dashboard/TryOn"));

export const router = createBrowserRouter([
  {
    element: <MainLayout />, 
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "home",
        element: <Navigate to="/" />,
      },
      {
        path: "gender-selection",
        element: <GenderSelection />,
      },
      {
        path: "MainWardrobe",
        element: <PublicWardrobe />,
      },
      {
        path: "tryon",
        element: <Navigate to="/features/tryOn" replace />,
      },
      {
        path: "profile-user",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/features",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Outlet />
            </DashboardLayout>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/" replace />,
          },
          {
            path: "dashboard",
            element: <Navigate to="/profile-user" replace />,
          },
          {
            path: "profile",
            element: <Navigate to="/profile-user" replace />,
          },
          {
            path: "wardrobe",
            element: <Wardrob />,
          },
          {
            path: "tryOn",
            element: <TryOn />,
          },
          {
            path: "edit-profile",
            element: <EditProfile />,
          },
        ],
      },
    ],
  },
  {
    path: "signUp",
    element: (
      <NoFooterLayout>
        <SignUp />
      </NoFooterLayout>
    ),
  },
  {
    path: "login",
    element: (
      <NoFooterLayout>
        <Login />
      </NoFooterLayout>
    ),
  },
  {
    path: "resetPassword",
    element: <Navigate to="/forgot-password" replace />,
  },
  {
    path: "resetPassword/:token",
    element: <Navigate to="/reset-password/:token" replace />,
  },
{
  path: "forgot-password",
  element: <NoFooterLayout><ForgotPassword /></NoFooterLayout>,
},
{
  path: "reset-password/:token",
  element: <NoFooterLayout><ResetPasswordToken /></NoFooterLayout>,
},
  {
    path: "*",
    element: (
      <NoFooterLayout>
        <PageNotFound />
      </NoFooterLayout>
    ),
  },
]);
