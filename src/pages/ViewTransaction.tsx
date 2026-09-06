import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import { useDataContext } from "../context/DataContext";


const typeStyles = {
  SALE: "bg-[#EEF2FF] text-[#4F46E5]",
  PAYMENT: "bg-[#ECFDF3] text-[#16A34A]",
  RETURN: "bg-[#FFF1F2] text-[#E11D48]",
};


function ViewTransaction() {
  const { Customers, Transactions, setCustomers, setTransactions } = useDataContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [deleteTransaction, setDeleteTransaction] = useState<{
    deleteOption: boolean;
    id: string | undefined |null;
  }>({
    deleteOption: false,
    id: null,
  });


  /* --------------------------------
     Find Transaction
  -------------------------------- */

  const transaction = Transactions.find(
    (t) => String(t?.id) === String(id)
  );

  /* --------------------------------
     Find Customer
  -------------------------------- */

  const customer = Customers.find(
    (c) =>
      String(c?.id) === String(transaction?.customerId)
  );

  /* --------------------------------
     Transaction Not Found
  -------------------------------- */

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center px-6">

        <div className="text-center">

          <div
            className="
              w-14 h-14
              rounded-2xl
              bg-[#EEF2FF]
              text-[#4F46E5]
              flex items-center justify-center
              mx-auto mb-4
            "
          >
            <FileText size={24} />
          </div>

          <h1 className="text-xl font-semibold text-[#111827]">
            Transaction not found
          </h1>

          <p className="text-sm text-[#8A8F98] mt-1">
            This transaction may have been deleted or does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex items-center gap-2
              mt-5
              bg-[#4F46E5]
              text-white
              text-sm font-medium
              px-4 py-2.5
              rounded-xl
              hover:bg-[#4338CA]
              transition
              cursor-pointer
            "
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

        </div>

      </div>
    );
  }

  /* --------------------------------
     Calculations
  -------------------------------- */

  const items = transaction?.items ?? [];

  const calculatedAmount =
    transaction?.type === "PAYMENT"
      ? Number(transaction?.amount ?? 0)
      : items.reduce(
        (sum, item) =>
          sum +
          Number(item?.quantity ?? 0) *
          Number(item?.unitPrice ?? 0),
        0
      );

  const finalAmount = Number(
    transaction?.amount ?? calculatedAmount
  );

  /* --------------------------------
     Handlers
  -------------------------------- */

  const handleEdit = () => {
    navigate(`/EditTransaction/${transaction.id}`);
  };


  function handleDeleteTransaction() {
    const t = Transactions.find((tr) => tr.id === deleteTransaction.id);
    const cust = Customers.find((c) => c.id === t?.customerId);

    if (t?.type === "SALE") {
      setCustomers((prev) => prev.map((c) => (c?.id === cust?.id ? { ...c, balance: cust.balance - t.amount } : c)));
    } else if (t?.type === "PAYMENT" || t?.type === "RETURN") {
      setCustomers((prev) => prev.map((c) => (c?.id === cust?.id ? { ...c, balance: cust.balance + t.amount } : c)));
    }

    setTransactions((prev) => prev.filter((tr) => tr.id !== deleteTransaction.id));
    setDeleteTransaction({ deleteOption: false, id: null });
    navigate(`/customers/${customer?.id}`);
  }

  /* --------------------------------
     Format Date
  -------------------------------- */

  const formattedDate = transaction?.date
    ? new Date(
      `${transaction.date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

  return (
    <div className="min-h-screen bg-[#F7F8FB]">

      {deleteTransaction.deleteOption && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <p className="text-sm leading-6 text-[#111827] mb-5">
              Delete this transaction? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="
          px-4 py-2 rounded-xl
          bg-[#F7F8FB] text-[#374151]
          text-sm font-medium
          border border-[#E5E7EB]
          cursor-pointer
          transition-all duration-200 ease-out
          hover:bg-[#F3F4F6]
          hover:border-[#D1D5DB]
          active:bg-[#E5E7EB]
          focus:outline-none focus:ring-2 focus:ring-[#E5E7EB]
        "
                onClick={() =>
                  setDeleteTransaction({
                    deleteOption: false,
                    id: null,
                  })
                }
              >
                Cancel
              </button>

              <button
                className="
          px-4 py-2 rounded-xl
          bg-[#E11D48] text-white
          text-sm font-medium
          cursor-pointer
          transition-all duration-200 ease-out
          hover:bg-[#BE123C]
          hover:shadow-md
          active:bg-[#9F1239]
          focus:outline-none focus:ring-2 focus:ring-[#FDA4AF] focus:ring-offset-1
        "
                onClick={handleDeleteTransaction}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ==============================
            BACK
        ============================== */}

        <Link
          to={
            customer?.id
              ? `/customers/${customer.id}`
              : "/transactions"
          }
          className="
            inline-flex items-center gap-2
            text-[#4F46E5]
            text-sm font-medium
            hover:text-[#4338CA]
            transition-colors duration-200
            mb-6
          "
        >
          <ArrowLeft
            size={17}
            strokeWidth={2.5}
          />

          {customer?.name
            ? `Back to ${customer.name}`
            : "Back to Transactions"}
        </Link>


        {/* ==============================
            PAGE HEADER
        ============================== */}

        <div className="
          flex flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-5
          mb-7
        ">

          <div>

            <div className="flex items-center gap-3 mb-2">

              <h1
                className="
                  text-3xl
                  font-semibold
                  text-[#111827]
                  tracking-tight
                "
                style={{
                  fontFamily:
                    "'Space Grotesk', sans-serif",
                }}
              >
                Transaction
              </h1>

              <span
                className={`
                  px-3 py-1
                  rounded-full
                  text-xs font-semibold
                  ${typeStyles[
                  transaction?.type
                  ] ?? ""
                  }
                `}
              >
                {transaction?.type}
              </span>

            </div>

            <p className="text-sm text-[#8A8F98]">
              View transaction details and activity
            </p>

          </div>


          {/* Actions */}

          <div className="flex items-center gap-2.5">

            <button
              type="button"
              onClick={handleEdit}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-xl
                border border-[#E5E7EB]
                bg-white
                text-[#374151]
                text-sm font-medium
                transition-all duration-200
                hover:bg-[#F7F8FB]
                hover:border-[#D1D5DB]
                active:scale-[0.98]
                cursor-pointer
              "
            >
              <Pencil size={15} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => setDeleteTransaction({ deleteOption: true, id: id })}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-xl
                bg-[#E11D48]
                text-white
                text-sm font-medium
                transition-all duration-200
                hover:bg-[#BE123C]
                hover:shadow-[0_4px_12px_rgba(225,29,72,0.20)]
                active:scale-[0.98]
                cursor-pointer
              "
            >
              <Trash2 size={15} />
              Delete
            </button>

          </div>

        </div>


        {/* ==============================
            MAIN GRID
        ============================== */}

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
        ">


          {/* ==============================
              LEFT CONTENT
          ============================== */}

          <div className="lg:col-span-2 space-y-6">


            {/* ==============================
                CUSTOMER
            ============================== */}

            <div className="
              bg-white
              rounded-2xl
              border border-[#EDEEF2]
              shadow-[0_1px_2px_rgba(16,24,40,0.04)]
            ">

              <div className="
                px-6 py-5
                border-b border-[#F1F2F6]
              ">
                <h2 className="
                  text-sm
                  font-semibold
                  text-[#111827]
                ">
                  Customer
                </h2>
              </div>

              <div className="
                p-6
                flex
                items-center
                justify-between
                gap-4
              ">

                <div className="
                  flex
                  items-center
                  gap-4
                ">

                  <div className="
                    w-12 h-12
                    rounded-xl
                    bg-[#EEF2FF]
                    text-[#4F46E5]
                    flex
                    items-center
                    justify-center
                    text-base
                    font-semibold
                  ">
                    {customer?.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>

                    <p className="
                      text-base
                      font-semibold
                      text-[#111827]
                    ">
                      {customer?.name ??
                        "Unknown Customer"}
                    </p>

                    <div className="
                      flex
                      flex-wrap
                      gap-x-4
                      gap-y-1
                      mt-1
                    ">

                      {customer?.phone && (
                        <p className="
                          text-sm
                          text-[#8A8F98]
                          flex
                          items-center
                          gap-1.5
                        ">
                          <Phone size={13} />
                          {customer.phone}
                        </p>
                      )}

                      {customer?.address && (
                        <p className="
                          text-sm
                          text-[#8A8F98]
                          flex
                          items-center
                          gap-1.5
                        ">
                          <MapPin size={13} />
                          {customer.address}
                        </p>
                      )}

                    </div>

                  </div>

                </div>


                {customer?.id && (
                  <Link
                    to={`/customers/${customer.id}`}
                    className="
                      hidden
                      sm:inline-flex
                      text-sm
                      font-medium
                      text-[#4F46E5]
                      hover:text-[#4338CA]
                      transition
                    "
                  >
                    View Customer
                  </Link>
                )}

              </div>

            </div>


            {/* ==============================
                TRANSACTION DETAILS
            ============================== */}

            <div className="
              bg-white
              rounded-2xl
              border border-[#EDEEF2]
              shadow-[0_1px_2px_rgba(16,24,40,0.04)]
              overflow-hidden
            ">

              <div className="
                px-6 py-5
                border-b border-[#F1F2F6]
              ">
                <h2 className="
                  text-sm
                  font-semibold
                  text-[#111827]
                ">
                  Transaction Details
                </h2>
              </div>


              {/* SALE / RETURN */}

              {(transaction?.type === "SALE" ||
                transaction?.type === "RETURN") && (

                  <div>

                    {/* Table Header */}

                    <div
                      className="
    grid
    grid-cols-[minmax(0,1fr)_100px_140px_140px]
    items-center
    gap-4
    px-6
    py-3
    bg-[#F7F8FB]
    border-b border-[#F1F2F6]
    text-xs
    font-medium
    text-[#8A8F98]
  "
                    >
                      <span>Item</span>

                      <span className="text-right">
                        Quantity
                      </span>

                      <span className="text-right">
                        Unit Price
                      </span>

                      <span className="text-right">
                        Total
                      </span>
                    </div>


                    {/* Items */}

                    <div className="
                    divide-y
                    divide-[#F1F2F6]
                  ">

                      {items.length > 0 ? (
                        items.map((item, index) => {
                          const itemTotal =
                            Number(item?.quantity ?? 0) *
                            Number(item?.unitPrice ?? 0);

                          return (
                            <div
                              key={item?.id ?? index}
                              className="
        grid
        grid-cols-[minmax(0,1fr)_100px_140px_140px]
        items-center
        gap-4
        px-6
        py-4
        border-b
        border-[#F1F2F6]
        last:border-0
      "
                            >
                              {/* Item */}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#111827] ">
                                  {item?.name || "Unnamed Item"}
                                </p>
                              </div>

                              {/* Quantity */}
                              <p className="text-sm text-[#374151] text-right tabular-nums">
                                {item?.quantity ?? 0}
                              </p>

                              {/* Unit Price */}
                              <p className="text-sm text-[#374151] text-right tabular-nums">
                                ₹{Number(item?.unitPrice ?? 0).toLocaleString("en-IN")}
                              </p>

                              {/* Total */}
                              <p className="text-sm font-semibold text-[#111827] text-right tabular-nums">
                                ₹{itemTotal.toLocaleString("en-IN")}
                              </p>
                            </div>
                          );
                        })) : (
                        <div className="
                        px-6 py-10
                        text-center
                        text-sm
                        text-[#8A8F98]
                      ">
                          No items in this transaction.
                        </div>
                      )}

                    </div>


                    {/* Total */}

                    <div className="
                    px-6 py-5
                    border-t border-[#F1F2F6]
                    bg-[#F7F8FB]
                    flex
                    items-center
                    justify-between
                  ">

                      <span className="
                      text-sm
                      font-medium
                      text-[#6B7280]
                    ">
                        Total Amount
                      </span>

                      <span className="
                      text-2xl
                      font-semibold
                      text-[#111827]
                    ">
                        ₹
                        {finalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>
                )}


              {/* PAYMENT */}

              {transaction?.type === "PAYMENT" && (

                <div className="p-6">

                  <div className="
                    rounded-2xl
                    bg-[#F7F8FB]
                    border border-[#EDEEF2]
                    p-6
                    flex
                    items-center
                    justify-between
                    gap-5
                  ">

                    <div>

                      <p className="
                        text-sm
                        text-[#8A8F98]
                      ">
                        Payment Received
                      </p>

                      <p className="
                        text-3xl
                        font-semibold
                        text-[#16A34A]
                        mt-2
                      ">
                        ₹
                        {finalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    <div className="
                      w-12 h-12
                      rounded-xl
                      bg-[#ECFDF3]
                      text-[#16A34A]
                      flex
                      items-center
                      justify-center
                    ">
                      <CreditCard size={21} />
                    </div>

                  </div>

                </div>
              )}

            </div>


            {/* ==============================
                RETURN REASON
            ============================== */}

            {transaction?.type === "RETURN" &&
              transaction?.return?.reason && (

                <div className="
                  bg-white
                  rounded-2xl
                  border border-[#EDEEF2]
                  shadow-[0_1px_2px_rgba(16,24,40,0.04)]
                  p-6
                ">

                  <h2 className="
                    text-sm
                    font-semibold
                    text-[#111827]
                    mb-3
                  ">
                    Return Reason
                  </h2>

                  <div className="
                    rounded-xl
                    bg-[#F7F8FB]
                    border border-[#E5E7EB]
                    px-4 py-3
                    text-sm
                    text-[#374151]
                  ">
                    {transaction.return.reason}
                  </div>

                </div>
              )}


            {/* ==============================
                NOTE
            ============================== */}

            {transaction?.note && (

              <div className="
                bg-white
                rounded-2xl
                border border-[#EDEEF2]
                shadow-[0_1px_2px_rgba(16,24,40,0.04)]
                p-6
              ">

                <h2 className="
                  text-sm
                  font-semibold
                  text-[#111827]
                  mb-3
                ">
                  Note
                </h2>

                <p className="
                  text-sm
                  text-[#4B5563]
                  leading-6
                  whitespace-pre-wrap
                ">
                  {transaction.note}
                </p>

              </div>
            )}

          </div>


          {/* ==============================
              RIGHT SIDEBAR
          ============================== */}

          <div className="space-y-6">


            {/* Amount */}

            <div className="
              bg-white
              rounded-2xl
              border border-[#EDEEF2]
              shadow-[0_1px_2px_rgba(16,24,40,0.04)]
              p-6
            ">

              <p className="
                text-sm
                font-medium
                text-[#8A8F98]
              ">
                Transaction Amount
              </p>

              <p className="
                text-3xl
                font-semibold
                text-[#111827]
                mt-2
              ">
                ₹
                {finalAmount.toLocaleString(
                  "en-IN"
                )}
              </p>

              <div className="
                mt-5
                pt-5
                border-t border-[#F1F2F6]
                space-y-3
              ">

                <div className="
                  flex
                  justify-between
                  text-sm
                ">
                  <span className="text-[#8A8F98]">
                    Type
                  </span>

                  <span className="
                    font-medium
                    text-[#111827]
                  ">
                    {transaction?.type}
                  </span>
                </div>


                <div className="
                  flex
                  justify-between
                  text-sm
                ">
                  <span className="text-[#8A8F98]">
                    Date
                  </span>

                  <span className="
                    font-medium
                    text-[#111827]
                  ">
                    {formattedDate}
                  </span>
                </div>

              </div>

            </div>


            {/* Customer Balance */}

            <div className="
              bg-white
              rounded-2xl
              border border-[#EDEEF2]
              shadow-[0_1px_2px_rgba(16,24,40,0.04)]
              p-6
            ">

              <p className="
                text-sm
                font-medium
                text-[#8A8F98]
              ">
                Customer Balance
              </p>

              <p
                className={`
                  text-2xl
                  font-semibold
                  mt-2
                  ${Number(
                  customer?.balance ?? 0
                ) > 0
                    ? "text-[#E11D48]"
                    : "text-[#16A34A]"
                  }
                `}
              >
                ₹
                {Number(
                  customer?.balance ?? 0
                ).toLocaleString("en-IN")}
              </p>

              <p className="
                text-xs
                text-[#9CA3AF]
                mt-2
              ">
                Current outstanding balance
              </p>

            </div>


            {/* Date */}

            <div className="
              bg-white
              rounded-2xl
              border border-[#EDEEF2]
              shadow-[0_1px_2px_rgba(16,24,40,0.04)]
              p-6
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-10 h-10
                  rounded-xl
                  bg-[#EEF2FF]
                  text-[#4F46E5]
                  flex
                  items-center
                  justify-center
                ">
                  <Calendar size={18} />
                </div>

                <div>

                  <p className="
                    text-xs
                    text-[#9CA3AF]
                  ">
                    Transaction Date
                  </p>

                  <p className="
                    text-sm
                    font-medium
                    text-[#111827]
                    mt-0.5
                  ">
                    {formattedDate}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default ViewTransaction;