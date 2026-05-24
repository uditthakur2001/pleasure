import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { lazy, Suspense } from "react";

import { Navbar } from "@/components/layout/Navbar";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Distributor = lazy(() => import("./pages/Distributor"));
const Certifications = lazy(() => import("./pages/Certifications"));
const Careers = lazy(() => import("./pages/Careers"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
// const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const Terms = lazy(() => import("./pages/Terms"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const SeedProducts = lazy(() => import("./pages/SeedProducts"));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const adminLoggedIn = localStorage.getItem("adminLoggedIn");

  if (!isLoggedIn && !adminLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const adminLoggedIn = localStorage.getItem("adminLoggedIn");

  if (!adminLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

function EmployeeRoute({ children }: { children: JSX.Element }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Navbar />{" "}
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              Loading...
            </div>
          }
        >
          {" "}
          <Routes>
            {/* Public Website Layout */}
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />

              <Route path="/about" element={<About />} />

              <Route path="/products" element={<Products />} />

              <Route path="/products/:slug" element={<ProductDetail />} />

              <Route path="/contact" element={<Contact />} />

              <Route path="/distributor" element={<Distributor />} />

              <Route path="/certifications" element={<Certifications />} />

              <Route path="/careers" element={<Careers />} />
            </Route>

            <Route path="/seed-products" element={<SeedProducts />} />

            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <EmployeeRoute>
                  <Dashboard />
                </EmployeeRoute>
              }
            />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/signup" element={<Signup />} /> */}

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
