import { useParams, useNavigate, Link } from "react-router-dom";
import { useDataContext } from "../context/DataContext";
import { useRef, useState } from "react";
import PaymentSection from "../components/PaymentSection";
import SaleReturnSection from "../components/SaleReturnSection";
import { ArrowLeft } from "lucide-react";
import { focusField } from "../utils/focusField";
import  {hasTransactionValidationError}  from "../utils/TransactionValidationError";
import Snackbar from "../components/SnackBar";


function NewTransaction() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { Customers, setCustomers, setTransactions } = useDataContext();

  const customer = Customers.find((c) => String(c?.id) === String(id));
  const upperType = type?.toUpperCase(); // "SALE" | "PAYMENT" | "RETURN"

 


  const [newTransaction, setNewTransaction] = useState({
    id: "t-" + crypto.randomUUID(),
    customerId: id,
    customerName: customer?.name ?? "",
    date: "",
    type: upperType,
    amount: "",
    note: "",
    items: [{ id: crypto.randomUUID(), name: "", quantity: 1, unitPrice: 0 }],
    payment: null,
    return: null,
  });

  const [snackbar, setSnackbar] = useState("");
  const typeStyles = {
    SALE: "bg-[#EBFBEF] text-[#16A34A]",
    PAYMENT: "bg-[#EEF0FF] text-[#4F46E5]",
    RETURN: "bg-[#FFEEF1] text-[#E11D48]",
  };

  const customerRef = useRef(null);
  const dateRef = useRef(null);
  const paymentRef = useRef(null);
  const itemRef = useRef({});
  const unitPriceRef = useRef({});
  const addItemRef = useRef(null);
  const snackbarTimer = useRef(null);

   const validTypes = ["SALE", "RETURN", "PAYMENT"];

const isValidType = validTypes.includes(upperType);


if (!isValidType) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDEEF2] p-8 text-center">
      <h1 className="text-xl font-semibold text-[#111827]">
        Invalid Transaction Type
      </h1>

      <p className="text-sm text-[#8A8F98] mt-2">
        This transaction type is not supported.
      </p>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-5 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
      >
        Go Back
      </button>
    </div>
  );
}

const isCustomerRoute = id !== undefined;

if (isCustomerRoute && !customer) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDEEF2] p-8 text-center">
      <h1 className="text-xl font-semibold text-[#111827]">
        Customer Not Found
      </h1>

      <p className="text-sm text-[#8A8F98] mt-2">
        The customer you're trying to create a transaction for does not exist.
      </p>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-5 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
      >
        Go Back
      </button>
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

  function handleTopLevelField(field, value) {
    setNewTransaction((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

   const error = hasTransactionValidationError(newTransaction);

   if (!newTransaction?.customerId) {
  showSnackbar("Please select a customer.");
  focusField(customerRef);
  return;
}

if (!newTransaction?.date) {
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




    const oldBalance =
      Customers.find(
        (c) => String(c?.id) === String(newTransaction?.customerId)
      )?.balance ?? 0;

    const finalAmount =
      newTransaction?.type === "PAYMENT"
        ? Number(newTransaction?.amount)
        : newTransaction?.items.reduce(
          (sum, item) =>
            sum +
            Number(item?.quantity) * Number(item?.unitPrice),
          0
        );

    let newBalance;

    if (newTransaction?.type === "SALE") {
      newBalance = oldBalance + finalAmount;
    } else {
      newBalance = oldBalance - finalAmount;
    }

    setCustomers((prev) =>
      prev.map((c) => {
        if (
          String(c?.id) !== String(newTransaction?.customerId)
        ) {
          return c;
        }

        return {
          ...c,
          balance: newBalance,
        };
      })
    );

    const selectedCustomer = Customers.find(
      (c) => String(c?.id) === String(newTransaction?.customerId)
    );

    const finalTransaction = {
      ...newTransaction,
      customerName: selectedCustomer?.name ?? "",
      amount: finalAmount,
      items:
        newTransaction?.type === "PAYMENT"
          ? null
          : newTransaction?.items,
    };

    setTransactions((prev) => [
      ...prev,
      finalTransaction,
    ]);

    navigate(-1);
  }
  function handelSaleReturn(id, field, value) {
    if (field === "addItem") {
      setNewTransaction((prev) => ({
        ...prev,
        items: [...prev.items, { id, name: "", quantity: 1, unitPrice: 0 }],
      }));
    } else if (field === "reason") {
      setNewTransaction((prev) => ({ ...prev, return: { reason: value } }));
    } else if (field === "delete") {
      setNewTransaction((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it?.id !== id),
      }));
    } else {

      setNewTransaction((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i?.id === id ? { ...i, [field]: value, } : i)),
      }));
    }
  }
  function handlePayments(field, value) {
    if (field !== "amount") {
      setNewTransaction((prev) => ({
        ...prev,
        payment: { ...prev.payment, [field]: value },
      }));
    } else {
      setNewTransaction((prev) => ({ ...prev, amount: value }));
    }

  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">

      {/* Header */}
      <div className="px-8 py-6 border-b border-[#F1F2F6] bg-[#F7F8FB]">

        {customer?.id && (
          <Link
            to={`/customers/${customer.id}`}
            className="
          inline-flex items-center gap-2
          text-[#4F46E5]
          text-sm font-medium
          hover:text-[#4338CA]
          transition-colors duration-200
          mb-5
        "
          >
            <ArrowLeft size={17} strokeWidth={2.5} />
            Back to {customer.name}
          </Link>
        )}

        <div className="flex items-center justify-between gap-6">
          <div>
            <h1
              className="text-2xl font-semibold text-[#111827] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              New Transaction
            </h1>

            <p className="text-sm text-[#8A8F98] mt-1">
              {customer?.name
                ? `Create a new transaction for ${customer.name}.`
                : "Enter the details to create a new transaction."}
            </p>
          </div>

          <span
            className={`
          shrink-0
          px-4 py-1.5
          rounded-full
          text-xs font-semibold
          ${typeStyles[upperType] ?? ""}
        `}
          >
            {upperType}
          </span>
        </div>
      </div>


      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-7">

        {/* Customer + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Customer
            </label>

            {customer?.id ? (
              <div
                className="
              w-full h-11
              flex items-center
              rounded-xl
              border border-[#E5E7EB]
              bg-[#F7F8FB]
              px-3.5
            "
              >
                <div className="flex items-center gap-3">

                  <div
                    className="
                  w-8 h-8
                  rounded-lg
                  bg-[#EEF2FF]
                  text-[#4F46E5]
                  flex items-center justify-center
                  text-xs font-semibold
                "
                  >
                    {customer.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <span className="text-sm font-medium text-[#111827]">
                    {customer.name}
                  </span>

                </div>
              </div>
            ) : (
              <select
                value={newTransaction?.customerId}
                ref={customerRef}
                onChange={(e) =>
                  handleTopLevelField("customerId", e.target.value)
                }
                className="
              w-full h-11
              rounded-xl
              border border-[#E5E7EB]
              bg-[#F7F8FB]
              px-3.5
              text-sm text-[#111827]
              outline-none
              transition-all duration-200
              hover:border-[#D1D5DB]
              focus:bg-white
              focus:border-[#4F46E5]
              focus:ring-2
              focus:ring-[#4F46E5]/15
            "
              >
                <option value="">Select customer</option>

                {Customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>


          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Date
            </label>

            <input
              ref={dateRef}
              type="date"
              value={newTransaction?.date ?? ""}
              onChange={(e) =>
                handleTopLevelField("date", e.target.value)
              }
              className="
            w-full h-11
            rounded-xl
            border border-[#E5E7EB]
            bg-[#F7F8FB]
            px-3.5
            text-sm text-[#111827]
            outline-none
            transition-all duration-200
            hover:border-[#D1D5DB]
            focus:bg-white
            focus:border-[#4F46E5]
            focus:ring-2
            focus:ring-[#4F46E5]/15
          "
            />
          </div>

        </div>


        {/* Transaction Details */}
        <div className="rounded-2xl border border-[#EDEEF2] overflow-hidden">

          <div className="px-5 py-4 bg-[#F7F8FB] border-b border-[#F1F2F6]">
            <h2 className="text-sm font-semibold text-[#111827]">
              Transaction Details
            </h2>

            <p className="text-xs text-[#8A8F98] mt-0.5">
              Enter the details for this {upperType.toLowerCase()}.
            </p>
          </div>

          <div className="p-5">
            {upperType === "PAYMENT" ? (
              <PaymentSection
                transaction={newTransaction}
                handlePayments={handlePayments}
                paymentRef={paymentRef}
              />
            ) : (
              <SaleReturnSection
                transaction={newTransaction}
                handelSaleReturn={handelSaleReturn}
                itemRef={itemRef} unitPriceRef={unitPriceRef} addItemRef={addItemRef}
              />
            )}
          </div>

        </div>


        {/* Note */}
        <div>
          <div className="flex items-center justify-between mb-2">

            <label className="text-sm font-medium text-[#111827]">
              Note
            </label>

            <span className="text-xs text-[#9CA3AF]">
              Optional
            </span>

          </div>

          <textarea
            rows={3}
            value={newTransaction?.note ?? ""}
            onChange={(e) =>
              handleTopLevelField("note", e.target.value)
            }
            placeholder="Add any additional notes..."
            className="
          w-full
          rounded-xl
          border border-[#E5E7EB]
          bg-[#F7F8FB]
          px-3.5 py-3
          text-sm text-[#111827]
          placeholder:text-[#9CA3AF]
          outline-none
          resize-none
          transition-all duration-200
          hover:border-[#D1D5DB]
          focus:bg-white
          focus:border-[#4F46E5]
          focus:ring-2
          focus:ring-[#4F46E5]/15
        "
          />
        </div>


        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#F1F2F6]">

          <button
            type="button"
            onClick={() =>
              customer?.id
                ? navigate(`/customers/${customer.id}`)
                : navigate(-1)
            }
            className="
          border border-[#E5E7EB]
          bg-white
          text-[#374151]
          font-medium text-sm
          px-5 py-2.5
          rounded-xl
          transition-all duration-200
          hover:bg-[#F7F8FB]
          hover:border-[#D1D5DB]
          active:scale-[0.98]
          cursor-pointer
        "
          >
            Cancel
          </button>

          <button
            type="submit"
            className="
          bg-[#4F46E5]
          text-white
          font-medium text-sm
          px-5 py-2.5
          rounded-xl
          shadow-[0_4px_14px_rgba(79,70,229,0.25)]
          transition-all duration-200
          hover:bg-[#4338CA]
          hover:shadow-[0_6px_18px_rgba(79,70,229,0.30)]
          active:scale-[0.98]
          cursor-pointer
        "
          >
            Create Transaction
          </button>

        </div>

      </form>
      {snackbar && (<Snackbar
  message={snackbar}
  onClose={() => setSnackbar("")}
/>)}
    </div>
  );
}

export default NewTransaction;