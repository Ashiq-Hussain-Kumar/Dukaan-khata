
import StatCard from "../components/StatCard"

import {ReceiptIndianRupee, TrendingDown, TrendingUp } from "lucide-react";
import currency from "../Utils/Currency";
import EmptyState from "../components/Emptystate"
import { useDataContext } from "../context/DataContext";

function Dashboard() {
  const{Transactions,Customers,totalSales,totalCollected, totalBalance}= useDataContext();
  const recentTransaction = [...Transactions].reverse().slice(0,6);

  
  
  return(<>
  <div>
      <h2 className="font-semibold text-[#111827] text-2xl tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Dashboard</h2>
      <p className="text-sm text-[#576379] mb-8">A quick look at how the shop is doing today</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={ReceiptIndianRupee} label={`Total sales`} value={totalSales} tone="indigo"/>
        <StatCard icon={TrendingUp} label={`Total Collected`} value={totalCollected} tone="green"/>
        <StatCard icon={TrendingDown} label={`Due Oustanding`} value={totalBalance} tone="rose"/>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
      <h2 className="text-b font-semibold text-[#111827] mb-4">Recent Transactions</h2>
      <div>
        
        
        {recentTransaction.map((t)=>{
         const customerBalance = Customers.find(
  (c) => String(c?.id) === String(t?.customerId)
)?.balance ?? 0;


          
          return(<div key={t?.id} className="flex justify-between items-center border-b border-[#f2f4f6] py-3 last:border-0 text-sm ">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-amber-50 rounded-full  flex items-center justify-center text-xs font-semibold shrink-0">
                {t?.customerName?.[0] ??"?"}              
              </div>
              <div>
                <p className="text-[#111827] font-medium">{t?.customerName ?? "Unknown"}</p>
                <p className="text-xs text-[#1a1f1e]">{t?.date}</p>
              </div>
            </div>
            <div className="text-right">
                  <p className="text-[#111827] font-medium tabular-nums">{t?.type}: {currency( t?.amount)}</p>
                  <p className={`text-xs font-medium ${customerBalance > 0 ? "text-[#E11D48]" : "text-[#16A34A]"}`}>
                    {customerBalance > 0 ? `Balance ${currency(customerBalance)}` : "settled"}
                  </p>
                </div>
           </div>)
        })}{Transactions.length === 0 && <EmptyState text="No Transactions yet" />}
      </div>
    </div>
  </>
    
  );
}

export default Dashboard;