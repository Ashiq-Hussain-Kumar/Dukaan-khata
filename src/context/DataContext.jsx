import { Children, useState, createContext, useEffect, useContext } from "react";
import { seedCustomers, seedTransactions } from "../data";


const CUSTOMERS_KEY = "savedCustomers";
const TRANSACTIONS_KEY = "savedTransactions";
const DataContext = createContext();


export function DataProvider({ children }) {
 
  const [Customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem(CUSTOMERS_KEY);

    return saved
      ? JSON.parse(saved)
      : seedCustomers;
  });

  const [Transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);

    return saved
      ? JSON.parse(saved)
      : seedTransactions;
  });


  // Save customers whenever they change
  useEffect(() => {
    localStorage.setItem(
      CUSTOMERS_KEY,
      JSON.stringify(Customers)
    );
  }, [Customers]);


  // Save transactions whenever they change
  useEffect(() => {
    localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(Transactions)
    );
  }, [Transactions]);

  const totalSales = Transactions?.filter((t) => t?.type === "SALE")?.reduce((sum, t) => sum + t.amount, 0);
  const totalCollected = Transactions?.filter(t => t?.type === "PAYMENT")?.reduce((sum, t) => sum + t?.amount, 0);
  const totalBalance = Customers?.reduce((sum, c) => sum += c.balance, 0);

  return (
    <DataContext.Provider value={{ Transactions, Customers, totalSales, totalCollected, totalBalance, setCustomers, setTransactions }}>
      {children}
    </DataContext.Provider>
  )

}

export const useDataContext = () => useContext(DataContext);