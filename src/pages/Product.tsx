import { useMemo, useRef, useState } from "react";
import { Plus, X, Search, Pencil, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../utils/api";
import { useDataContext } from "../context/DataContext";
import EmptyState from "../components/Emptystate";
import Snackbar from "../components/SnackBar";
import { focusField } from "../utils/focusField";
import type { Product } from "../types";

const inputClass =
  "w-full bg-[#F7F8FB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition";

function Products() {
  const { Products, refreshData, isDataLoading } = useDataContext();

  const nameRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const stockRef = useRef<HTMLInputElement | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");  
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("piece");
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q)
    );
  }, [Products, query]);

  function clearForm() {
    setEditingId(null);
    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    setUnit("piece");
  }

  function toggleForm() {
    clearForm();
    setShowForm((prev) => !prev);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category ?? "");
    setPrice(String(p.price));
    setStock(String(p.stock));
    setUnit(p.unit);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving) return;

    if (!name.trim()) {
      focusField(nameRef);
      return;
    }
    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setError("Enter a valid price");
      focusField(priceRef);
      return;
    }
    if (stock.trim() !== "" && (!Number.isFinite(Number(stock)) || Number(stock) < 0)) {
      setError("Enter a valid stock quantity");
      focusField(stockRef);
      return;
    }

   
    const body = {
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: stock.trim() === "" ? 0 : Number(stock),
      unit: unit.trim() || "piece",
    };

    setIsSaving(true);
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, body);
      } else {
        await api.post("/products/create-product", body);
      }
      await refreshData();
      clearForm();
      setShowForm(false);
    } catch (err) {
      
      setError(err instanceof ApiRequestError ? err.message : "Could not save the product");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId || isSaving) return;
    setIsSaving(true);
    try {
      await api.delete(`/products/${deleteId}`);   // the backend deactivates it, old sales keep their record
      await refreshData();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not remove the product");
    } finally {
      setDeleteId(null);
      setIsSaving(false);
    }
  }

  const deleteTarget = Products.find((p) => p.id === deleteId);

  return (
    <div>
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <p className="text-sm leading-6 text-[#111827] mb-5">
              Remove {deleteTarget?.name ?? "this product"}? It won't appear in new sales. Past
              transactions are not affected.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-[#F7F8FB] text-[#374151] text-sm font-medium border border-[#E5E7EB] cursor-pointer hover:bg-[#F3F4F6] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#E11D48] text-white text-sm font-medium cursor-pointer hover:bg-[#BE123C] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-20 bg-[#F7F8FB] pt-2 pb-3">
        <div className="flex justify-between items-center mb-4 gap-3">
          <div>
            <h2
              className="font-semibold text-[#111827] text-2xl tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Products
            </h2>
            <p className="text-sm text-[#576379]">{Products.length} in stock list</p>
          </div>

          <button
            onClick={toggleForm}
            className="flex items-center gap-2 bg-[#4F46E5] text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:bg-[#4338CA] cursor-pointer transition shrink-0"
          >
            {showForm ? <X size={16} strokeWidth={2.2} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#EDEEF2] rounded-2xl p-5 mb-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            <h3 className="text-sm font-semibold text-[#111827] mb-4">
              {editingId ? "Edit product" : "New product"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Name</label>
                <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rice 1kg" type="text" className={inputClass} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Category (optional)</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Grocery" type="text" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Price (₹)</label>
                <input ref={priceRef} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="60" type="number" min="0" step="any" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Stock</label>
                <input ref={stockRef} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" type="number" min="0" step="any" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Unit</label>
                <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="piece, kg, litre" type="text" className={inputClass} />
              </div>
            </div>

            {editingId && (
              <p className="text-xs text-[#8A8F98] mt-3">
                Stock here replaces the current number. Sales and returns change it automatically.
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 bg-[#1c1f26] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#313b49] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : editingId ? "Save changes" : "Add product"}
            </button>
          </form>
        )}

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0AA]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9AA0AA] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDEEF2] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 mt-2">
        {filtered.map((p) => {
          const stockClass =
            p.stock === 0
              ? "bg-red-100 text-red-600"
              : p.stock <= 5
                ? "bg-amber-100 text-amber-600"
                : "bg-green-100 text-green-600";

          return (
            <div
              key={p.id}
              className="flex justify-between items-center gap-3 border-b border-[#f2f4f6] py-3 last:border-0 text-sm"
            >
              <div className="min-w-0">
                <p className="text-[#111827] font-medium truncate">{p.name}</p>
                <p className="text-xs text-[#8A8F98]">
                  {p.category ? `${p.category} · ` : ""}₹{p.price.toLocaleString("en-IN")} per {p.unit}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stockClass}`}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} ${p.unit}`}
                </span>
                <button
                  onClick={() => startEdit(p)}
                  aria-label={`Edit ${p.name}`}
                  className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-[#F7F8FB] flex justify-center items-center hover:bg-[#4F46E5] hover:text-white transition cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-[#F7F8FB] flex justify-center items-center hover:bg-[#ea1038] hover:text-white transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            text={
              isDataLoading
                ? "Loading..."
                : Products.length === 0
                  ? "No products yet. Click Add Product to start."
                  : `No products match "${query}".`
            }
          />
        )}
      </div>

      <Snackbar message={error} type="error" onClose={() => setError("")} />
    </div>
  );
}

export default Products;