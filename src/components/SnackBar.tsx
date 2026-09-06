
import { CircleAlert, X } from "lucide-react";
interface SnackbarProps{
 message:string,
 onClose:()=> void
}
function Snackbar({ message, onClose }:SnackbarProps) {
  

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-[#111827] text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">

        <CircleAlert
          size={18}
          className="text-red-400 shrink-0"
        />

        <span>{message}</span>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>

      </div>
    </div>
  );
}

export default Snackbar;