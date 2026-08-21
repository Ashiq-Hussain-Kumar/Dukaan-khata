import { Routes, Route } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import Sidebar from "../src/components/Sidebar";
import "./app.css";
import { DataProvider } from "./context/DataContext";
import Customers from "../src/pages/Customers";
import Sales from "../src/pages/Sales";
import Customer from "../src/pages/CustomerDetail";
import EditTransactions from "../src/pages/EditTransaction";
import NewTransaction from "../src/pages/NewTransaction";
import ViewTransaction from "../src/pages/ViewTransaction";
import { Menu } from "lucide-react";
import { useState } from "react";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DataProvider>
      <div className="min-h-screen w-full flex bg-[#F7F8FB]">

        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/30"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 lg:ml-60">
          <div className="lg:hidden mb-8">
            <button
              type="button"
              aria-label="Open navigation"
              className="
                w-10 h-10
                flex items-center justify-center
                rounded-lg
                bg-white
                border border-[#EDEEF2]
                text-[#111827]
                shadow-[0_1px_2px_rgba(16,24,40,0.05)]
                hover:bg-[#F7F8FB]
                transition-colors
              "
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} strokeWidth={2.2} />
            </button>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<Customer />} />
            <Route
              path="/EditTransaction/:transactionId"
              element={<EditTransactions />}
            />
            <Route
              path="/customers/:id/NewTransaction/:type"
              element={<NewTransaction />}
            />
            <Route
              path="/NewTransaction/:type"
              element={<NewTransaction />}
            />
            <Route
              path="/ViewTransaction/:id"
              element={<ViewTransaction />}
            />
            <Route path="/sales" element={<Sales />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;