import type { Transaction } from "../types";

interface WithRunningBalance extends Transaction {
  runningBalance: number;
}

export function getRunningBalances(customerTransactions: Transaction[]): WithRunningBalance[] {
  
  const sorted = [...customerTransactions].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );

  let balance = 0;

  return sorted.map((t) => {
    if (t.type === "SALE") {
      balance += t.amount;
    } else {
      balance -= t.amount; // PAYMENT and RETURN
    }
    balance = Math.round(balance * 100) / 100;

    return { ...t, runningBalance: balance };
  });
}