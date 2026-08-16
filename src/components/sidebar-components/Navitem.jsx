import { NavLink } from "react-router-dom";

function NavItem({ icon: Icon, label, path }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? "bg-[#4F46E5] text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)]"
            : "text-[#6B7280] hover:bg-[#F1F2F6] hover:text-[#111827]"
        }`
      }
    >
      <Icon size={17} strokeWidth={2.1} />
      {label}
    </NavLink>
  );
}

export default NavItem;