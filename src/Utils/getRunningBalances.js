export function getRunningBalances(customerTransactions) {
  const sorted = [...customerTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.map((t, index) => {
    const upToHere = sorted.slice(0, index + 1);
    const balance = upToHere.reduce((sum, tr) => {
      if (tr.type === "SALE") return sum + tr.amount;
      if (tr.type === "PAYMENT" || tr.type === "RETURN") return sum - tr.amount;
      return sum;
    }, 0);
    return { ...t, runningBalance: balance };
  });
}