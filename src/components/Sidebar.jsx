import { Wallet ,LayoutDashboard, Users, Receipt, BookOpen ,Weight} from "lucide-react";
import NavItem from "./sidebar-components/Navitem";
function Sidebar() {
  const nav = [
  { key: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
  { key: "customers", label: "Customers", path: "/customers", icon: Users },
  { key: "sales", label: "Sales", path: "/sales", icon: Weight },
];
  return(<aside className="w-60 shrink-0 border-r border-[#EDEEF2] p-4 flex flex-col bg-white fixed left-0 top-0 h-screen" >
    <div className="flex items-center gap-2.5 px-2 mb-8 mt-1">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center  text-white shrink-0" style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)" }}>
        <Wallet size={25} strokeWidth={2} />
      </div>
      <span className="text-[#111827] font-semibold text-[17px] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Dukaan Khati</span>
    </div>
    <nav className="space-y-1">
      <nav>
        {nav.map((n)=>(
         <NavItem key={n.key} icon={n.icon} label={n.label} path={n.path}/>
        ))}

      </nav>
    </nav>
  </aside>);
}

export default Sidebar;