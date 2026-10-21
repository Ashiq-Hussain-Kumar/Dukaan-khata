
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDataContext } from "../context/DataContext";
import { ArrowLeft } from "lucide-react";
import React, { useState, useRef, } from "react";
import PaymentSection from "../components/PaymentSection";
import SaleReturnSection from "../components/SaleReturnSection";
import { focusField } from "../utils/focusField";
import { hasTransactionValidationError } from "../utils/TransactionValidationError";
import Snackbar from "../components/SnackBar";
import type { Transaction, Customer } from "../types";
import { api, ApiRequestError } from "../utils/api";

type ItemRefs = Record<string, HTMLSelectElement | null>;
type SaleReturnField = "reason" | "addItem" | "delete" | "product" | "quantity";

type PaymentField =
  | "amount"
  | "method"
  | "reference"
  | "receivedBy";

type TopLevelField =
  | "customerId"
  | "date"
  | "note";

interface EditTransactionFormProps {
  transaction: Transaction;
  customer: Customer;
}

function EditTransactionForm({
  transaction,
  customer,
}: EditTransactionFormProps) {
  const navigate = useNavigate();

  const { Customers, Products, refreshData } = useDataContext();

  const [editedTransaction, setEditedTransaction] =
    useState<Transaction>({
      ...transaction,
      items: transaction.items ?? [],
    });

  const [snackbar, setSnackbar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const customerRef =
    useRef<HTMLSelectElement | null>(null);

  const dateRef =
    useRef<HTMLInputElement | null>(null);

  const paymentRef =
    useRef<HTMLInputElement | null>(null);

  const itemRef =
    useRef<ItemRefs>({});

  const addItemRef =
    useRef<HTMLButtonElement | null>(null);

  const snackbarTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  function showSnackbar(message: string) {
    setSnackbar(message);

    if (snackbarTimer.current !== null) {
      clearTimeout(snackbarTimer.current);
    }

    snackbarTimer.current = setTimeout(() => {
      setSnackbar("");
    }, 3000);
  }

  function handelSaleReturn(rowId: string | null, field: SaleReturnField, value: string | null) {
  if (field === "addItem") {
    if (rowId === null) return;
    setEditedTransaction((prev) => ({
      ...prev,
      items: [...(prev.items ?? []), { id: rowId, productId: "", name: "", quantity: 1, unitPrice: 0 }],
    }));
    return;
  }

  if (field === "reason") {
    if (value === null) return;
    setEditedTransaction((prev) => ({ ...prev, return: { reason: value } }));
    return;
  }

  if (field === "delete") {
    if (rowId === null) return;
    setEditedTransaction((prev) => ({
      ...prev,
      items: (prev.items ?? []).filter((item) => item.id !== rowId),
    }));
    return;
  }

  if (rowId === null || value === null) return;

  if (field === "product") {
    const product = Products.find((p) => p.id === value);
    // A product that was already in this transaction keeps its old price.
    // The server does the same, so the screen matches what will be saved.
    const original = (transaction.items ?? []).find((i) => i.productId === value);

    setEditedTransaction((prev) => ({
      ...prev,
      items: (prev.items ?? []).map((item) =>
        item.id === rowId
          ? {
              ...item,
              productId: product?.id ?? "",
              name: product?.name ?? "",
              unitPrice: original?.unitPrice ?? product?.price ?? 0,
            }
          : item
      ),
    }));
    return;
  }

  if (field === "quantity") {
    setEditedTransaction((prev) => ({
      ...prev,
      items: (prev.items ?? []).map((item) =>
        item.id === rowId ? { ...item, quantity: Number(value) } : item
      ),
    }));
  }
}

  function handlePayments(
    field: PaymentField,
    value: string
  ) {
    // PAYMENT AMOUNT
    if (field === "amount") {
      setEditedTransaction((prev) => ({
        ...prev,
        amount: Number(value),
      }));

      return;
    }

    // PAYMENT OBJECT SHOULD EXIST
    if (editedTransaction.payment === null) {
      return;
    }

    // METHOD
    if (field === "method") {
      if (
        value !== "Cash" &&
        value !== "UPI" &&
        value !== "Card" &&
        value !== "Bank Transfer"
      ) {
        return;
      }

      setEditedTransaction((prev) => ({
        ...prev,
        payment: {
          ...prev.payment!,
          method: value,
        },
      }));

      return;
    }

    // REFERENCE
    if (field === "reference") {
      setEditedTransaction((prev) => ({
        ...prev,
        payment: {
          ...prev.payment!,
          reference: value,
        },
      }));

      return;
    }

    // RECEIVED BY
    if (field === "receivedBy") {
      setEditedTransaction((prev) => ({
        ...prev,
        payment: {
          ...prev.payment!,
          receivedBy: value,
        },
      }));
    }
  }

  function handleTopLevelField(
    field: TopLevelField,
    value: string
  ) {
    if (field === "customerId") {
      const selectedCustomer = Customers.find(
        (c) => String(c.id) === String(value)
      );

      if (!selectedCustomer) {
        return;
      }

      setEditedTransaction((prev) => ({
        ...prev,
        customerId: value,
        customerName: selectedCustomer.name,
      }));

      return;
    }

    if (field === "date") {
      setEditedTransaction((prev) => ({
        ...prev,
        date: value,
      }));

      return;
    }

    if (field === "note") {
      setEditedTransaction((prev) => ({
        ...prev,
        note: value,
      }));
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
  e.preventDefault();
  if (isSaving) return;

  if (!editedTransaction.customerId) {
    showSnackbar("Please select a customer.");
    focusField(customerRef);
    return;
  }

  if (!editedTransaction.date) {
    showSnackbar("Please select a date.");
    focusField(dateRef);
    return;
  }

  const error = hasTransactionValidationError(editedTransaction);
  if (error) {
    showSnackbar(error.message);
    if (error.type === "NO_ITEMS") focusField(addItemRef);
    if (error.type === "ITEM_NAME") {
      itemRef.current[error.itemId]?.scrollIntoView();
      itemRef.current[error.itemId]?.focus();
    }
    if (error.type === "PAYMENT_AMOUNT") focusField(paymentRef);
    return;
  }

  const isPayment = editedTransaction.type === "PAYMENT";

  if (isPayment) {
    if (!editedTransaction.payment?.receivedBy.trim()) {
      showSnackbar("Please enter who received the payment.");
      return;
    }
  } else {
    const wanted = new Map<string, number>();
    for (const item of editedTransaction.items ?? []) {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        showSnackbar("Enter a quantity greater than 0.");
        return;
      }
      const key = item.productId ?? "";
      wanted.set(key, (wanted.get(key) ?? 0) + item.quantity);
    }

    if (editedTransaction.type === "SALE") {
      const original = transaction.items ?? [];
      for (const [productId, qty] of wanted) {
        const p = Products.find((x) => x.id === productId);
        if (!p) continue;   // a removed product: the server decides
        const back = original
          .filter((i) => i.productId === productId)
          .reduce((sum, i) => sum + i.quantity, 0);
        if (qty > p.stock + back) {
          showSnackbar(`Only ${p.stock + back} ${p.unit} of ${p.name} available.`);
          return;
        }
      }
    }
  }

  // The server rejects fields that don't belong to the type, so send only the right ones.
  const body = isPayment
    ? {
        customerId: editedTransaction.customerId,
        date: editedTransaction.date,
        note: editedTransaction.note.trim(),
        amount: Number(editedTransaction.amount),
        payment: {
          method: editedTransaction.payment?.method,
          reference: editedTransaction.payment?.reference.trim() || "By Self",
          receivedBy: editedTransaction.payment?.receivedBy.trim(),
        },
      }
    : {
        customerId: editedTransaction.customerId,
        date: editedTransaction.date,
        note: editedTransaction.note.trim(),
        items: (editedTransaction.items ?? []).map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
        ...(editedTransaction.type === "RETURN"
          ? { returnInfo: { reason: editedTransaction.return?.reason } }
          : {}),
      };

  setIsSaving(true);
  try {
    await api.patch(`/transactions/${editedTransaction.id}`, body);
    await refreshData();
    // go to the customer the transaction belongs to now
    navigate(`/customers/${editedTransaction.customerId}`);
  } catch (err) {
    showSnackbar(err instanceof ApiRequestError ? err.message : "Could not save the transaction");
  } finally {
    setIsSaving(false);
  }
}

  const typeStyles = {
    SALE: "bg-[#EBFBEF] text-[#16A34A]",
    PAYMENT: "bg-[#EEF0FF] text-[#4F46E5]",
    RETURN: "bg-[#FFEEF1] text-[#E11D48]",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link
        to={`/customers/${customer.id}`}
        className="inline-flex items-center gap-2 text-[#4F46E5] font-medium hover:text-[#4338CA] transition mb-6"
      >
        <ArrowLeft
          size={18}
          strokeWidth={2.5}
        />

        Back to {customer.name}
      </Link>

      <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#F1F2F6] bg-[#F7F8FB]">
          <div>
            <h1
              className="text-2xl font-semibold text-[#111827] tracking-tight"
              style={{
                fontFamily:
                  "'Space Grotesk', sans-serif",
              }}
            >
              Edit Transaction
            </h1>

            <p className="text-sm text-[#8A8F98] mt-1">
              Update the details below.
            </p>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${typeStyles[transaction.type]}`}
          >
            {transaction.type}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Customer
              </label>

              <select
                ref={customerRef}
                value={editedTransaction.customerId}
                onChange={(e) =>
                  handleTopLevelField(
                    "customerId",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
              >
                {Customers.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Date
              </label>

              <input
                type="date"
                ref={dateRef}
                value={editedTransaction.date}
                onChange={(e) =>
                  handleTopLevelField(
                    "date",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
              />
            </div>
          </div>

          {editedTransaction.type === "PAYMENT" ? (
            <PaymentSection
              transaction={editedTransaction}
              handlePayments={handlePayments}
              paymentRef={paymentRef}
            />
          ) : (
            <SaleReturnSection
  transaction={editedTransaction}
  handelSaleReturn={handelSaleReturn}
  itemRef={itemRef}
  addItemRef={addItemRef}
  originalItems={transaction.items}
/>
          )}

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Note
            </label>

            <textarea
              rows={3}
              value={editedTransaction.note}
              onChange={(e) =>
                handleTopLevelField(
                  "note",
                  e.target.value
                )
              }
              placeholder="Add any additional notes..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none resize-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#F1F2F6]">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/customers/${customer.id}`
                )
              }
              className="border border-[#E5E7EB] text-[#111827] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-[#F7F8FB] transition"
            >
              Cancel
            </button>

            <button 
            disabled={isSaving}
              type="submit"
              className="bg-[#4F46E5] text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:bg-[#4338CA] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
             {isSaving ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </form>

        {snackbar && (
          <Snackbar
            message={snackbar}
            onClose={() => setSnackbar("")}
          />
        )}
      </div>
    </div>
  );
}

function EditTransactions() {
  const { transactionId } = useParams();

  const { Transactions, Customers, isDataLoading } = useDataContext();

  const oldTransaction = Transactions.find(
    (t) =>
      String(t.id) === String(transactionId)
  );

  const customer = Customers.find(
    (c) =>
      String(c.id) ===
      String(oldTransaction?.customerId)
  );

  const isInvalid =
    !oldTransaction || !customer;

  if (isInvalid) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-sm text-[#8A8F98] mb-4">
          Transaction not found.
        </p>

        <Link
          to="/customers"
          className="text-[#4F46E5] font-medium hover:text-[#4338CA]"
        >
          ← Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <>{isDataLoading ? "Loading..." : "Transaction not found."}
    <EditTransactionForm
      transaction={oldTransaction}
      customer={customer}
    />
    </>
    
  );
}

export default EditTransactions;
