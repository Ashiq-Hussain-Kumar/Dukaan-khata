import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Customers from "./pages/Customers";
import Sales from "./pages/Sales";
import Customer from "./pages/CustomerDetail";
import EditTransactions from "./pages/EditTransaction";
import NewTransaction from "./pages/NewTransaction";
import ViewTransaction from "./pages/ViewTransaction";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Products from "./pages/Product";


import "./app.css";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/Authcontext";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { PublicRoute } from "./components/PublicRoutes";
import VerifyEmail from "./pages/VerifyEmail";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
        <DataProvider>
          <ScrollToTop></ScrollToTop>
      <Routes>
        {/* Authentication pages — no sidebar */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<PublicRoute> <Register /></PublicRoute> } />
        <Route path="/login" element={<PublicRoute><Login /> </PublicRoute> } />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
        {/* Main application layout */}
        <Route
          path="/*"
          element={ <ProtectedRoute> <div className="flex min-h-screen w-full bg-[#F7F8FB]">
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
              />

              <main className="min-w-0 flex-1 p-4 sm:p-6 lg:ml-60 lg:p-8">
                <div className="mb-8 lg:hidden">
                  <button
                    type="button"
                    aria-label="Open navigation"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EDEEF2] bg-white text-[#111827] shadow-sm transition-colors hover:bg-[#F7F8FB]"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Menu size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <Routes>
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute> }
                  />
                  <Route
                    path="/customers"
                    element={<ProtectedRoute><Customers /> </ProtectedRoute> }
                  />
                  <Route
                    path="/customers/:id"
                    element={<ProtectedRoute><Customer /> </ProtectedRoute> }
                  />
                  <Route
                    path="/EditTransaction/:transactionId"
                    element={<ProtectedRoute><EditTransactions /></ProtectedRoute>}
                  />
                  <Route
                    path="/customers/:id/NewTransaction/:type"
                    element={<ProtectedRoute><NewTransaction /></ProtectedRoute>}
                  />
                  <Route
                    path="/NewTransaction/:type"
                    element={<ProtectedRoute><NewTransaction /></ProtectedRoute>}
                  />
                  <Route
                    path="/ViewTransaction/:id"
                    element={<ProtectedRoute><ViewTransaction /></ProtectedRoute>}
                  />
                  <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />

                  <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                </Routes>
              </main>
            </div> </ProtectedRoute>
           
          }
        />
      </Routes>
    </DataProvider>
    </AuthProvider>
  
  );
}

export default App;
