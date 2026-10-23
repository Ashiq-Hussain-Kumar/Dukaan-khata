import { useEffect, useState } from "react";
import { useDataContext } from "../context/DataContext";

export default function DataStatus() {
  const { isDataLoading, dataError, refreshData } = useDataContext();
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isDataLoading) {
      setIsSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setIsSlow(true), 4000);
    return () => window.clearTimeout(timer);   // cleanup if loading ends first
  }, [isDataLoading]);

  if (dataError) {
    return (
      <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <span>{dataError}</span>
        <button
          type="button"
          onClick={refreshData}
          disabled={isDataLoading}
          className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
        >
          {isDataLoading ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  if (isSlow) {
    return (
      <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Waking up the server. On the free plan the first request can take up to 30 seconds.
      </div>
    );
  }

  return null;
}