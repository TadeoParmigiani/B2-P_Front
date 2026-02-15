import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router";
import { observeUser, getAuthState } from "./features/authSlice";
import type { AppDispatch } from "./store/store";
import PrivateRoute from "./components/privateRoute/PrivateRouter";
import App from "./App";
import { LoginForm } from "./pages/login/login";
import ErrorPage from "./components/ErrorPage";
import {FieldsPage}from "./pages/fields/index";
import { BookingsPage } from "./pages/bookings";

import Layout from "./Layout";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
     children: [
       {
         index: true,
         Component: App,
         errorElement: <ErrorPage />,
       },
       {
        path: "filds",         
        Component: FieldsPage, 
        errorElement: <ErrorPage />,
        },
       {
        path: "reservas",
        Component: BookingsPage,
        errorElement: <ErrorPage />,
       },
     ],
  },
  {
      path: "/login",
      element: <LoginForm />,
  },
]);

export const AppWithObserver = () => {
   const dispatch = useDispatch<AppDispatch>();
   const { loading } = useSelector(getAuthState);

   useEffect(() => {
     dispatch(observeUser());
   }, [dispatch]);

   if (loading) {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A80C7] mx-auto mb-4"></div>
           <p className="text-gray-600">Cargando...</p>
         </div>
       </div>
     );
   }
  return <RouterProvider router={router} />;
};
