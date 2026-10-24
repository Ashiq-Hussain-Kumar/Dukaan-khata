import { useEffect } from "react";
import { CircleAlert, CheckCircle2, X } from "lucide-react";

export type SnackbarType = "success" | "error";

interface SnackbarProps {
  message: string;
  type: SnackbarType;
  onClose: () => void;
}

function SnackBar({ message, type, onClose }: SnackbarProps) {
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(onClose, 3500);

    return () => window.clearTimeout(timer);
  }, [message, type, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4 pointer-events-none">
      <div
        role={isSuccess ? "status" : "alert"}
        aria-live={isSuccess ? "polite" : "assertive"}
        className={`pointer-events-auto flex max-w-lg items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
          isSuccess ? "bg-green-700" : "bg-red-700"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={20} className="shrink-0 text-green-200" />
        ) : (
          <CircleAlert size={20} className="shrink-0 text-red-200" />
        )}

        <span className="flex-1 break-words">{message}</span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-md p-1 text-white/75 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default SnackBar;