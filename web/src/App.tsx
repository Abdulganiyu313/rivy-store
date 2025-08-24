import { lazy, Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider";
import Header from "./components/Header";
import Loader from "./components/Loader";
import Footer from "./components/Footer";

const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

export default function App() {
  const element = useRoutes([
    { path: "/", element: <Navigate to="/catalog" replace /> },
    { path: "/catalog", element: <Catalog /> },
    { path: "/products/:id", element: <Product /> },
    { path: "/cart", element: <Cart /> },
    { path: "/confirmation", element: <Confirmation /> },
    { path: "/checkout-success", element: <CheckoutSuccess /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    {
      path: "*",
      element: (
        <div className="container" style={{ padding: "48px 0" }}>
          Not found
        </div>
      ),
    },
  ]);

  return (
    <ToastProvider>
      <Header />
      <Suspense fallback={<Loader full />}>{element}</Suspense>
      <Footer />
    </ToastProvider>
  );
}
