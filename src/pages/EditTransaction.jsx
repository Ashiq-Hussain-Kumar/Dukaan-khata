import { useParams, useNavigate, Link } from "react-router-dom";
import { useDataContext } from "../context/DataContext";
import { ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import PaymentSection from "../components/PaymentSection";
import SaleReturnSection from "../components/SaleReturnSection";
import { focusField } from "../Utils/focusField";
import { hasTransactionValidationError } from "../Utils/TransationValidationError";
import Snackbar from "../components/snackBar";


function EditTransactions() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { Transactions, Customers, setCustomers, setTransactions } = useDataContext();
  const oldTransaction = Transactions.find((t) => String(t.id) === String(transactionId));
  const customer = Customers.find((c) => String(c?.id) === String(oldTransaction?.customerId));

  const editingTransaction = {
    id: oldTransaction?.id ?? null,
    customerId: oldTransaction?.customerId ?? null,
    customerName: oldTransaction?.customerName ?? null,
    date: oldTransaction?.date ?? null,
    type: oldTransaction?.type ?? null,
    amount: oldTransaction?.amount ?? null,
    balance: oldTransaction?.balance ?? null,
    note: oldTransaction?.note ?? null,
    items: oldTransaction?.items ?? [],
    payment: oldTransaction?.payment ?? null,
    return: oldTransaction?.return ?? null,
  };

  const [editedTransaction, setEditedTransaction] = useState(editingTransaction);
  const [snackbar, setSnackbar] = useState("");

  const customerRef = useRef(null);
  const dateRef = useRef(null);
  const paymentRef = useRef(null);
  const itemRef = useRef({});
  const unitPriceRef = useRef({});
  const addItemRef = useRef(null);
  const snackbarTimer = useRef(null);


  const isInvalid = !oldTransaction || !customer;

  if (isInvalid) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-sm text-[#8A8F98] mb-4">Transaction not found.</p>
        <Link to="/customers" className="text-[#4F46E5] font-medium hover:text-[#4338CA]">
          ← Back to Customers
        </Link>
      </div>
    );
  }


  function showSnackbar(message) {
    setSnackbar(message);

    clearTimeout(snackbarTimer.current);

    snackbarTimer.current = setTimeout(() => {
      setSnackbar("");
    }, 3000);
  }

  function handelSaleReturn(id, field, value) {

    if (field === "addItem") {
      setEditedTransaction((prev) => ({
        ...prev,
        items: [...prev.items, { id, name: "", quantity: 1, unitPrice: 0 }],
      }));
    } else if (field === "reason") {
      setEditedTransaction((prev) => ({ ...prev, return: { reason: value } }));
    } else if (field === "delete") {
      setEditedTransaction((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it?.id !== id),
      }));
    } else {

      setEditedTransaction((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i?.id === id ? { ...i, [field]: value, } : i)),
      }));
    }



  }

  function handlePayments(field, value) {
    if (field !== "amount") {
      setEditedTransaction((prev) => ({
        ...prev,
        payment: { ...prev.payment, [field]: value },
      }));
    } else {
      setEditedTransaction((prev) => ({ ...prev, amount: value }));
    }
  }





  function handleTopLevelField(field, value) {
    if (field === "customerId") {
      const customerName = Customers.find((c) => String(c?.id) === String(value))?.name;
      setEditedTransaction((prev) => ({ ...prev, customerId: value, customerName }));
    } else {
      setEditedTransaction((prev) => ({ ...prev, [field]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const error = hasTransactionValidationError(editedTransaction);

    if (!editedTransaction?.customerId) {
      showSnackbar("Please select a customer.");
      focusField(customerRef);
      return;
    }

    if (!editedTransaction?.date) {
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
        itemRef.current[error?.itemId]?.scrollIntoView();
        itemRef.current[error.itemId]?.focus();
        return;
      }

      if (error.type === "PAYMENT_AMOUNT") {
        focusField(paymentRef);
        return;
      }

      if (error.type === "UNIT_PRICE") {
        unitPriceRef.current[error?.itemId]?.scrollIntoView();
        unitPriceRef.current[error?.itemId]?.focus();
        return;
      }
    }



    const finalAmount =
      editedTransaction.type === "PAYMENT"
        ? Number(editedTransaction?.amount)
        : editedTransaction?.items.reduce(
          (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
          0
        );

    const oldAmount = Number(oldTransaction?.amount) || 0;
    
    // SALE increases balance owed; PAYMENT/RETURN decreases it.
    const sign = oldTransaction?.type === "SALE" ? 1 : -1;

    const customerChanged = String(customer?.id) !== String(editedTransaction?.customerId);

    if (customerChanged) {
      const newCustomer = Customers.find(
        (c) => String(c?.id) === String(editedTransaction?.customerId)
      );

      if (!newCustomer) {
        showSnackbar("Selected customer not found; aborting balance update.");
        return;
      }

      const newBalanceOldC = (customer?.balance ?? 0) - sign * oldAmount;
      const newBalanceNewC = (newCustomer.balance ?? 0) + sign * finalAmount;

      setCustomers((prev) =>
        prev.map((c) => {
          if (c?.id === customer?.id) return { ...c, balance: newBalanceOldC };
          if (c?.id === newCustomer.id) return { ...c, balance: newBalanceNewC };
          return c;
        })
      );
    } else if (finalAmount !== oldAmount) {
      const delta = finalAmount - oldAmount;
      const newBalance = (customer?.balance ?? 0) + sign * delta;

      setCustomers((prev) =>
        prev.map((c) => (c?.id === customer?.id ? { ...c, balance: newBalance } : c))
      );
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t?.id === editedTransaction?.id ? { ...editedTransaction, amount: finalAmount } : t
      )
    );

    navigate(`/customers/${customer?.id}`);
  }

  const typeStyles = {
    SALE: "bg-[#EBFBEF] text-[#16A34A]",
    PAYMENT: "bg-[#EEF0FF] text-[#4F46E5]",
    RETURN: "bg-[#FFEEF1] text-[#E11D48]",
  };

  return (

    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link
        to={`/customers/${customer?.id}`}
        className="inline-flex items-center gap-2 text-[#4F46E5] font-medium hover:text-[#4338CA] transition mb-6"
      >
        <ArrowLeft size={18} strokeWidth={2.5} />
        Back to {customer?.name}
      </Link>

      <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#F1F2F6] bg-[#F7F8FB]">
          <div>
            <h1
              className="text-2xl font-semibold text-[#111827] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Edit Transaction
            </h1>
            <p className="text-sm text-[#8A8F98] mt-1">Update the details below.</p>
          </div>

          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${typeStyles[oldTransaction?.type] ?? ""}`}>
            {oldTransaction?.type}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Customer</label>
              <select
                ref={customerRef}
                value={editedTransaction?.customerId ?? ""}
                onChange={(e) => handleTopLevelField("customerId", e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
              >
                {Customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">Date</label>
              <input
                type="date"
                ref={dateRef}
                value={editedTransaction?.date ?? ""}
                onChange={(e) => handleTopLevelField("date", e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
              />
            </div>
          </div>

          {editedTransaction.type === "PAYMENT" ? (
            <PaymentSection transaction={editedTransaction} handlePayments={handlePayments} paymentRef={paymentRef} />
          ) : (
            <SaleReturnSection transaction={editedTransaction} handelSaleReturn={handelSaleReturn} itemRef={itemRef} unitPriceRef={unitPriceRef} addItemRef={addItemRef} />
          )}

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">Note</label>
            <textarea
              rows={3}
              value={editedTransaction?.note ?? ""}
              onChange={(e) => handleTopLevelField("note", e.target.value)}
              placeholder="Add any additional notes..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none resize-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#F1F2F6]">
            <button
              type="button"
              onClick={() => navigate(`/customers/${customer?.id}`)}
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
        {snackbar && (<Snackbar
          message={snackbar}
          onClose={() => setSnackbar("")}
        />)}
      </div>
    </div>
  );
}

export default EditTransactions;