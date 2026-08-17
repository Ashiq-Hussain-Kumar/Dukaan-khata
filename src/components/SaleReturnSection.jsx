import { Trash2, Plus } from "lucide-react";
import  currency  from "../utils/Currency";

const SaleReturnSection = ({ transaction, handelSaleReturn, itemRef, unitPriceRef}) => {
  const total = transaction.items.reduce(
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
          {transaction.type === "SALE" ? "Items Sold" : "Returned Items"}
        </h2>
        <button
          type="button"
          onClick={() => handelSaleReturn("item-" + crypto.randomUUID(), "addItem", null)}
          className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-sm font-medium px-3.5 py-2 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:bg-[#4338CA] transition"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      {transaction.items.length > 0 && (
        <div className="grid grid-cols-12 gap-3 bg-[#F7F8FB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#8A8F98]">
          <div className="col-span-4">Item Name</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Unit Price</div>
          <div className="col-span-2 text-center">Total</div>
          <div className="col-span-2 text-center">Action</div>
        </div>
      )}

      <div className="space-y-2.5">
        {transaction.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-3 items-center border border-[#EDEEF2] rounded-xl p-3 hover:border-[#4F46E5]/30 transition"
          >
            <div className="col-span-4">
              <input
              ref={itemRef}
                value={item.name}
                onChange={(e) => handelSaleReturn(item?.id, "name", e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#4F46E5] transition"
              />
            </div>
            <div className="col-span-2">
              <input   
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handelSaleReturn(item?.id, "quantity", e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] text-center outline-none focus:border-[#4F46E5] transition"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                ref={unitPriceRef}
                min="0"
                value={item.unitPrice}
                onChange={(e) => handelSaleReturn(item?.id, "unitPrice", e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] text-center outline-none focus:border-[#4F46E5] transition"
              />
            </div>
            <div className="col-span-2 text-center text-sm font-medium text-[#111827] tabular-nums">
              {currency(item.quantity * item.unitPrice)}
            </div>
            <div className="col-span-2 flex justify-center">
              <button
                type="button"
                onClick={() => handelSaleReturn(item?.id, "delete", null)}
                className="h-9 w-9 rounded-lg bg-[#FFEEF1] text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition flex items-center justify-center"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {transaction.items.length === 0 && (
          <p className="text-sm text-[#9AA0AA] text-center py-6">No items yet — click "Add Item" to start.</p>
        )}
      </div>

      <div className="border-t border-[#F1F2F6] pt-4 flex justify-between items-center">
        <span className="text-sm text-[#8A8F98]">Total</span>
        <span
          className="text-xl font-semibold text-[#111827]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {currency(total)}
        </span>
      </div>
    </div>
  );
};

export default SaleReturnSection;