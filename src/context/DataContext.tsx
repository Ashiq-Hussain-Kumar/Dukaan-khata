import React, { useState, createContext, useEffect, useContext } from "react";
import { seedCustomers, seedTransactions } from "../data";
import type { Customer, Transaction } from "../types";

interface DataProviderType{
  children:React.ReactNode
}
interface DataContextType{
  Transactions:Transaction[],
  Customers:Customer[],
  totalSales:number,
  totalCollected:number,
  totalBalance:number
  setCustomers:React.Dispatch<React.SetStateAction<Customer[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>

}
const CUSTOMERS_KEY = "savedCustomers";
const TRANSACTIONS_KEY = "savedTransactions";
const DataContext = createContext<DataContextType|null>(null);


export function DataProvider({ children }:DataProviderType) {
 
  const [Customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(CUSTOMERS_KEY);

    return saved
      ? JSON.parse(saved)
      : seedCustomers;
  });

  const [Transactions, setTransactions] = useState<Transaction[]>(() => {
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

export const useDataContext = ():DataContextType=>{
  const context = useContext(DataContext)
  if(context === null){
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}