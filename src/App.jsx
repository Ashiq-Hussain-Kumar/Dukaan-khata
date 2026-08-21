import { Routes, Route } from "react-router-dom";
import Dashboard from '../src/pages/Dashboard';
import Sidebar from '../src/components/Sidebar';
import "./app.css";
import { DataProvider } from './context/DataContext';
import Customers from "../src/pages/Customers";
import Sales from "../src/pages/Sales";

import Customer from "../src/pages/CustomerDetail";
import EditTransactions from "../src/pages/EditTransaction";
import NewTransaction from "../src/pages/NewTransaction";
import ViewTransaction from "../src/pages/ViewTransaction"
function App() {
  return(
    <DataProvider>
      <div className="min-h-screen w-full flex bg-[#F7F8FB]">
        <Sidebar/>
        
        <main className='flex-1 p-8 max-w-8xl pl-64'> 
          <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/customers" element={<Customers/>}/>
           <Route path="/customers/:id" element={<Customer/>} />
          
           <Route path="/EditTransaction/:transactionId" element={<EditTransactions/>}/>
           <Route path="/customers/:id/NewTransaction/:type" element={<NewTransaction/>}/>
            <Route path="/NewTransaction/:type" element={<NewTransaction/>}/>
            <Route path="/ViewTransaction/:id" element={<ViewTransaction/>}/>


          <Route path="/sales" element={<Sales/>}/>

        </Routes>
        </main>
      </div>
    </DataProvider>
  );
}

export default App