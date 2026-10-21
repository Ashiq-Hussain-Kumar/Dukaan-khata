import { Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { RefObject } from "react";
import { useDataContext } from "../context/DataContext";
import type { NewTransactionInterface, TransactionsItem } from "../types";

type ItemRefs = Record<string, HTMLSelectElement | null>;

type SaleReturnField = "reason" | "addItem" | "delete" | "product" | "quantity";

interface SaleReturnSectionProps {
  transaction: NewTransactionInterface;
  handelSaleReturn: (id: string | null, field: SaleReturnField, value: string | null) => void;
  itemRef: RefObject<ItemRefs>;
  addItemRef: RefObject<HTMLButtonElement | null>;
  unitPriceRef?: RefObject<Record<string, HTMLInputElement | null>>;
  originalItems?: TransactionsItem[];
}

const money = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

const fieldClass =
  "w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#4F46E5] transition bg-white";

const SaleReturnSection = ({ transaction, handelSaleReturn, itemRef, addItemRef, originalItems = [] }: SaleReturnSectionProps) => {
  const { Products } = useDataContext();
  const items = transaction.items ?? [];
  const isSale = transaction.type === "SALE";

  const originalQty = (productId?: string) =>
  originalItems
    .filter((i) => i.productId === productId)
    .reduce((sum, i) => sum + i.quantity, 0);

const availableOf = (p: { id: string; stock: number }) =>
  p.stock + (isSale ? originalQty(p.id) : 0);
  const total: number = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0
  );

  return (
    <div className="space-y-5">
      {transaction.type === "RETURN" && (
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">Return Reason</label>
          <select
            value={transaction.return?.reason ?? ""}
            onChange={(e) => handelSaleReturn(null, "reason", e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
          >
            <option value="Damaged">Damaged</option>
            <option value="Expired">Expired</option>
            <option value="Wrong Item">Wrong Item</option>
            <option value="Customer Request">Customer Request</option>
          </select>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#111827]">
          {isSale ? "Items Sold" : "Returned Items"}
        </h2>
        <button
          ref={addItemRef}
          type="button"
          onClick={() => handelSaleReturn("item-" + crypto.randomUUID(), "addItem", null)}
          className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-sm font-medium px-3.5 py-2 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:bg-[#4338CA] transition cursor-pointer"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      {Products.length === 0 && (
        <p className="text-sm text-[#E11D48] bg-[#FFEEF1] rounded-xl px-4 py-3">
          You have no products yet.{" "}
          <Link to="/products" className="font-medium underline">
            Add products
          </Link>{" "}
          first.
        </p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-12 gap-3 bg-[#F7F8FB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#8A8F98]">
          <div className="col-span-4">Product</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Total</div>
          <div className="col-span-2 text-center">Action</div>
        </div>
      )}

      <div className="space-y-2.5">
        {items.map((item) => {
          const product = Products.find((p) => p.id === item.productId);
const available = product ? availableOf(product) : 0;
const tooMany = isSale && product !== undefined && Number(item.quantity) > available;
const removed = Boolean(item.productId) && !product;

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-3 items-start border border-[#EDEEF2] rounded-xl p-3 hover:border-[#4F46E5]/30 transition"
            >
              <div className="col-span-4">
                <select
                  ref={(el) => {
                    itemRef.current[item.id] = el;
                  }}
                  value={item.productId ?? ""}
                  onChange={(e) => handelSaleReturn(item.id, "product", e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select product</option>
{removed && <option value={item.productId}>{item.name} (removed)</option>}
{Products.map((p) => (
  <option key={p.id} value={p.id} disabled={isSale && availableOf(p) === 0}>
    {p.name}
    {isSale ? ` (${availableOf(p)} ${p.unit})` : ""}
  </option>
))}
                </select>

               {product && isSale && (
  <p className={`text-xs mt-1 ${tooMany ? "text-[#E11D48]" : "text-[#9AA0AA]"}`}>
    {tooMany ? `Only ${available} ${product.unit} available` : `${available} ${product.unit} available`}
  </p>
)}
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.quantity || ""}
                  onChange={(e) => handelSaleReturn(item.id, "quantity", e.target.value)}
                  className={`${fieldClass} text-center`}
                />
              </div>

              <div className="col-span-2 text-center text-sm text-[#6B7280] tabular-nums pt-2">
                {product ? money(item.unitPrice) : "—"}
              </div>

              <div className="col-span-2 text-center text-sm font-medium text-[#111827] tabular-nums pt-2">
                {money(Number(item.quantity) * Number(item.unitPrice))}
              </div>

              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => handelSaleReturn(item.id, "delete", null)}
                  className="h-9 w-9 rounded-lg bg-[#FFEEF1] text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition flex items-center justify-center cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-sm text-[#9AA0AA] text-center py-6">
            No items yet — click "Add Item" to start.
          </p>
        )}
      </div>

      <div className="border-t border-[#F1F2F6] pt-4 flex justify-between items-center">
        <span className="text-sm text-[#8A8F98]">Total</span>
        <span
          className="text-xl font-semibold text-[#111827]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {money(total)}
        </span>
      </div>
    </div>
  );
};

export default SaleReturnSection;