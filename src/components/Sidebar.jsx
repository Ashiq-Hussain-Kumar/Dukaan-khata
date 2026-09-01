import { Wallet, LayoutDashboard, Users, X, Weight } from "lucide-react";
import NavItem from "./sidebar-components/Navitem";

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const nav = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      key: "customers",
      label: "Customers",
      path: "/customers",
      icon: Users,
    },
    {
      key: "sales",
      label: "Sales",
      path: "/sales",
      icon: Weight,
    },
  ];

  return (
    <aside
      className={`
        w-60 z-50 shrink-0
        border-r border-[#EDEEF2]
        p-4
        flex flex-col
        bg-white
        fixed left-0 top-0 h-screen
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div className="flex items-center gap-2.5 px-2 mb-8 mt-1">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #6366F1, #4338CA)",
          }}
        >
          <Wallet size={25} strokeWidth={2} />
        </div>

        <span
          className="text-[#111827] font-semibold text-[17px] sm:font-light tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Dukaan Khati
        </span>

        <button
  type="button"
  aria-label="Close navigation"
  onClick={() => setIsSidebarOpen(false)}
  className="
    ml-auto
    w-9 h-9
    flex items-center justify-center
    rounded-lg
    border border-[#EDEEF2]
    bg-white
    text-[#576379]
    shadow-[0_1px_2px_rgba(16,24,40,0.05)]
    hover:bg-[#F7F8FB]
    hover:text-[#111827]
    transition-colors
    lg:hidden
  "
>
  <X size={20} strokeWidth={2.5} />
</button>
      </div>

      <nav className="space-y-1">
        {nav.map((n) => (
          <NavItem
            key={n.key}
            icon={n.icon}
            label={n.label}
            path={n.path}
          />
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;