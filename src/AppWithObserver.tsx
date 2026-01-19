// import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import ErrorPage from "./components/ErrorPage";


import Layout from "./Layout";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
        <Layout />
    ),
     children: [
       {
         index: true,
         Component: App,
         errorElement: <ErrorPage />,
       },
    //   {
    //     path: "afiliados",
    //     Component: Afiliados,
    //     errorElement: <ErrorPage />,
    //   },
    //   {
    //     path: "eventos",
    //     Component: Eventos,
    //     errorElement: <ErrorPage />,
    //   },
    //   {
    //     path: "noticias",
    //     Component: Noticias,
    //     errorElement: <ErrorPage />,
    //   },
    //   {
    //     path: "backup",
    //     Component: Backup,
    //     errorElement: <ErrorPage />,
    //   },
     ],
  },
  {
    //  path: "/login",
    //  element: <Login />,
  },
]);

export const AppWithObserver = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { loading } = useSelector(getAuthState);

//   useEffect(() => {
//     dispatch(observeUser());
//   }, [dispatch]);

//   // Muestra un loading mientras verifica la autenticación
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A80C7] mx-auto mb-4"></div>
//           <p className="text-gray-600">Cargando...</p>
//         </div>
//       </div>
//     );
//   }

  return <RouterProvider router={router} />;
};