import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import currency from "../utils/Currency";
import EmptyState from "../components/Emptystate"
import { useDataContext } from "../context/DataContext";
import { ReceiptIndianRupee, ShoppingBag, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";








function Sales() {

  const { Transactions, Customers } = useDataContext();


  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all-time");
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("");

  function getFilterDate(dateFilter:string) {

    const today = new Date();

    if (dateFilter === "all-time") {
      return {
        from: null,
        to: null,
      };
    }
    else if (dateFilter === "this-month") {
      const from = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const to = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
      );
      return { from, to };
    }
    else if (dateFilter === "today") {
      const from = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const to = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );
      return { from, to };
    }
    else if (dateFilter === "this-week") {
      const from = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay()
      );

      const to = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate() + 7
      );

      return { from, to };
    }
    else if (dateFilter === "last-month") {
      const from = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const to = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      return { from, to };
    }
    else if (dateFilter === "last-3-months") {
      const from = new Date(
        today.getFullYear(),
        today.getMonth() - 3,
        1
      );
      const to = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      return { from, to };
    }
    else if (dateFilter === "this-year") {
      const from = new Date(
        today.getFullYear(),
        0,
        1
      );
      const to = new Date(
        today.getFullYear() + 1,
        0,
        1,
      );
      return { from, to };
    }
    else if (dateFilter === "custom") {
  const from = new Date(customFrom);
  const parsedTo = new Date(customTo);
  const to = new Date(parsedTo.getFullYear(), parsedTo.getMonth(), parsedTo.getDate() + 1);
  return { from, to };
}
  }

  const { from, to } = getFilterDate(dateFilter)?? {from:null,to:null};

  const filteredSales = useMemo(() => {
    const search = query.trim().toLowerCase();

    return Transactions.filter((t) => {
      if (t?.type !== "SALE") return false;

      const transactionDate = new Date(t?.date);

      const matchesSearch =
        t?.customerName?.toLowerCase()?.includes(search) ||
        t?.items?.some((it) =>
          it?.name?.toLowerCase()?.includes(search)
        );

      const matchesDate =
        (!from || transactionDate >= from) &&
        (!to || transactionDate < to);

      return matchesSearch && matchesDate;
    });
  }, [Transactions, query, from, to]);

const totalAmount = filteredSales.reduce(
  (total, s) => total + Number(s?.amount ?? 0),
  0
);

const averageSale =
  filteredSales.length > 0
    ? totalAmount / filteredSales.length
    : 0;


  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#111827] tracking-tight">
            Sales
          </h2>

          <p className="text-sm text-[#8A8F98] mt-1">
            All sale transactions across every customer.
          </p>
        </div>

        <Link
          to="/newtransaction/sale"
          className="
          inline-flex
          items-center
          gap-2
          bg-[#4F46E5]
          text-white
          px-4
          py-2.5
          rounded-xl
          text-sm
          font-medium
          shadow-[0_4px_14px_rgba(79,70,229,0.20)]
          transition-all
          duration-200
          hover:bg-[#4338CA]
          hover:shadow-[0_6px_18px_rgba(79,70,229,0.25)]
          active:scale-[0.98]
          cursor-pointer
          shrink-0
        "
        >
          + Add Sale
        </Link>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total sales"
          value={currency(totalAmount)}
          icon={ReceiptIndianRupee}
          tone="indigo"
        />

        <StatCard
          label="No. of Sales"
          value={String(filteredSales?.length) ?? 0}
          icon={ShoppingBag}
          tone="green"
        />

        <StatCard
          label="Average Sale"
          value={currency(averageSale)}
          icon={TrendingUp}
          tone="rose"
        />
      </div>


      {/* Search + Filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">

        {/* Search */}
        <div className="min-w-0 flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target?.value)}
            placeholder="Search by customer or item"
            className="
        h-11
        w-full
        rounded-xl
        border
        border-[#E5E7EB]
        bg-white
        px-4
        text-sm
        text-[#111827]
        placeholder:text-[#9CA3AF]
        outline-none
        transition-all
        duration-200
        hover:border-[#D1D5DB]
        focus:border-[#4F46E5]
        focus:ring-2
        focus:ring-[#4F46E5]/15
      "
          />
        </div>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e?.target?.value)}
          className="
      h-11
      w-full
      min-w-40
      lg:w-auto
      rounded-xl
      border
      border-[#E5E7EB]
      bg-white
      px-4
      text-sm
      font-medium
      text-[#374151]
      outline-none
      cursor-pointer
      transition-all
      duration-200
      hover:border-[#D1D5DB]
      focus:border-[#4F46E5]
      focus:ring-2
      focus:ring-[#4F46E5]/15
    "
        > 
          <option value="all-time">All time</option>
          <option value="today">Today</option>
          <option value="this-week">This week</option>
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="last-3-months">Last 3 months</option>
          <option value="this-year">This year</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilter === "custom" && (
          <div className="flex items-end gap-3">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">
                From
              </label>

              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="
            h-11
            rounded-xl
            border
            border-[#E5E7EB]
            bg-white
            px-3
            text-sm
            text-[#374151]
            outline-none
            transition-all
            duration-200
            hover:border-[#D1D5DB]
            focus:border-[#4F46E5]
            focus:ring-2
            focus:ring-[#4F46E5]/15
          "
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#6B7280]">
                To
              </label>

              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="
            h-11
            rounded-xl
            border
            border-[#E5E7EB]
            bg-white
            px-3
            text-sm
            text-[#374151]
            outline-none
            transition-all
            duration-200
            hover:border-[#D1D5DB]
            focus:border-[#4F46E5]
            focus:ring-2
            focus:ring-[#4F46E5]/15
          "
              />
            </div>

          </div>
        )}
      </div>


      {/* Sales List */}
      <div
        className="
        bg-white
        rounded-2xl
        border
        border-[#EDEEF2]
        overflow-hidden
        shadow-[0_1px_2px_rgba(16,24,40,0.04)]
      "
      >

        {/* List Header */}
        <div
          className="
          px-5
          py-4
          bg-[#F7F8FB]
          border-b
          border-[#F1F2F6]
        "
        >
          <p className="text-sm font-semibold text-[#111827]">
            Sales Transactions
          </p>

          <p className="text-xs text-[#8A8F98] mt-0.5">
            Recent sales across all customers
          </p>
        </div>


        {/* Transactions */}
        <div>
          {filteredSales.map((t) => {

            const customerBalance = Customers.find(
              (c) => String(c?.id) === String(t?.customerId)
            )?.balance ?? 0;

            return (
              <Link
                to={`/ViewTransaction/${t.id}`}
                key={t.id}
                className="
                flex
                justify-between
                items-center
                gap-4
                px-5
                py-4
                border-b
                border-[#F2F4F6]
                last:border-0
                text-sm
                transition-colors
                duration-150
                hover:bg-[#FAFAFC]
              "
              >

                {/* Customer */}
                <div className="flex items-center gap-3 min-w-0">

                  <div
                    className="
                    w-10
                    h-10
                    bg-[#EEF2FF]
                    text-[#4F46E5]
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-sm
                    font-semibold
                    shrink-0
                  "
                  >
                    {t?.customerName?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  <div className="min-w-0">

                    <p
                      className="
                      text-[#111827]
                      font-medium
                      truncate
                    "
                    >
                      {t?.customerName ?? "Unknown"}
                    </p>

                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      {t?.items?.length ?? 0} items · {t?.date}
                    </p>

                  </div>

                </div>


                {/* Amount + Balance */}
                <div className="text-right shrink-0">

                  <p
                    className="
                    text-[#111827]
                    font-semibold
                    tabular-nums
                  "
                  >
                    {currency(t?.amount)}
                  </p>

                  <p
                    className={`
                    text-xs
                    font-medium
                    mt-0.5
                    ${customerBalance > 0
                        ? "text-[#E11D48]"
                        : "text-[#16A34A]"
                      }
                  `}
                  >
                    {customerBalance > 0
                      ? `Balance ${currency(customerBalance)}`
                      : "settled"}
                  </p>

                </div>

              </Link>
            );
          })}
          {filteredSales.length === 0 && <EmptyState text="No sales match your filters." />}
        </div>

      </div>

    </div>
  );
}

export default Sales;