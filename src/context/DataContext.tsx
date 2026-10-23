import React, { useState, createContext, useEffect, useContext, useCallback } from "react";
import type { Customer, Product, Transaction } from "../types";
import { api, ApiRequestError } from "../utils/api";
import { useAuthContext } from "./Authcontext";
import { toCustomer, toProduct,toTransaction, ApiCustomer,ApiProduct,  ApiTransaction } from "../utils/mapper";

interface DataProviderType {
  children: React.ReactNode;
}

interface DataContextType {
  Transactions: Transaction[];
  Customers: Customer[];
  Products: Product[];
  totalSales: number;
  totalCollected: number;
  totalBalance: number;
  isDataLoading: boolean;
  dataError: string;
  refreshData: () => Promise<void>;
  
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: DataProviderType) {
  const { isAuthenticated,logout } = useAuthContext();

  const [Customers, setCustomers] = useState<Customer[]>([]);
  const [Products, setProducts] = useState<Product[]>([]);
  const [Transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
 
  const refreshData = useCallback(async () => {
    setIsDataLoading(true);
    setDataError("");
    try {
      // three requests at the same time
      const [customersRes, productsRes, transactionsRes] = await Promise.all([
        api.get<{ customers: ApiCustomer[] }>("/customers/get-customers"),
        api.get<{ products: ApiProduct[] }>("/products/get-products"),
        api.get<{ transactions: ApiTransaction[] }>("/transactions"),
      ]);
       


      setCustomers(customersRes.customers.map(toCustomer));
      setProducts(productsRes.products.map(toProduct));
      // The backend sends newest first, but your pages assume oldest first
      // (Dashboard does reverse().slice(0, 6)). We fix the pages later (step 13).
      setTransactions(transactionsRes.transactions.map(toTransaction).reverse());
    }  catch (error) {
  if (error instanceof ApiRequestError && error.status === 401) {
    logout();   // the route guard sends the user to /login
    return;
  }
  setDataError(error instanceof Error ? error.message : "Could not load data");
}finally {
      setIsDataLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      // logged out: forget everything
      setCustomers([]);
      setProducts([]);
      setTransactions([]);
    }
  }, [isAuthenticated, refreshData]);

  const totalSales = Transactions.filter((t) => t.type === "SALE").reduce((sum, t) => sum + t.amount, 0);
  const totalCollected = Transactions.filter((t) => t.type === "PAYMENT").reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = Customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <DataContext.Provider
      value={{
        Transactions, Customers, Products,
        totalSales, totalCollected, totalBalance,
        isDataLoading, dataError, refreshData,
        
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};