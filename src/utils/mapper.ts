import type { Customer, Product, Transaction } from "../types";

// What the backend sends
export type ApiCustomer = {
  _id: string; name: string; phone: string; address: string; balance?: number;
};
export type ApiProduct = {
  _id: string; name: string; category?: string; price: number; stock: number; unit: string;
};
export type ApiItem = {
  productId: string; name: string; quantity: number; unitPrice: number; total: number;
};
export type ApiTransaction = {
  _id: string; customerId: string; customerName?: string;
  type: Transaction["type"]; amount: number; date?: string; createdAt: string; note?: string;
  items?: ApiItem[]; payment?: Transaction["payment"]; returnInfo?: Transaction["return"];
};

// "2026-10-05T00:00:00.000Z" becomes "2026-10-05" (the format your pages already use)
const toDateString = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toCustomer = (c: ApiCustomer): Customer => ({
  id: c._id,
  name: c.name,
  phone: c.phone,
  address: c.address,
  balance: c.balance ?? 0,
});

export const toProduct = (p: ApiProduct): Product => ({
  id: p._id,
  name: p.name,
  category: p.category,
  price: p.price,
  stock: p.stock,
  unit: p.unit,
});

export const toTransaction = (t: ApiTransaction): Transaction => ({
  id: t._id,
  customerId: t.customerId,
  customerName: t.customerName ?? "Unknown",
  date: toDateString(t.date ?? t.createdAt),
  type: t.type,
  amount: t.amount,
  note: t.note ?? "",
  items: (t.items ?? []).map((i, index) => ({
    id: `${i.productId}-${index}`,   // unique row key, in case a product appears twice
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    total: i.total,
  })),
  payment: t.payment ?? null,
  return: t.returnInfo ?? null,
});