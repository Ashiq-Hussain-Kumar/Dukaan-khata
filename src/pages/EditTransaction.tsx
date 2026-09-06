
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

type ItemRefs = Record<string, HTMLInputElement | null>;

type SaleReturnField =
  | "reason"
  | "addItem"
  | "delete"
  | "name"
  | "quantity"
  | "unitPrice";

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

  const {
    Customers,
    setCustomers,
    setTransactions,
  } = useDataContext();

  const [editedTransaction, setEditedTransaction] =
    useState<Transaction>({
      ...transaction,
      items: transaction.items ?? [],
    });

  const [snackbar, setSnackbar] = useState("");

  const customerRef =
    useRef<HTMLSelectElement | null>(null);

  const dateRef =
    useRef<HTMLInputElement | null>(null);

  const paymentRef =
    useRef<HTMLInputElement | null>(null);

  const itemRef =
    useRef<ItemRefs>({});

  const unitPriceRef =
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

  function handelSaleReturn(
    id: string | null,
    field: SaleReturnField,
    value: string |null
  ) {
    // ADD ITEM
    if (field === "addItem") {
      if (id === null) return;

      setEditedTransaction((prev) => ({
        ...prev,
        items: [
          ...(prev.items ?? []),
          {
            id,
            name: "",
            quantity: 1,
            unitPrice: 0,
            total: 0,
          },
        ],
      }));

      return;
    }

    // RETURN REASON
    if (field === "reason") {
      if (value === null ) return;

      setEditedTransaction((prev) => ({
        ...prev,
        return: {
          reason: value,
        },
      }));

      return;
    }

    // DELETE ITEM
    if (field === "delete") {
      if (id === null) return;

      setEditedTransaction((prev) => ({
        ...prev,
        items: (prev.items ?? []).filter(
          (item) => item.id !== id
        ),
      }));

      return;
    }

    // OTHER ITEM FIELDS
    if (id === null || value === null) {
      return;
    } else{
      
    }

    setEditedTransaction((prev) => ({
      ...prev,
      items: (prev.items ?? []).map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (field === "name" && typeof(value) !== "number") {
          return {
            ...item,
            name: value,
          };
        }

        if (field === "quantity") {
          return {
            ...item,
            quantity: Number(value),
          };
        }

        if (field === "unitPrice") {
          return {
            ...item,
            unitPrice: Number(value),
          };
        }

        return item;
      }),
    }));
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

  function handleSubmit(
    e: React.SubmitEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const error =
      hasTransactionValidationError(
        editedTransaction
      );

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

    if (error) {
      showSnackbar(error.message);

      if (error.type === "NO_ITEMS") {
        focusField(addItemRef);
        return;
      }

      if (error.type === "ITEM_NAME") {
        itemRef.current[error.itemId]?.scrollIntoView();
        itemRef.current[error.itemId]?.focus();
        return;
      }

      if (error.type === "PAYMENT_AMOUNT") {
        focusField(paymentRef);
        return;
      }

      if (error.type === "UNIT_PRICE") {
        unitPriceRef.current[
          error.itemId
        ]?.scrollIntoView();

        unitPriceRef.current[
          error.itemId
        ]?.focus();

        return;
      }
    }

    const finalAmount =
      editedTransaction.type === "PAYMENT"
        ? Number(editedTransaction.amount)
        : (editedTransaction.items ?? []).reduce(
          (sum, item) =>
            sum +
            Number(item.quantity) *
            Number(item.unitPrice),
          0
        );

    const oldAmount =
      Number(transaction.amount) || 0;

    const sign =
      transaction.type === "SALE"
        ? 1
        : -1;

    const customerChanged =
      customer.id !== editedTransaction.customerId;

    if (customerChanged) {
      const newCustomer = Customers.find(
        (c) =>
          c.id === editedTransaction.customerId
      );

      if (!newCustomer) {
        showSnackbar(
          "Selected customer not found; aborting balance update."
        );

        return;
      }

      const newBalanceOldC =
        (customer.balance ?? 0) -
        sign * oldAmount;

      const newBalanceNewC =
        (newCustomer.balance ?? 0) +
        sign * finalAmount;

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customer.id) {
            return {
              ...c,
              balance: newBalanceOldC,
            };
          }

          if (c.id === newCustomer.id) {
            return {
              ...c,
              balance: newBalanceNewC,
            };
          }

          return c;
        })
      );
    } else if (finalAmount !== oldAmount) {
      const delta =
        finalAmount - oldAmount;

      const newBalance =
        (customer.balance ?? 0) +
        sign * delta;

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? {
              ...c,
              balance: newBalance,
            }
            : c
        )
      );
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editedTransaction.id
          ? {
            ...editedTransaction,
            amount: finalAmount,
          }
          : t
      )
    );

    navigate(`/customers/${customer.id}`);
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
              unitPriceRef={unitPriceRef}
              addItemRef={addItemRef}
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
              type="submit"
              className="bg-[#4F46E5] text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:bg-[#4338CA] transition"
            >
              Save Transaction
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

  const {
    Transactions,
    Customers,
  } = useDataContext();

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
    <EditTransactionForm
      transaction={oldTransaction}
      customer={customer}
    />
  );
}

export default EditTransactions;
