import { X, Plus, Search } from "lucide-react";
import { useDataContext } from "../context/DataContext";
import React, { useMemo, useState, useRef,  } from "react";import { Link } from "react-router-dom";
import currency from "../utils/Currency";
import EmptyState from "../components/Emptystate";
import { focusField } from "../utils/focusField";
import { api, ApiRequestError } from "../utils/api";
import Snackbar from "../components/SnackBar";

function Customers() {

  const { Customers, refreshData } = useDataContext();

  const cNameRef = useRef<HTMLInputElement|null>(null);
  const cPhoneRef = useRef<HTMLInputElement|null>(null);
  const cAddressRef = useRef<HTMLInputElement|null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");

  const [isSaving, setIsSaving] = useState(false) ;
  const [error, setError] = useState("");


  const filtered = useMemo(
    () =>
      Customers.filter(
        (c) =>
          c?.name?.toLowerCase()?.includes(query.toLowerCase()) ||
          c?.phone?.toString().includes(query)
      ),
    [Customers, query]
  );

  const clearForm = () => {
    setPhone("");
    setAddress("");
    setName("");
  };

async function handleAddCustomer(e:React.SubmitEvent<HTMLFormElement>) {
  
  e.preventDefault();
  if(isSaving) return;
  setError("");

  if(!name.trim()){
    focusField(cNameRef);
    return;
  }
  if (!address.trim()) {
    focusField(cAddressRef);
    return;
  }
  if (!phone.trim()) {
    focusField(cPhoneRef);
    return;
  }
  
  if(phone.length !== 10){
    setError("Please enter a valid 10-digit mobile number");
    return;
  }

  setIsSaving(true);

  try {
    await api.post("/customers/create-customer",{
      name:name.trim(),
      address:address.trim(),
      phone:phone.trim(),
    });

    await refreshData();
    clearForm();
    setShowForm(false);
  } catch (error) {
    setError(error instanceof ApiRequestError ? error.message: "could not save the customer");
  }finally{
    setIsSaving(false);
  }

}

  function handleShowForm() {
    setShowForm(prev => !prev);
    clearForm();
  }


  return (


<div>
  {/* Sticky top section */}
  <div className="sticky top-0 z-20 bg-[#F7F8FB] pt-2 pb-3">
    {/* Title and Add Customer */}
    <div className="flex justify-between items-center mb-4 gap-3">
      <div>
        <h2
          className="font-semibold text-[#111827] text-2xl tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Customers
        </h2>
        <p className="text-sm text-[#576379]">
          {Customers.length} on record
        </p>
      </div>

      <button
        onClick={handleShowForm}
        className="flex items-center gap-2 bg-[#4F46E5] text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:bg-[#4338CA] cursor-pointer transition shrink-0"
      >
        {showForm ? (
          <X size={16} strokeWidth={2.2} />
        ) : (
          <Plus size={16} />
        )}
        {showForm ? "Cancel" : "Add Customer"}
      </button>
    </div>

    
    {showForm && (
      <form
        onSubmit={handleAddCustomer}
        className="bg-white border border-[#EDEEF2] rounded-2xl p-5 mb-4 flex flex-col sm:flex-row gap-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      >
        <input
          value={name}
          ref={cNameRef}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          type="text"
          className="min-w-0 flex-1 bg-[#F7F8FB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
          autoFocus
        />

        <input
          value={address}
          ref={cAddressRef}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          type="text"
          className="min-w-0 flex-1 bg-[#F7F8FB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
        />

        <input
          value={phone}
          ref={cPhoneRef}
          maxLength={10}
          onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          setPhone(value.slice(0, 10));
          }}
          placeholder="Phone Number"
          type="tel"
          className="min-w-0 flex-1 bg-[#F7F8FB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
        />

        <button
  type="submit"
  disabled={isSaving}
  className="bg-[#1c1f26] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#313b49] transition cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
>
  {isSaving ? "Saving..." : "Save"}
</button>
      </form>
    )}

    
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0AA]"
      />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search customers..."
        className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
      />
    </div>
  </div>

  {/* Customer list — scrolls with the page */}
  <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 mt-2">
    {filtered.map((c) => (
      <Link
        key={c.id}
        to={`/customers/${c.id}`}
        className="flex justify-between items-center border-b border-[#f2f4f6] py-3 last:border-0 text-sm hover:bg-[#F7F8FB] -mx-5 px-5 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-black text-amber-50 rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
            {c?.name?.[0] ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-[#111827] font-medium truncate">
              {c?.name ?? "Unknown"}
            </p>
            <p className="text-xs text-[#1a1f1e]">
              {c?.phone}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 ml-3">
          <p className="text-[#111827] font-medium tabular-nums">
            Balance <br />
            {currency(c?.balance)}
          </p>
        </div>
      </Link>
    ))}

    {filtered.length === 0 && (
      <EmptyState text={`No customers match "${query}".`} />
    )}
  </div>
  <Snackbar message={error} onClose={() => setError("")} />
</div>


  );
}
export default Customers;