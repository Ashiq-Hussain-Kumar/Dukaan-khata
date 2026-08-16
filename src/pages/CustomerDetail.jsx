import { useParams, Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Phone, MapPin, Plus, Wallet, Pin, Delete, ArrowDownLeft, ArrowUpRight, ShoppingBag, RotateCcw, EllipsisVertical, X , FilePlusIcon, CreditCard, RotateCcwIcon} from "lucide-react";
import currency from "../Utils/Currency";
import EmptyState from "../components/Emptystate";
import { useDataContext } from "../context/DataContext";
import { useState, useEffect } from "react";
import { getRunningBalances } from "../Utils/getRunningBalances";




function Customer() {
  const { id } = useParams();
  const { Customers, Transactions, setCustomers ,setTransactions} = useDataContext();
  const navigate = useNavigate();
  const customer = Customers.find((c) => c.id === id)


  const [mode, setMode] = useState("View");
  const [editedName, setEditedName] = useState(customer?.name);
  const [editedPhone, setEditedPhone] = useState(customer?.phone);
  const [editedAddress, setEditedAddress] = useState(customer?.address);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTransaction, setDeleteTransaction] = useState({ deleteOption: false, id: null });
  const [activeForm, setActiveForm] = useState(null); // null | "sale" | "payment" | "return"

  useEffect(() => {
    setEditedName(customer?.name);
    setEditedPhone(customer?.phone);
    setEditedAddress(customer?.address);
  }, [customer?.id]);


  

  function handleEditCustomer(e) {
    e.preventDefault();

    setCustomers((prev) => prev.map((c) => (c?.id === id ? { ...c, name: editedName, phone: editedPhone, address: editedAddress } : c)))
   setMode("View");

  }

  function handleDeleteCustomer(e) {
  e.preventDefault();
  setCustomers((prev) => prev.filter((c) => c?.id !== id));
  navigate("/customers");
}

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
}

  
 const CustomerHistory = getRunningBalances(
  Transactions.filter((t) => t?.customerId === id)
).reverse();



  if (!customer) return <EmptyState text={"Customer not found"}></EmptyState>;

  return (
    <div>
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
      <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-3 mb-4">
        <div className="flex justify-between items-start">
          {mode === 'View' ? (<div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-full bg-[#EEF0FF] text-[#4F46E5] flex items-center justify-center text-2xl font-semibold shrink-0">
              {customer?.name[0]}

            </div>
            <div>
              <p className="text-lg font-semibold text-[#111827]">{customer?.name}</p>
              <p className="text-sm text-[#8A8F98] flex items-center gap-1.5 mt-0.5"><Phone size={13} />{customer?.phone}</p>
              <p className="text-sm text-[#8A8F98] flex items-center gap-1.5 mt-0.5"><MapPin size={13} />{customer?.address}</p>
            </div>
          </div>) : mode === 'Edit' ? (<form onSubmit={handleEditCustomer} className=" p-5 mb-6 flex flex-col sm:flex-row gap-3  ">
            <input value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Name" type="text" name="" id="" className="flex-1 bg-[#F7F8FB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
              autoFocus />
            <input value={editedAddress} onChange={(e) => setEditedAddress(e.target.value)} placeholder="Address" type="text" name="" id="" className="flex-1 bg-[#F7F8FB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
            />
            <input value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} placeholder="Phone Number" type="tel" className="flex-1 bg-[#F7F8FB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
            />
            <button type="submit" className="bg-[#1c1f26] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#313b49] transition cursor-pointer"> Save</button>
          </form>) :
           (<div>
            <p className="tex-sm text-black">Are you sure you want to delete {customer?.name}? This can't be undone.</p>
            <div className="flex gap-2.5 mt-1.5">
              <button className="bg-[#E11D48] text-white text-sm font-medium px-4 py-2 rounded-xl cursor-pointer" onClick={ handleDeleteCustomer}>Yes, Delete</button>
              <button className="bg-[#F7F8FB] text-[#111827] text-sm font-medium px-4 py-2 rounded-xl cursor-pointer" onClick={()=> setMode(mode === "Delete"? "View" :"Delete")}>Cancel</button>
            </div>
          </div>)}
          <div className="flex gap-2">
            {mode !== 'Delete' && (<button onClick={() => (setMode(mode === "Edit" ? "View" : "Edit"))} className="w-9 h-9 rounded-lg border border-[#E5E7EB] bg-[#F7F8FB] flex justify-center items-center hover:bg-[#4F46E5] hover:text-[#FFFFFF] transition cursor-pointer">{mode === "Edit" ? <X size={15} /> : <Pencil size={15} />}</button>)}

            {mode !== "Edit" && (<button onClick={() => (setMode(mode === "Delete" ? "View" : "Delete"))} className="w-9 h-9 rounded-lg border border-[#E5E7EB] bg-[#F7F8FB] flex justify-center items-center hover:bg-[#ea1038] hover:text-[#FFFFFF] transition cursor-pointer">{mode === "Delete" ? <X size={15} /> : <Trash2 size={15} />}</button>)}
          </div>
          
        </div>
        <div className="ml-auto mr-4 text-right">
  <p className="text-xl text-[#8A8F98] mb-0.5">
    Balance
  </p>

  <p
    className={`text-xl  font-bold ${
      Number(customer?.balance) > 0
        ? "text-[#E11D48]"
        : Number(customer?.balance) < 0
        ? "text-[#16A34A]"
        : "text-[#111827]"
    }`}
  >
    ₹{Number(customer?.balance ?? 0).toLocaleString("en-IN")}
  </p>
</div>
      </div>
     <div className="flex gap-2.5 mb-5">
  <Link 
  to={`/customers/${id}/NewTransaction/sale`}
    className="
      flex-1 h-10 flex items-center justify-center gap-2
      rounded-xl bg-[#4F46E5] text-white
      text-sm font-medium shadow-sm
      transition-all duration-200 ease-out
      hover:bg-[#4338CA] hover:-translate-y-0.5 hover:shadow-md
      active:translate-y-0
      focus:outline-none focus:ring-2 focus:ring-[#818CF8] focus:ring-offset-2 cursor-pointer
    "
  >
    <FilePlusIcon size={16} strokeWidth={2} />
    New Invoice
  </Link>

  <Link
  to={`/customers/${id}/NewTransaction/payment`}
    
    className="
      flex-1 h-10 flex items-center justify-center gap-2
      rounded-xl bg-white text-[#374151]
      border border-[#E5E7EB]
      text-sm font-medium
      transition-all duration-200 ease-out
      hover:bg-[#F9FAFB] hover:border-[#D1D5DB]
      hover:-translate-y-0.5 hover:shadow-sm
      active:translate-y-0
      focus:outline-none focus:ring-2 focus:ring-[#D1D5DB] focus:ring-offset-2 cursor-pointer
    "
  >
    <CreditCard size={16} strokeWidth={2} />
    Record Payment
  </Link>

  <Link
    to={`/customers/${id}/NewTransaction/return`}
    className="
      flex-1 h-10 flex items-center justify-center gap-2
      rounded-xl bg-white text-[#374151]
      border border-[#E5E7EB]
      text-sm font-medium
      transition-all duration-200 ease-out
      hover:bg-[#F9FAFB] hover:border-[#D1D5DB]
      hover:-translate-y-0.5 hover:shadow-sm
      active:translate-y-0
      focus:outline-none focus:ring-2 focus:ring-[#D1D5DB] focus:ring-offset-2 cursor-pointer
    "
  >
    <RotateCcw size={16} strokeWidth={2} />
    Return
  </Link>
</div>

      <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 mb-4">
        <h2 className="font-semibold text-sm mb-1 text-[#111827]">Transaction History</h2>

        {CustomerHistory.map((t) => (
          <div
  key={t.id}
  className={`
    relative
    flex justify-between
    border-b border-[#F1F2F6]
    last:border-0
    py-3
    -mx-5
    px-5
    hover:bg-[#F7F8FB]
    transition
    ${openMenuId === t?.id ? "z-50" : "z-0"}
  `}
>
            <div className="flex items-center">
              <div className={`p-2.5 rounded-full mr-1.5 ${t?.type === 'PAYMENT' ? 'bg-green-100 text-green-600' : t?.type === 'SALE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                {t?.type === 'PAYMENT' ? <ArrowDownLeft size={20} /> : t?.type === "SALE" ? <ShoppingBag size={20} /> : <RotateCcw size={20} />}
              </div>
              <div>
                <p className="text-[#111827]">{t?.type === "PAYMENT" ? 'Payment Received' : t?.type === "SALE" ? 'Sale' : "Return"}</p>
                <p className="text-xs text-[#9AA0AA]">Note : {t?.note}</p>
                <p className="text-xs text-[#9AA0AA]">Balance: {currency(t.runningBalance)}</p>
              </div>
            </div>

            <div className="text-right pr-6">
              <p className={`font-medium tabular-nums ${t.type === 'SALE' ? 'text-[#E11D48]' : t?.type === 'RETURN' ? 'text-amber-600' : "text-[#16A34A]"}`}>
                {t.type === "SALE" ? "+ " : "− "}{currency(t.amount)}
              </p>
              <p className="text-xs text-[#9AA0AA]">{t?.date}</p>
            </div>

            <button onClick={()=>setOpenMenuId( openMenuId === t?.id ? null :t?.id)} className="absolute top-3 right-3 text-[#9AA0AA] hover:text-[#111827] transition cursor-pointer">
              <EllipsisVertical size={14} />
            </button>
            {openMenuId === t?.id && (
  <div
    className="
      absolute
      top-1
      right-7
      z-100
      min-w-28
      bg-white
      flex flex-col
      rounded-xl
      border border-[#E5E7EB]
      shadow-[0_8px_24px_rgba(15,23,42,0.12)]
      overflow-hidden
    "
  >
    <Link
      to={`/ViewTransaction/${t?.id}`}
      className="
        px-4 py-2.5
        text-sm
        text-[#111827]
        hover:bg-[#F7F8FB]
        hover:text-[#4F46E5]
        transition
      "
    >
      View
    </Link>

    <Link
      to={`/EditTransaction/${t?.id}`}
      className="
        px-4 py-2.5
        text-sm
        text-[#111827]
        hover:bg-[#F7F8FB]
        hover:text-[#4F46E5]
        transition
      "
    >
      Edit
    </Link>

    <button
      onClick={() => {
        setDeleteTransaction({
          deleteOption: true,
          id: t?.id,
        });

        setOpenMenuId(null);
      }}
      className="
        w-full
        text-left
        px-4 py-2.5
        text-sm
        text-[#111827]
        hover:bg-[#FFF1F2]
        hover:text-[#E11D48]
        transition
        cursor-pointer
      "
    >
      Delete
    </button>
  </div>
)}
          </div>
        ))}

        {CustomerHistory.length === 0 && <EmptyState text="No transactions yet for this customer." />}
      </div>
    </div>
  );
}

export default Customer;

