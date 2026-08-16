const PaymentSection = ({ transaction, handlePayments ,paymentRef }) => {
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#111827]">Payment Details</h2>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">Amount Paid</label>
          <input
          ref={paymentRef}
            type="number"
            min= "0"
            value={transaction.amount ?? ""}
            onChange={(e) => handlePayments("amount", e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">Payment Method</label>
          <select
            value={transaction.payment?.method ?? ""}
            onChange={(e) => handlePayments("method", e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">Reference Number</label>
          <input
            value={transaction.payment?.reference ?? ""}
            onChange={(e) => handlePayments("reference", e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">Received By</label>
          <input
            value={transaction.payment?.receivedBy ?? ""}
            onChange={(e) => handlePayments("receivedBy", e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;